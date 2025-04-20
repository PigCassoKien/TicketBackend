package com.example.besrc.ServicesImplement;

import com.example.besrc.Entities.Booking;
import com.example.besrc.Entities.EnumEntities.BookingStatus;
import com.example.besrc.Entities.EnumEntities.ESeatStatus;
import com.example.besrc.Entities.EnumEntities.PaymentStatus;
import com.example.besrc.Entities.Payment;
import com.example.besrc.Entities.ShowSeat;
import com.example.besrc.Exception.BadRequestException;
import com.example.besrc.Exception.NotFoundException;
import com.example.besrc.Repository.AccountRepository;
import com.example.besrc.Repository.BookingRepository;
import com.example.besrc.Repository.PaymentRepository;
import com.example.besrc.Repository.ShowSeatRepository;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.PaymentResponse;
import com.example.besrc.Service.EmailService;
import com.example.besrc.Service.PaymentService;
import com.example.besrc.requestClient.HashRequest;
import com.example.besrc.requestClient.PaymentRequest;
import com.example.besrc.utils.VNPay;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class PaymentServiceImplement implements PaymentService {

    private final int SEND_MAIL_SCHEDULE = 1000;

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
    @Override
    public PaymentResponse create(String username, PaymentRequest request, String ip_addr) {
        Booking booking = bookingRepository.findById(request.getBookingId()).orElseThrow(()
                -> new BadRequestException("Booking ID: " + request.getBookingId() + " NOT FOUND"));
        if (!booking.getStatus().equals(BookingStatus.PENDING)) {
            throw new BadRequestException("Booking ID: " + request.getBookingId() + " have been already paid or cancelled");
        }
        List<Payment> payments = paymentRepository.findAllByBookingId(request.getBookingId());
        if (!payments.isEmpty()) {
            throw new BadRequestException("Booking ID: " + request.getBookingId() + " have been already paid or cancelled");
        }
        String bookingAccount = booking.getAccount().getUsername();
        if (!username.equals(bookingAccount)) {
            throw new NotFoundException("Username: " + username + " NOT FOUND");
        }
        double price = booking.getPriceFromListSeats();

        Payment payment = new Payment(booking, price);
        Payment save = paymentRepository.save(payment);

        String result = "none";
        try {
            result = VNPay.create(payment, request.getPaymentType(), ip_addr);
        } catch (Exception e) {
            payment.setStatus(PaymentStatus.CANCELLED);
        }
        save = paymentRepository.save(save);
        PaymentResponse response = new PaymentResponse(save);
        response.setPaymentUrl(result);
        return response;
    }

    @Override
    public PaymentResponse getFromId(String username, String payment_id) {
        return null;
    }

    @Override
    public List<PaymentResponse> getAllPaymentsOfUser(String username) {
        return List.of();
    }

    @Override
    public boolean checkPaymentInfo(PaymentRequest request) {
        return false;
    }

    @Override
    public MyApiResponse verifyPayment(String username, String payment_id) {
        return null;
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
}
