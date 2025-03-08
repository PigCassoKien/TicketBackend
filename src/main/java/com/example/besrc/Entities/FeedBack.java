package com.example.besrc.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.util.Date;

@Entity
@Table(name = "FeedBack")
@Getter
@Setter
public class FeedBack {

    @Id
    @GeneratedValue (generator = "customr-uuid")
    @UuidGenerator
    @Column(name = "feedback_id", unique = true, nullable = false, length = 26, insertable = false)
    private String id;

    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private Date create_at;

    @UpdateTimestamp
    @Column(name = "update_at", nullable = true, updatable = true)
    private Date update_at;

    @ManyToOne
    @JoinColumn(name = "filmId")
    private Film film;

    @ManyToOne
    @JoinColumn(name = "accountId")
    private Account account;

    @NotNull
    @Column(name = "rated")
    private int rated;

    @NotBlank
    @NotNull
    @Column(name = "feedback")
    private String feedback;

    @NotNull
    @Column(name = "liked")
    private int liked;

    @NotNull
    @Column(name = "disliked")
    private int disliked;

    public FeedBack() {}

    public FeedBack(Film film, Account account, int rated, String feedback) {
        this.film = film;
        this.account = account;
        this.rated = rated;
        this.feedback = feedback;
        this.liked = 0;
        this.disliked = 0;
    }

    @NotNull
    public int getRated() {
        return rated;
    }

    public void setRated(@NotNull int rated) {
        this.rated = rated;
    }

    public @NotBlank @NotNull String getFeedback() {
        return feedback;
    }

    public void setFeedback(@NotBlank @NotNull String feedback) {
        this.feedback = feedback;
    }

    @NotNull
    public int getLiked() {
        return liked;
    }

    public void setLiked(@NotNull int liked) {
        this.liked = liked;
    }

    @NotNull
    public int getDisliked() {
        return disliked;
    }

    public void setDisliked(@NotNull int disliked) {
        this.disliked = disliked;
    }
}
