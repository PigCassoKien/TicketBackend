package com.example.besrc.ServicesImplement;

import com.example.besrc.Entities.Account;
import com.example.besrc.Entities.Booking;
import com.example.besrc.Entities.EnumEntities.BookingStatus;
import com.example.besrc.Entities.EnumEntities.ESeatStatus;
import com.example.besrc.Entities.EnumEntities.PaymentStatus;
import com.example.besrc.Entities.Payment;
import com.example.besrc.Entities.ShowSeat;
import com.example.besrc.Exception.BadRequestException;
import com.example.besrc.Exception.NotFoundException;
import com.example.besrc.Repository.*;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.PaymentResponse;
import com.example.besrc.Service.EmailService;
import com.example.besrc.Service.PaymentService;
import com.example.besrc.requestClient.HashRequest;
import com.example.besrc.requestClient.PaymentRequest;
import com.example.besrc.utils.VNPay;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaymentServiceImplement implements PaymentService {

    private final int SEND_MAIL_SCHEDULE = 1000;

    @Value("${payment.bank.id}")
    private String BANK_ID;

    @Value("${payment.account.no}")
    private String ACCOUNT_NO;

    @Value("${payment.account.name}")
    private String ACCOUNT_NAME;

    private static final String TEMPLATE = "compact2";

    Queue<PaymentResponse> sendEmail = new LinkedList<>();

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private CinemaShowRepository cinemaShowRepository;

    @Override
    @Transactional
    public PaymentResponse create(String username, PaymentRequest request, String ip_addr) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new BadRequestException("Booking ID: " + request.getBookingId() + " KHÔNG TÌM THẤY"));

        if (!booking.getStatus().equals(BookingStatus.PENDING)) {
            throw new BadRequestException("Booking ID: " + request.getBookingId() + " đã được thanh toán hoặc bị hủy");
        }

        List<Payment> payments = paymentRepository.findAllByBookingId(request.getBookingId());
        if (!payments.isEmpty()) {
            throw new BadRequestException("Booking ID: " + request.getBookingId() + " đã được thanh toán hoặc bị hủy");
        }

        String bookingAccount = booking.getAccount().getUsername();
        if (!username.equals(bookingAccount)) {
            throw new NotFoundException("Tên người dùng: " + username + " KHÔNG TÌM THẤY");
        }

        double price = booking.getPriceFromListSeats();
        Payment payment = new Payment(booking, price, request.getPaymentType());
        String orderId = UUID.randomUUID().toString();
        String orderInfo = String.format("%s-%s-%s", orderId, bookingAccount, System.currentTimeMillis());
        payment.setOrderId(orderId);
        payment.setOrderInfo(orderInfo);

        // Lưu và flush để đảm bảo @CreationTimestamp được áp dụng
        Payment savedPayment = paymentRepository.saveAndFlush(payment);
        PaymentResponse response = new PaymentResponse(savedPayment);

        if ("QR".equalsIgnoreCase(request.getPaymentType())) {
            String qrUrl = generateQrUrl(orderId, price, orderInfo);
            response.setPaymentUrl(qrUrl);
        } else if ("VNPAY".equalsIgnoreCase(request.getPaymentType())) {
            try {
                String vnPayUrl = VNPay.create(payment, request.getPaymentType(), ip_addr);
                response.setPaymentUrl(vnPayUrl);
            } catch (Exception e) {
                payment.setStatus(PaymentStatus.CANCELLED);
                paymentRepository.save(payment);
                throw new BadRequestException("Không thể tạo thanh toán VNPay: " + e.getMessage());
            }
        } else {
            throw new BadRequestException("Loại thanh toán không được hỗ trợ: " + request.getPaymentType());
        }

        return response;
    }

    private String generateQrUrl(String orderId, double amount, String orderInfo) {
        long amountInVnd = (long) amount;
        return String.format("https://img.vietqr.io/image/%s-%s-%s.png?amount=%d&addInfo=%s&accountName=%s",
                BANK_ID, ACCOUNT_NO, TEMPLATE, amountInVnd, orderInfo.replace(" ", "%20"), ACCOUNT_NAME);
    }

    @Override
    public PaymentResponse getFromId(String username, String paymentId) {
        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment ID: " + paymentId + " NOT FOUND"));
        if (!payment.getBooking().getAccount().getUsername().equals(username)) {
            throw new NotFoundException("Unauthorized access to payment ID: " + paymentId);
        }
        return new PaymentResponse(payment);
    }

    @Override
    public List<PaymentResponse> getAllPaymentsOfUser(String username) {
        Account account = accountRepository.getByUsername(username)
                .orElseThrow(() -> new NotFoundException("Username: " + username + " not found"));
        List<Booking> bookings = bookingRepository.findAllByAccountId(account.getId());
        List<String> bookingIds = bookings.stream().map(Booking::getId).collect(Collectors.toList());
        List<Payment> payments = paymentRepository.findAllByBookingIdIn(bookingIds);
        return payments.stream().map(PaymentResponse::new).collect(Collectors.toList());
    }

    @Override
    public boolean checkPaymentInfo(PaymentRequest request) {
        return false;
    }

    @Override
    public MyApiResponse verifyPayment(String username, String paymentId) {
        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment ID: " + paymentId + " NOT FOUND"));
        if (!payment.getBooking().getAccount().getUsername().equals(username)) {
            throw new NotFoundException("Unauthorized access to payment ID: " + paymentId);
        }
        return new MyApiResponse("OK", HttpStatus.OK.value(), "Payment status: " + payment.getStatus());
    }

    @Override
    public String createHash(HashRequest rawdata) {
        return "";
    }

    @Override
    public void addPaymentMail(Payment payment) {

    }

    @Override
    @Transactional
    public Map<String, String> handleVNPayReturn(HttpServletRequest request) {
        Map<String, String> response = new HashMap<>();
        System.out.println("IPN Request: " + request.getQueryString());

        Map<String, String> vnpParams = new TreeMap<>();
        for (String paramName : request.getParameterMap().keySet()) {
            String paramValue = request.getParameter(paramName);
            if (paramValue != null && !paramValue.isEmpty()) {
                vnpParams.put(paramName, paramValue);
            }
        }
        if (!vnpParams.containsKey("vnp_TmnCode") || !vnpParams.containsKey("vnp_Amount") ||
                !vnpParams.containsKey("vnp_BankCode") || !vnpParams.containsKey("vnp_OrderInfo") ||
                !vnpParams.containsKey("vnp_ResponseCode") || !vnpParams.containsKey("vnp_TransactionNo") ||
                !vnpParams.containsKey("vnp_TransactionStatus") || !vnpParams.containsKey("vnp_TxnRef") ||
                !vnpParams.containsKey("vnp_SecureHash")) {
            response.put("RspCode", "99");
            response.put("Message", "Missing required parameters");
            System.out.println("Missing parameters: " + response);
            return response;
        }

        String vnp_SecureHash = vnpParams.get("vnp_SecureHash");
        vnpParams.remove("vnp_SecureHash");

        StringBuilder hashData = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
            if (!first) {
                hashData.append("&");
            }
            try {
                hashData.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                        .append("=")
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
            } catch (Exception e) {
                response.put("RspCode", "99");
                response.put("Message", "Encoding failed");
                System.out.println("Encoding failed: " + e.getMessage());
                return response;
            }
            first = false;
        }

        String calculatedHash = VNPay.hmacSHA512(hashData.toString());
        System.out.println("Hash Data: " + hashData.toString());
        System.out.println("Calculated Hash: " + calculatedHash);
        System.out.println("Received Hash: " + vnp_SecureHash);
        if (!calculatedHash.equals(vnp_SecureHash)) {
            response.put("RspCode", "99");
            response.put("Message", "Invalid signature");
            System.out.println("Invalid signature: " + response);
            return response;
        }

        if (!vnpParams.get("vnp_TmnCode").equals(VNPay.getVnp_TmnCode())) {
            response.put("RspCode", "99");
            response.put("Message", "Invalid TmnCode");
            System.out.println("Invalid TmnCode: " + response);
            return response;
        }

        String vnp_TxnRef = vnpParams.get("vnp_TxnRef");
        String vnp_ResponseCode = vnpParams.get("vnp_ResponseCode");
        String vnp_TransactionStatus = vnpParams.get("vnp_TransactionStatus");
        double vnp_Amount = Double.parseDouble(vnpParams.get("vnp_Amount")) / 100;

        Optional<Payment> paymentOpt = paymentRepository.findByPaymentId(vnp_TxnRef);
        if (paymentOpt.isEmpty()) {
            response.put("RspCode", "99");
            response.put("Message", "Payment ID: " + vnp_TxnRef + " NOT FOUND");
            System.out.println("Payment not found: " + response);
            return response;
        }

        Payment payment = paymentOpt.get();
        Booking booking = payment.getBooking();
        if (booking == null) {
            response.put("RspCode", "99");
            response.put("Message", "Booking NOT FOUND");
            System.out.println("Booking not found: " + response);
            return response;
        }
        if (vnp_Amount != payment.getAmount()) {
            response.put("RspCode", "04");
            response.put("Message", "Invalid amount");
            System.out.println("Invalid amount: " + response);
            return response;
        }

        if (payment.getStatus().equals(PaymentStatus.APPROVED)) {
            response.put("RspCode", "02");
            response.put("Message", "Payment already approved");
            System.out.println("Payment already approved: " + response);
            return response;
        }

        List<ShowSeat> showSeats = booking.getSeats();
        if (showSeats == null || showSeats.isEmpty()) {
            response.put("RspCode","99");
            response.put("Message", "no seats found for Booking ID: " + booking.getId());
            return response;
        }

        if ("00".equals(vnp_ResponseCode) && "00".equals(vnp_TransactionStatus)) {
            try {
                payment.setStatus(PaymentStatus.APPROVED);
                booking.setStatus(BookingStatus.BOOKED);
                paymentRepository.save(payment);
                bookingRepository.save(booking);
                System.out.println("Updated Payment: " + payment.getPaymentId() + ", Status: " + payment.getStatus());
                System.out.println("Updated Booking: " + booking.getId() + ", Status: " + booking.getStatus());

                for (ShowSeat showSeat : showSeats) {
                    if (showSeat.getStatus() != ESeatStatus.BOOKED) {
                        showSeat.setStatus(ESeatStatus.BOOKED);
                        showSeat.setUpdate_at(new Date());
                        showSeatRepository.save(showSeat);
                        System.out.println("Updated ShowSeat: SeatIndex " + showSeat.getSeatIndex() + ", Status: " + showSeat.getStatus());
                    }
                }
                try {
                    addPaymentMail(payment);
                } catch (Exception e) {
                    System.out.println("Error sending email: " + e.getMessage());
                }
                response.put("RspCode", "00");
                response.put("Message", "Success");
            } catch (Exception e) {
                response.put("RspCode", "99");
                response.put("Message", "Error updating status: " + e.getMessage());
                System.out.println("Error updating status: " + e.getMessage());
                return response;
            }
            return response;
        } else {
            try {
                payment.setStatus(PaymentStatus.CANCELLED);
                booking.setStatus(BookingStatus.CANCELLED);
                paymentRepository.save(payment);
                bookingRepository.save(booking);
                for (ShowSeat showSeat : showSeats) {
                    if (showSeat.getStatus() != ESeatStatus.AVAILABLE) {
                        showSeat.setStatus(ESeatStatus.AVAILABLE);
                        showSeat.setUpdate_at(new Date());
                        showSeatRepository.save(showSeat);
                    }
                }
                response.put("RspCode", "01");
                response.put("Message", "Fail");
            } catch (Exception e) {
                response.put("RspCode", "99");
                response.put("Message", "Error updating status: " + e.getMessage());
                System.out.println("Error updating status: " + e.getMessage());
                return response;
            }
        }

        System.out.println("IPN Response: " + response);
        return response;
    }

    @Transactional
    public void updateBookingAndPaymentStatus(String orderId, boolean isSuccess) {
        try {
            System.out.println("Bắt đầu cập nhật trạng thái cho orderId: " + orderId + ", isSuccess: " + isSuccess);
            Payment payment = paymentRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy thanh toán cho orderId: " + orderId));
            Booking booking = payment.getBooking();
            if (booking == null) {
                System.out.println("Không tìm thấy booking cho payment: " + payment.getPaymentId());
                throw new NotFoundException("Không tìm thấy booking cho payment: " + payment.getPaymentId());
            }

            if (isSuccess) {
                payment.setStatus(PaymentStatus.APPROVED);
                booking.setStatus(BookingStatus.BOOKED);
                for (ShowSeat seat : booking.getSeats()) {
                    seat.setStatus(ESeatStatus.BOOKED);
                    showSeatRepository.saveAndFlush(seat);
                }
                System.out.println("Cập nhật payment: " + payment.getPaymentId() + " thành APPROVED và booking: " + booking.getId() + " thành BOOKED");
            } else {
                payment.setStatus(PaymentStatus.CANCELLED);
                booking.setStatus(BookingStatus.CANCELLED);
                for (ShowSeat seat : booking.getSeats()) {
                    seat.setStatus(ESeatStatus.AVAILABLE);
                    showSeatRepository.saveAndFlush(seat);
                }
                System.out.println("Cập nhật payment: " + payment.getPaymentId() + " thành CANCELLED và booking: " + booking.getId() + " thành CANCELLED");
            }

            paymentRepository.saveAndFlush(payment);
            bookingRepository.saveAndFlush(booking);
            System.out.println("Đã lưu thay đổi cho orderId: " + orderId);
        } catch (Exception e) {
            System.out.println("Lỗi khi cập nhật trạng thái cho orderId: " + orderId + ": " + e.getMessage());
            throw new RuntimeException("Lỗi khi cập nhật trạng thái: " + e.getMessage(), e);
        }
    }

    @Override
    public double getTotalPaidByAccount(String username) {
        Account account = accountRepository.getByUsername(username)
                .orElseThrow(() -> new NotFoundException("Username " + username +"not found"));

        List<Booking> bookings = bookingRepository.findAllByAccountId(account.getId());
        List<String> bookingIds = bookings.stream()
                .map(Booking::getId)
                .toList();

        List<Payment> payments = paymentRepository.findAllByBookingIdIn(bookingIds);
        return payments.stream()
                .filter(payment -> payment.getStatus().equals(PaymentStatus.APPROVED))
                .mapToDouble(Payment::getAmount)
                .sum();
    }

    @Override
    public double getTotalPaidByDay(String date) {
        LocalDate localDate;
        try {
            localDate = LocalDate.parse(date);

        } catch (Exception e) {
            throw new BadRequestException("Invalid date format");
        }

        LocalDateTime startOfDay = localDate.atStartOfDay();
        LocalDateTime endOfDay = localDate.atTime(23, 59, 59);

        Date startDate = Date.from(startOfDay.atZone(ZoneId.systemDefault()).toInstant());
        Date endDate = Date.from(endOfDay.atZone(ZoneId.systemDefault()).toInstant());

        List<Payment> payments = paymentRepository.findAllByCreateAtBetween(startDate, endDate);
        return payments.stream()
                .filter(payment -> payment.getStatus().equals(PaymentStatus.APPROVED))
                .mapToDouble(Payment::getAmount)
                .sum();
    }

    @Override
    public double getTotalPaidByMonth(String yearMonth) {
        YearMonth yearMonth1;
        try {
            yearMonth1 = YearMonth.parse(yearMonth);
        } catch (Exception e) {
            throw new BadRequestException("Invalid month format");
        }

        LocalDateTime startOfMonth = yearMonth1.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = yearMonth1.atEndOfMonth().atTime(23, 59, 59);

        Date startDate = Date.from(startOfMonth.atZone(ZoneId.systemDefault()).toInstant());
        Date endDate = Date.from(endOfMonth.atZone(ZoneId.systemDefault()).toInstant());

        List<Payment> payments = paymentRepository.findAllByCreateAtBetween(startDate, endDate);
        return payments.stream()
                .filter(payment -> payment.getStatus().equals(PaymentStatus.APPROVED))
                .mapToDouble(Payment::getAmount)
                .sum();
    }

    @Override
    public double getTotalPaidByShow(String showId) {
        if (cinemaShowRepository.existsById(showId)) {
            throw new NotFoundException("Show ID " + showId + " not found");
        }

        List<Booking> bookings = bookingRepository.findAllByShowId(showId);
        List<String> bookingIds = bookings.stream()
                .map(Booking::getId)
                .toList();

        List<Payment> payments = paymentRepository.findAllByBookingIdIn(bookingIds);
        return payments.stream()
                .filter(payment -> payment.getStatus().equals(PaymentStatus.APPROVED))
                .mapToDouble(Payment::getAmount)
                .sum();
    }

    @Override
    public MyApiResponse getMyTotalPaid() {

        String username;
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof UserDetails) {
                username = ((UserDetails) principal).getUsername();
            } else {
                username = principal.toString();
            }
        } catch (Exception e) {
            throw new BadRequestException("user is not authenticated");
        }

        Account account = accountRepository.getByUsername(username)
                .orElseThrow(() -> new NotFoundException("Username " + username +"not found"));

        List<Booking> bookings = bookingRepository.findAllByAccountId(account.getId());
        List<String> bookingIds = bookings.stream()
                .map(Booking::getId)
                .toList();

        List<Payment> payments = paymentRepository.findAllByBookingIdIn(bookingIds);
        double amount = payments.stream()
                .filter(payment -> payment.getStatus().equals(PaymentStatus.APPROVED))
                .mapToDouble(Payment::getAmount)
                .sum();
        return new MyApiResponse("OK", HttpStatus.OK.value(), "Total paid: " + amount);
    }
}
