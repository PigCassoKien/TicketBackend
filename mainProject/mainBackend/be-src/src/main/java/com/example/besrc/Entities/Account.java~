package com.example.besrc.Entities;

import com.example.besrc.Entities.EnumEntities.ERole;
import com.example.besrc.Entities.EnumEntities.UserStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serial;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "Account", uniqueConstraints = {@UniqueConstraint(columnNames =  {"username", "email"})
})
@Getter
@Setter
public class Account implements UserDetails {

    @Serial
    private static final long serialVersionUID = 2703455902235532023L;

    @Id
    @Column(name = "account_id", unique = true, nullable = false, length = 36)
    private String id;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }

//    public Account(Object o, String fullname, String username,
//                   String encode, String phoneNumber, String address,
//                   String email, String clientIp) {
//    }

    public void setPhoneNumber(@NotBlank @NotNull String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    @NotBlank
    @NotNull
    @Column(name = "username", length = 128, nullable = false)
    private String username;

    @NotBlank
    @NotNull
    @Column(name = "password", nullable = false)
    private String password;

    @NotBlank
    @NotNull
    @Column(name = "fullname", nullable = false)
    private String fullName;

    @NotBlank
    @NotNull
    @Column(name = "address", nullable = false)
    private String address;

    @NotBlank
    @NotNull
    @Email
    @Column(name = "email", length = 128, nullable = false)
    private String email;

    @NotBlank
    @NotNull
    @Column(name = "phonenumber", nullable = false)
    private String phoneNumber;

    @NotBlank
    @NotNull
    @Column(name = "ip")
    private String ip;

    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private Date create_at;

    @UpdateTimestamp
    @Column(name = "update_at", nullable = true, updatable = true)
    private Date update_at;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    @ManyToMany(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private Set<Role> roles = new HashSet<>();

    public Account() {
    }

    public Account(String id, String fullName,
                   String username, String password,
                   String phoneNumber, String address,
                   String email, String ip, UserStatus status) {
        this.id = id;
        this.fullName = fullName;
        this.username = username;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.email = email;
        this.ip = ip;
        this.status = status;
    }
    public Account(String id, String fullName,
                   String username, String password,
                   String phoneNumber, String address,
                   String email, String ip) {
        this.id = id;
        this.fullName = fullName;
        this.username = username;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.email = email;
        this.ip = ip;
    }
    public Account(AccountTemp tmp) {
        this.id = null;
        this.fullName = tmp.getFullname();
        this.username = tmp.getUsername();
        this.password = tmp.getPassword();
        this.phoneNumber = tmp.getPhone();
        this.address = tmp.getAddress();
        this.email = tmp.getEmail();
        this.ip = tmp.getIp();
        this.status = UserStatus.ACTIVE;
    }

    public Account(String username, String password, Collection<? extends GrantedAuthority> authorities) {
    }
    public void addRole(Role role) {
        this.roles.add(role);
    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().name()))  // Thêm "ROLE_" để tương thích với Spring Security
                .collect(Collectors.toList());
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
