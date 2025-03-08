package com.example.besrc.Entities;

import com.example.besrc.utils.DateUtils;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Getter
@Setter
@Table(name = "Cinema_show")
public class Show {
    @Id
    @GeneratedValue(generator = "custom-uuid")
    @UuidGenerator
    @Column(name = "show_id", unique = true, nullable = false, length = 36, insertable = false)
    private String id;

    @ManyToOne
    @JoinColumn(name = "hall_id")
    private Hall hall;

    @ManyToOne
    @JoinColumn(name = "film_id")
    private Film film;

    @Column(name = "start_time")
    @NotNull
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private Date create_at;

    @UpdateTimestamp
    @Column(name = "update_at", nullable = true, updatable = true)
    private Date update_at;

    public Show() {}

    public Show(Hall hall, Film film, LocalDateTime startTime, LocalDateTime endTime) {
        this.hall = hall;
        this.film = film;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Show(Hall hall, Film film, String startTimeString) {
        this.hall = hall;
        this.film = film;
        this.startTime = DateUtils.convertStringDateToDate(startTimeString, "dd/MM/yyyy HH:mm");
        this.endTime = startTime.plusMinutes(this.film.getDurationInMins());
    }

    public Show(Hall hall, Film film, LocalDateTime startTime) {
        this.hall = hall;
        this.film = film;
        this.startTime = startTime;
        this.endTime = startTime.plusMinutes(film.getDurationInMins());
    }


    public Date getCreateAt() {
        return this.create_at;
    }

    public Date getUpdateAt() {
        return this.update_at;
    }
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
        updateEndTime();
    }

    public void setFilm(Film film) {
        this.film = film;
        updateEndTime();
    }
    private void updateEndTime() {
        if (this.startTime != null && this.film != null) {
            this.endTime = this.startTime.plusMinutes(this.film.getDurationInMins());
        }
    }
    @Override
    public String toString() {
        return "Show{" +
                "Id='" + id + '\'' +
                ", hall=" + (hall != null ? hall.getId() : "null") +
                ", film=" + (film != null ? film.getId() : "null") +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", createdAt=" + create_at +
                ", updatedAt=" + update_at +
                '}';
    }



}
