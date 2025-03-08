package com.example.besrc.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.util.Date;

@Entity
@Table(name = "SpamAccount")
public class SpamAccount {

    @Id
    @GeneratedValue(generator = "custom-uuid")
    @UuidGenerator
    @Column(name = "spamAccId", unique = true, nullable = false, length = 26, insertable = false)
    private String spamAccId;

    @OneToOne
    @NotNull
    private Account account;

    @NotNull
    @Column(name = "spamTimes")
    private int spamTimes;

    @UpdateTimestamp
    @Column(name = "update_at", nullable = true, updatable = true)
    private Date update_at;

    public SpamAccount() {}

    public SpamAccount(Account account) {
        this.account = account;
        this.spamTimes = 1;
    }
    public String getSpamAccId() {
        return spamAccId;
    }

    public void setSpamAccId(String spamAccId) {
        this.spamAccId = spamAccId;
    }

    public @NotNull Account getAccount() {
        return account;
    }

    public void setAccount(@NotNull Account account) {
        this.account = account;
    }

    public Date getUpdate_at() {
        return update_at;
    }

    public void setUpdate_at(Date update_at) {
        this.update_at = update_at;
    }

    public int getSpamTimes() {
        return this.spamTimes;
    }

    public void setSpamTimes(int times) {
        this.spamTimes = times;
    }


    public int increase() {
        this.spamTimes += 1;
        return this.spamTimes;
    }

}
