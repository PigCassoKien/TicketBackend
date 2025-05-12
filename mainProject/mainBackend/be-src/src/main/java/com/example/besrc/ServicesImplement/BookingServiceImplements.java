package com.example.besrc.ServicesImplement;

import com.example.besrc.Entities.*;
import com.example.besrc.Entities.EnumEntities.*;
import com.example.besrc.Exception.*;
import com.example.besrc.Repository.*;
import com.example.besrc.ServerResponse.*;
import com.example.besrc.Service.*;
import com.example.besrc.requestClient.*;
import com.example.besrc.utils.VNPay;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookingServiceImplements implements BookingService {

    private static final int MAX_SPAM = 4;
    private static final int MAX_TICKETS = 8;
    private static final int TIMEOUT_MINUTES = 5;
    private static final long CHECK_TIMEOUT_INTERVAL = 60000;
    private static final long CHECK_SPAM_INTERVAL = 30000;

    private final Queue<Account> spamAccounts = new LinkedList<>();

    @Autowired private AccountRepository accountRepository;
    @Autowired private AccountService accountService;
    @Autowired private CinemaShowRepository cinemaShowRepository;
    @Autowired private ShowSeatRepository showSeatRepository;
    @Autowired private SpamAccountRepository spamAccountRepository;
    @Autowired private PaymentService paymentService;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private BookingRepository bookingRepository;

    private boolean isSeatFull(Show show) {
        return showSeatRepository.countByShowIdAndStatus(show.getId(), ESeatStatus.AVAILABLE) == 0;
    }

    private ShowSeat validateSeat(String seatIndex, Show show) {
        System.out.println("🔍 Checking seat: " + seatIndex + " for show: " + show.getId());

        ShowSeat seat = showSeatRepository.findBySeatIndexAndShowId(seatIndex, show.getId())
                .orElseThrow(() -> new NotFoundException("Seat " + seatIndex + " not found for Show ID " + show.getId()));

        System.out.println("✅ Found seat: " + seat.getSeatIndex() + ", Status: " + seat.getStatus());

        if (!seat.getStatus().equals(ESeatStatus.AVAILABLE)) {
            throw new NotFoundException("Seat " + seatIndex + " not available for Show ID " + show.getId());
        }

        return seat;
    }

    public void updateSeatStatus(Booking booking, BookingStatus bookingStatus, ESeatStatus seatStatus) {
        booking.setStatus(bookingStatus);
        bookingRepository.save(booking);

        for (ShowSeat showSeat : booking.getSeats()) {
            showSeat.setStatus(seatStatus);
            showSeatRepository.save(showSeat);
            System.out.println("✅ Updated seat ID: " + showSeat.getId() + " -> " + seatStatus);
        }
    }

    @Override
    public BookingResponse createBooking(String username, BookingRequest request) {
        if (request.getSeatIndex().size() > MAX_TICKETS) {
            throw new BadRequestException("Max seat limit exceeded");
        }
        Account account = accountRepository.getByUsername(username)
                .orElseThrow(() -> new NotFoundException("Username " + username + " not found"));
        Show show = cinemaShowRepository.findById(request.getShowId())
                .orElseThrow(() -> new NotFoundException("Show ID " + request.getShowId() + " not found"));

        if (isSeatFull(show)) {
            throw new LockException("Seats for this show are full");
        }

        List<ShowSeat> seats = request.getSeatIndex().stream()
                .distinct()
                .map(seatIndex -> {
                    ShowSeat seat = validateSeat(seatIndex, show);
                    seat.setStatus(ESeatStatus.PENDING);
                    return showSeatRepository.save(seat);
                })
                .collect(Collectors.toList());

        Booking booking = new Booking(account, show, seats);
        return new BookingResponse(bookingRepository.save(booking));
    }

    @Override
    public MyApiResponse cancelBooking(String username, String bookingId) {
        Booking booking = validateBooking(username, bookingId);
        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.BOOKED) {
            throw new BadRequestException("Booking already " + booking.getStatus());
        }
        updateSeatStatus(booking, BookingStatus.CANCELLED, ESeatStatus.AVAILABLE);
        return new MyApiResponse("OK", HttpStatus.OK.value(), "Booking cancelled");
    }

    @Override
    public MyApiResponse setBookingStatus(String username, String bookingId, String status) {
        Booking booking = validateBooking(username, bookingId);
        BookingStatus newStatus = BookingStatus.valueOf(status.toUpperCase());
        booking.setStatus(newStatus);
        bookingRepository.save(booking);
        return new MyApiResponse("OK", HttpStatus.OK.value(), "Booking status updated to " + newStatus);
    }

    @Override
    public List<BookingResponse> getBookingList(String username) {
        Account account = accountRepository.getByUsername(username)
                .orElseThrow(() -> new NotFoundException("Username " + username + " not found"));
        List<Booking> bookings = bookingRepository.findAllByAccountId(account.getId());
        return bookings.stream().map(BookingResponse::new).collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(String username, String bookingId) {
        return new BookingResponse(validateBooking(username, bookingId));
    }

    private Booking validateBooking(String username, String bookingId) {
        Account account = accountRepository.getByUsername(username)
                .orElseThrow(() -> new NotFoundException("Username " + username + " not found"));
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking ID " + bookingId + " not found"));

        // Kiểm tra quyền truy cập
        boolean isAdminOrSuperAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN") || authority.getAuthority().equals("ROLE_SUPER_ADMIN"));

        if (!isAdminOrSuperAdmin && !account.getId().equals(booking.getAccount().getId())) {
            throw new ConflictException("Unauthorized access to booking ID " + bookingId);
        }

        return booking;
    }

    @Transactional
    @Scheduled(fixedDelay = CHECK_TIMEOUT_INTERVAL)
    public void autoCancelBooking() {
        List<Booking> pendingBookings = bookingRepository.findAllByStatus(BookingStatus.PENDING);
        LocalDateTime now = LocalDateTime.now();

        pendingBookings.forEach(booking -> {
            LocalDateTime bookingTime = booking.getCreateAt().toInstant()
                    .atZone(ZoneId.systemDefault()).toLocalDateTime();
            long minutesElapsed = Duration.between(bookingTime, now).toMinutes();

            Payment payment = paymentRepository.findAllByBookingId(booking.getId()).stream().findFirst().orElse(null);
            boolean hasPayment = payment != null;

            if (minutesElapsed >= TIMEOUT_MINUTES || (hasPayment && payment.getStatus() != PaymentStatus.PENDING)) {
                if (hasPayment && payment.getStatus() == PaymentStatus.PENDING && "VNPAY".equalsIgnoreCase(payment.getPaymentType())) {
                    try {
                        int result = VNPay.verifyPayment(payment);
                        payment.setStatus(result == 0 ? PaymentStatus.APPROVED : PaymentStatus.CANCELLED);
                        paymentRepository.save(payment);
                        System.out.println("Verified VNPay payment: " + payment.getPaymentId() + ", status: " + payment.getStatus());
                    } catch (Exception e) {
                        System.out.println("Error verifying VNPay payment: " + e.getMessage());
                    }
                }
                if (hasPayment && payment.getStatus() == PaymentStatus.APPROVED) {
                    updateSeatStatus(booking, BookingStatus.BOOKED, ESeatStatus.BOOKED);
                    paymentService.addPaymentMail(payment);
                    System.out.println("Booking " + booking.getId() + " marked as BOOKED, payment " + payment.getPaymentId() + " APPROVED");
                } else {
                    updateSeatStatus(booking, BookingStatus.CANCELLED, ESeatStatus.AVAILABLE);
                    if (hasPayment) {
                        payment.setStatus(PaymentStatus.CANCELLED);
                        paymentRepository.save(payment);
                        System.out.println("Booking " + booking.getId() + " and payment " + payment.getPaymentId() + " marked as CANCELLED");
                    }
                    spamAccounts.offer(booking.getAccount());
                    System.out.println("Account " + booking.getAccount().getUsername() + " added to spam queue for booking " + booking.getId());
                }
            }
        });
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream().map(BookingResponse::new).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MyApiResponse updateBooking(String username, String bookingId, BookingUpdateRequest updateRequest) {

        // 1. Kiểm tra quyền truy cập
        Account account = accountRepository.getByUsername(username)
                .orElseThrow(() -> new NotFoundException("Username " + username + " not found"));
        boolean isAdminOrSuperAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN") || authority.getAuthority().equals("ROLE_SUPER_ADMIN"));

        // 2. Tìm booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking ID not found"));

        // Kiểm tra quyền sở hữu hoặc vai trò admin
        if (!isAdminOrSuperAdmin && !account.getId().equals(booking.getAccount().getId())) {
            throw new ConflictException("Unauthorized access to booking ID " + bookingId);
        }

        // 3. Kiểm tra trạng thái booking cho người dùng thường
        if (!isAdminOrSuperAdmin && booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be updated by non-admins");
        }

        // 4. Xử lý thay đổi trạng thái booking
        if (updateRequest.getStatus() != null) {
            try {
                BookingStatus newStatus = BookingStatus.valueOf(String.valueOf(updateRequest.getStatus()));
                // Không cho phép chuyển từ BOOKED về PENDING
                if (booking.getStatus() == BookingStatus.BOOKED && newStatus == BookingStatus.PENDING) {
                    throw new BadRequestException("Cannot change BOOKED booking to PENDING");
                }
                // Nếu chuyển thành CANCELLED, đặt tất cả ghế về AVAILABLE
                if (newStatus == BookingStatus.CANCELLED) {
                    for (ShowSeat seat : booking.getSeats()) {
                        seat.setStatus(ESeatStatus.AVAILABLE);
                        showSeatRepository.save(seat);
                    }
                    // Không cho phép thay đổi ghế khi hủy
                    if (updateRequest.getSeatIndex() != null && !updateRequest.getSeatIndex().isEmpty()) {
                        throw new BadRequestException("Cannot update seats when cancelling booking");
                    }
                }
                booking.setStatus(newStatus);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid booking status: " + updateRequest.getStatus());
            }
        }

        // 5. Xử lý thay đổi ghế
        if (updateRequest.getSeatIndex() != null && !updateRequest.getSeatIndex().isEmpty()) {
            // Kiểm tra trạng thái booking
            if (booking.getStatus() == BookingStatus.CANCELLED ||
                    (updateRequest.getStatus() != null && BookingStatus.valueOf(String.valueOf(updateRequest.getStatus())) == BookingStatus.CANCELLED)) {
                throw new BadRequestException("Cannot update seats for CANCELLED booking");
            }

            Show show = booking.getShow();

            // Kiểm tra giới hạn số ghế
            if (updateRequest.getSeatIndex().size() > MAX_TICKETS) {
                throw new BadRequestException("Max seat limit exceeded");
            }

            // Lấy danh sách ghế hiện tại
            List<ShowSeat> currentSeats = booking.getSeats();
            List<String> currentSeatIndexes = currentSeats.stream()
                    .map(ShowSeat::getSeatIndex)
                    .toList();

            // Lấy danh sách ghế mới (loại bỏ trùng lặp)
            List<String> newSeatIndexes = updateRequest.getSeatIndex().stream()
                    .distinct()
                    .toList();

            // Đặt trạng thái ghế cũ không còn trong danh sách mới về AVAILABLE
            List<ShowSeat> seatsToMakeAvailable = currentSeats.stream()
                    .filter(seat -> !newSeatIndexes.contains(seat.getSeatIndex()))
                    .toList();

            for (ShowSeat seat : seatsToMakeAvailable) {
                seat.setStatus(ESeatStatus.AVAILABLE);
                showSeatRepository.save(seat);
            }

            // Xử lý danh sách ghế mới
            List<ShowSeat> newSeats = new ArrayList<>();
            for (String seatIndex : newSeatIndexes) {
                // Nếu ghế đã thuộc booking hiện tại, giữ nguyên ghế
                if (currentSeatIndexes.contains(seatIndex)) {
                    ShowSeat existingSeat = currentSeats.stream()
                            .filter(seat -> seat.getSeatIndex().equals(seatIndex))
                            .findFirst()
                            .orElseThrow(() -> new NotFoundException("Seat " + seatIndex + " not found in current booking"));
                    newSeats.add(existingSeat);
                } else {
                    // Kiểm tra ghế mới
                    ShowSeat seat = validateSeat(seatIndex, show);
                    seat.setStatus(ESeatStatus.BOOKED);
                    newSeats.add(showSeatRepository.save(seat));
                }
            }

            // Cập nhật danh sách ghế mới vào booking
            booking.setSeats(newSeats);
        }

        // 6. Lưu booking
        bookingRepository.save(booking);
        return new MyApiResponse("OK", HttpStatus.OK.value(), "Booking updated successfully");
    }

    @Override
    public MyApiResponse deleteBooking(String username, String bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking ID not found"));

        updateSeatStatus(booking, BookingStatus.CANCELLED, ESeatStatus.AVAILABLE);
        bookingRepository.delete(booking);
        return new MyApiResponse("OK", HttpStatus.OK.value(), "Booking deleted successfully");
    }
}