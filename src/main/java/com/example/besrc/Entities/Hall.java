package com.example.besrc.Entities;

import com.example.besrc.requestClient.HallRequest;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.util.Date;

@Getter
@Setter
@Entity
@Table(name = "Hall",
        uniqueConstraints = { @UniqueConstraint(columnNames = { "name" })}
)
public class Hall {
    @Id
    @UuidGenerator
    @Column(name = "hall_id", unique = true, nullable = false, length = 36, insertable = false)
    private String id;

    @Column(name = "name", nullable = false)
    @NotBlank
    private String name;

    @Column(name = "totalRow", nullable = false)
    @NotNull
    private Integer totalRow;

    @Column(name = "totalCol", nullable = false)
    @NotNull
    private Integer totalCol;

    @Column(name = "capacity")
    @NotNull
    private Integer capacity;

    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private Date create_at;

    @UpdateTimestamp
    @Column(name = "update_at", nullable = true, updatable = true)
    private Date update_at;

    public Hall() {}

    public Hall(HallRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("HallRequest cannot be null");
        }
        this.name = request.getHallName();
        this.totalCol = request.getTotalCol() != null ? request.getTotalCol() : 0;
        this.totalRow = request.getTotalRow() != null ? request.getTotalRow() : 0;
        this.capacity = this.totalCol * this.totalRow;
    }


    public Hall(String name, Integer totalRow, Integer totalCol) {
        this.name = name;
        this.totalCol = totalCol;
        this.totalRow = totalRow;
        this.capacity = this.totalCol * this.totalRow;
    }


    public void setTotalRow(Integer total) {
        this.totalRow = total;
        this.capacity = (this.totalCol != 0 && this.totalRow != 0) ? this.totalCol * this.totalRow : 0;
    }

    public void setTotalCol(Integer total) {
        this.totalCol = total;
        this.capacity = (this.totalCol != 0 && this.totalRow != 0) ? this.totalCol * this.totalRow : 0;
    }

}
