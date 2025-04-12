package com.example.besrc.Entities;

import com.example.besrc.Entities.EnumEntities.ESeatStatus;
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
@Table(name = "Show_seat")
public class ShowSeat {

    @Id
    @UuidGenerator
    @Column(name = "show_seat_id", unique = true, nullable = false, length = 36, insertable = false)
    private String id;

    @ManyToOne
    @JoinColumn(name = "show_id", nullable = false)
    private Show show;

    @ManyToOne
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private ESeatStatus status;

    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private Date create_at;

    @UpdateTimestamp
    @Column(name = "update_at")
    private Date update_at;

    @Column(name = "seat_index", nullable = false)
    private String seatIndex;

    public ShowSeat() {}

    public ShowSeat(Show show, Seat seat, ESeatStatus status) {
        this.show = show;
        this.seat = seat;
        this.status = status;
    }

    public ShowSeat(String id, Show show, String seatIndex, ESeatStatus eSeatStatus) {
        this.id = id;
        this.show = show;
        this.seatIndex = seatIndex;
        this.status = eSeatStatus;
    }
}
