package com.example.besrc.Repository;

import com.example.besrc.Entities.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    @Query(value = "select p from Payment p where p.booking.id =:booking_id")
    public List<Payment> findAllByBookingId(@Param("booking_id") String booking_id);

    Optional<Payment> findByPaymentId (String paymentId);

    List<Payment> findAllByBookingIdIn(List<String> bookingIds);

    List<Payment> findAllByCreateAtBetween(Date startDate, Date endDate);
}
