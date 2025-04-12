package com.example.besrc.Entities;

import com.example.besrc.Entities.EnumEntities.FilmStatus;
import com.example.besrc.requestClient.FilmRequest;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
@Table(
        name = "Film",
        uniqueConstraints = { @UniqueConstraint(columnNames = { "title", "film_id" }) }
)
public class Film {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "film_id")
    private Long id;

    @CreationTimestamp
    @Column(name = "createdAt", updatable = false)
    private LocalDateTime createdAt; // Changed to LocalDateTime

    @UpdateTimestamp
    @Column(name = "lastUpdated")
    private LocalDateTime lastUpdated; // Changed to LocalDateTime

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", length = 3000)
    private String description;

    @Column(name = "durationInMins")
    private int durationInMins;

    @Column(name = "language")
    private String language;

    @Column(name = "releaseDate")
    private LocalDate releaseDate; // Changed to LocalDate

    @Column(name = "country")
    private String country;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private FilmStatus status;

    @OneToMany(mappedBy = "film", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FeedBack> feedBacks = new ArrayList<>();

    @Column(name = "image")
    private String image;

    @Column(name = "large_image")
    private String largeImage;

    @Column(name = "trailer")
    private String trailer;

    @ElementCollection
    @CollectionTable(name = "FilmActors", joinColumns = @JoinColumn(name = "filmId"))
    @Column(name = "actor_name")
    private List<String> actors = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "FilmCategories", joinColumns = @JoinColumn(name = "filmId"))
    @Column(name = "category_name")
    private List<String> categories = new ArrayList<>();

    public Film() {}

    public Film(FilmRequest req) {
        this.title = req.getTitle();
        this.description = req.getDescription();
        this.durationInMins = req.getDurationInMins();
        this.language = req.getLanguage();
        // Parse the releaseDate from String to LocalDate
        this.releaseDate = LocalDate.parse(req.getReleaseDate(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        this.country = req.getCountry();
        // image and largeImage will be set by the service after file upload
        this.trailer = req.getTrailer();
        this.actors = req.getActors() != null ? new ArrayList<>(req.getActors()) : new ArrayList<>();
        this.categories = req.getCategories() != null ? new ArrayList<>(req.getCategories()) : new ArrayList<>();
        this.status = determineStatus(this.releaseDate);
    }

    public void addFeedBack(FeedBack feedBack) {
        this.feedBacks.add(feedBack);
        feedBack.setFilm(this); // Ensure bidirectional relationship
    }

    public void removeFeedBack(FeedBack feedBack) {
        this.feedBacks.remove(feedBack);
        feedBack.setFilm(null); // Ensure bidirectional relationship
    }

    private FilmStatus determineStatus(LocalDate releaseDate) {
        LocalDate now = LocalDate.now();
        return releaseDate.isAfter(now) ? FilmStatus.UPCOMING : FilmStatus.PLAYING;
    }
}