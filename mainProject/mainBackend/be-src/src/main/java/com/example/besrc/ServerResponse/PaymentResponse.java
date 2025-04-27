package com.example.besrc.ServerResponse;

import com.example.besrc.Entities.Payment;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PaymentResponse {
    private String id;
    private String email;
    private double price;
    private String createAt;
    private String status;
    private String paymentUrl;
    private TicketDetail ticketDetail;

    public PaymentResponse(Payment payment) {
        this.id = payment.getPaymentId();
        this.email = payment.getBooking().getAccount().getEmail();
        this.price = payment.getAmount();
        // Kiểm tra null cho createAt
        this.createAt = payment.getCreateAt() != null ? payment.getCreateAt().toString() : "";
        this.status = payment.getStatus().toString();
        this.ticketDetail = new TicketDetail(payment.getBooking());
    }
}