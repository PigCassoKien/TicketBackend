package com.example.besrc.Entities;

import com.example.besrc.Entities.EnumEntities.ERole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "Role",
        uniqueConstraints = { @UniqueConstraint(columnNames = { "name" })
        })
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO )
    @Column(name = "roleId")
    private Long roleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "name")
    private ERole name;


    public Role(Long id, ERole name) {
        this.roleId = id;
        this.name = name;
    }

    public Role(ERole name) {
        this.name = name;

    }


    public Role() {

    }
}
