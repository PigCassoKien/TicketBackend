package com.example.besrc.Entities;

import com.example.besrc.Entities.EnumEntities.BookingStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "booking")
public class Booking {

    @Id
    @GeneratedValue(generator = "custom-uuid")
    @UuidGenerator
    @Column(name = "bookingId", unique = true, nullable = false, length = 36, insertable = false)
    private String id;

    @ManyToOne
    @NotNull
    private Account account;

    @ManyToOne
    @NotNull
    private Show show;

    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private Date create_at;

    @UpdateTimestamp
    @Column(name = "update_at", nullable = true, updatable = true)
    private Date update_at;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private BookingStatus status;

    @ManyToMany(fetch = FetchType.EAGER)
    private List<ShowSeat> seats;
    public Booking() {}

    public Booking(Booking booking) {
        this.account = booking.getAccount();
        this.show = booking.getShow();
        this.seats = booking.getSeats();
        this.status = BookingStatus.PENDING;
    }

    public Booking(Account account, Show show, List<ShowSeat> seats) {
        this.account = account;
        this.show = show;
        this.seats = seats;
        this.status = BookingStatus.PENDING;
    }

    public Date getCreateAt() {
        return this.create_at;
    }

    public Date getUpdateAt() {
        return this.update_at;
    }

    public void addSeat(ShowSeat seat) {
        this.seats.add(seat);
    }

    public void removeSeat(ShowSeat seat) {
        this.seats.remove(seat);
    }

    public boolean isEmptySeats() {
        return this.seats.isEmpty();
    }

    public List<String> getNameOfSeats() {
        List<String> names = new ArrayList<>();
        for (ShowSeat seat : this.seats)
            names.add(seat.getSeatIndex());
        return names;
    }

    public double getPriceFromListSeats() {
        double res = 0;
        for (ShowSeat seat : this.seats)
            res += seat.getSeat().getPrice();
        return res;
    }
}
