package com.example.besrc.ServerResponse;

import com.example.besrc.Entities.Account;
import com.example.besrc.Entities.EnumEntities.ERole;
import com.example.besrc.Entities.EnumEntities.UserStatus;
import com.example.besrc.Entities.Role;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Setter
@Getter
public class AccountResponse {
    String id;
    String username;
    String email;
    String address;
    String fullname;
    UserStatus status;
    String createAt;
    String updateAt;
    String[] roles;

    public AccountResponse(Account account) {
        this.id = account.getId();
        this.username = account.getUsername();
        this.fullname = account.getFullName();
        this.email = account.getEmail();
        this.address = account.getAddress();
        this.status = account.getStatus();
        this.roles = this.convertToCollection(account.getRoles());
        this.createAt = account.getCreate_at().toString();
        this.updateAt = account.getUpdate_at().toString();
    }
    
    private String[] convertToCollection(Set<Role> roles) {
        String[] res = new String[roles.size()];
        
        int i = 0;
        for (Role role : roles) {
            res[i] = String.valueOf(role.getName());
            i++;
        }
        return res;
    }

    public void setStatus(String status) {
        this.status = UserStatus.valueOf(status);
    }

}
