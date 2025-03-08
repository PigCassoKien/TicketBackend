package com.example.besrc.Entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "category",
        uniqueConstraints = { @UniqueConstraint(columnNames = { "actegory" ,"categoryId"})
        })
public class Category {

    @Setter
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "categoryId")
    private long categoryId;

    @CreationTimestamp
    @Column(name = "CreatedAt",  updatable = false)
    private Date createdAt;

    @UpdateTimestamp
    @Column(name = "lastUpdated")
    private Date lastUpdated;

    @Setter
    @Getter
    @Column(name = "categoryName")
    private String categoryName;

    @Getter
    @Setter
    @ManyToMany(mappedBy = "categories", fetch = FetchType.LAZY)
    @JsonBackReference
    private List<Film> filmList;

    public Category() {}

    public Category(long categoryId, String categoryName) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
    }

}
