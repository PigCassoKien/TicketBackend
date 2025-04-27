package com.example.besrc.Entities;

import com.example.besrc.Entities.EnumEntities.PaymentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.util.Date;

@Setter
@Getter
@Entity
@Table(name = "Payment")
public class Payment {

    @Id
    @GeneratedValue(generator = "custom-uuid")
    @UuidGenerator
    @Column(name = "paymentID", unique = true, nullable = false, length = 36, insertable = false)
    private String paymentId;

    @OneToOne
    private Booking booking;

    @Column(name = "amount")
    private double amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private PaymentStatus status;
    @Column(name = "order_id", unique = true)
    private String orderId;

    @Column(name = "order_info")
    private String orderInfo;

    @Column(name = "payment_type")
    private String paymentType;

    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private Date createAt;

    @UpdateTimestamp
    @Column(name = "update_at", nullable = true, updatable = true)
    private Date updateAt;

    public Payment() {}

    public Payment(Booking booking, double amount) {
        this.booking = booking;
        this.amount = amount;
        this.status = PaymentStatus.PENDING;
    }

    public Payment(Booking booking, double amount, String paymentType) {
        this.booking = booking;
        this.amount = amount;
        this.status = PaymentStatus.PENDING;
        this.paymentType = paymentType;
    }

    public void canclePayment() {
        this.status = PaymentStatus.CANCELLED;
    }

    public void returnPayment() {
        this.status = PaymentStatus.RETURNED;
    }

}
