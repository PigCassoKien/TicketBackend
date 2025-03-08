package com.example.besrc.Entities;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.example.besrc.requestClient.FilmRequest;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;

@Setter
@Getter
@Entity
@Table(name = "Film",
        uniqueConstraints = { @UniqueConstraint(columnNames = { "title", "film_id" }) }
)
public class Film {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "film_id")
    private Long id;

    @CreationTimestamp
    @Column(name = "createdAt", updatable = false)
    private Date createdAt;

    @UpdateTimestamp
    @Column(name = "lastUpdated")
    private Date lastUpdated;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", length = 3000)
    private String description;

    @Column(name = "durationInMins")
    private int durationInMins;

    @Column(name = "language")
    private String language;

    @Temporal(TemporalType.DATE)
    @Column(name = "releaseDate")
    private String releaseDate;  // Đổi từ String -> Date

    @Column(name = "country")
    private String country;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(name = "FilmCategory",
            joinColumns = @JoinColumn(name = "filmId"),
            inverseJoinColumns = @JoinColumn(name = "categoryId")
    )
    @JsonProperty(value = "categories")
    private List<Category> categories = new ArrayList<>();

    @OneToMany(mappedBy = "film", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FeedBack> feedBacks = new ArrayList<>();

    @Column(name = "image")
    private String image;

    @Column(name = "large_image")
    private String largeImage; // Sửa lại để đồng nhất cách đặt tên

    @Column(name = "trailer")
    private String trailer;

    @ElementCollection
    @CollectionTable(name = "FilmActors", joinColumns = @JoinColumn(name = "filmId"))
    @Column(name = "actor_name")
    private List<String> actors = new ArrayList<>(); // Sửa lại danh sách diễn viên

    public Film() {}

    public Film(FilmRequest req) {
        this.title = req.getTitle();
        this.description = req.getDescription();
        this.durationInMins = req.getDurationInMins();
        this.language = req.getLanguage();
        this.releaseDate = req.getReleaseDate();
        this.country = req.getCountry();
        this.image = req.getImage();
        this.largeImage = req.getLargeImage();
    }

    public void addFeedBack(FeedBack feedBack) {
        this.feedBacks.add(feedBack);
    }

    public void removeFeedBack(FeedBack feedBack) {
        this.feedBacks.remove(feedBack);
    }
}
