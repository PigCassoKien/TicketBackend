package com.example.besrc.Entities;

import com.example.besrc.Entities.EnumEntities.ESeat;
import com.example.besrc.Entities.EnumEntities.ESeatStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;

@Getter
@Setter
@Entity
@Table(name = "Seat") // Đổi tên bảng cho đúng ngữ cảnh
public class Seat {
    // Getters & Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "hall_id", nullable = false)
    private Hall hall;

    @Column(name = "rowIndex", nullable = false)
    private int rowIndex;

    @Column(name = "colIndex", nullable = false)
    private int colIndex;

    @Enumerated(EnumType.STRING)
    @Column(name = "seatType", nullable = false)
    private ESeat seatType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ESeatStatus status = ESeatStatus.AVAILABLE;

    @Column(name = "price", nullable = false)
    private double price;

    @Column(name = "name", nullable = false)
    private String name;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = true)
    private Date updatedAt;

    public Seat() {}

    public Seat(Hall hall, int rowIndex, int colIndex, ESeat type) {
        this.hall = hall;
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
        this.seatType = type;
        this.name = hall.getName() + rowIndex + "." + colIndex;

        this.price = type == ESeat.VIP ? 100000 : 80000;
    }
    public void setSeatType(ESeat seatType) {
        this.seatType = seatType;
        this.price = seatType == ESeat.VIP ? 100000 : 80000;
    }



}
