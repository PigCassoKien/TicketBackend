package com.example.besrc.ServicesImplement;

import com.example.besrc.Entities.Booking;
import com.example.besrc.Entities.EnumEntities.BookingStatus;
import com.example.besrc.Entities.EnumEntities.PaymentStatus;
import com.example.besrc.Entities.Payment;
import com.example.besrc.Exception.BadRequestException;
import com.example.besrc.Exception.NotFoundException;
import com.example.besrc.Repository.AccountRepository;
import com.example.besrc.Repository.BookingRepository;
import com.example.besrc.Repository.PaymentRepository;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.PaymentResponse;
import com.example.besrc.Service.EmailService;
import com.example.besrc.Service.PaymentService;
import com.example.besrc.requestClient.HashRequest;
import com.example.besrc.requestClient.PaymentRequest;
import com.example.besrc.utils.VNPay;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

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
}
