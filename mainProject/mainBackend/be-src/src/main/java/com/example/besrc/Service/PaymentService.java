package com.example.besrc.Service;

import com.example.besrc.Entities.Payment;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.PaymentResponse;
import com.example.besrc.requestClient.HashRequest;
import com.example.besrc.requestClient.PaymentRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public interface PaymentService {
    public PaymentResponse create(String username, PaymentRequest request, String ip_addr);
    public PaymentResponse getFromId(String username, String payment_id);
    public List<PaymentResponse> getAllPaymentsOfUser(String username);
    public boolean checkPaymentInfo(PaymentRequest request);
    public MyApiResponse verifyPayment(String username, String payment_id);

    public String createHash(HashRequest rawdata);
    public void addPaymentMail(Payment payment);

    Map<String, String> handleVNPayReturn(HttpServletRequest request);
}
