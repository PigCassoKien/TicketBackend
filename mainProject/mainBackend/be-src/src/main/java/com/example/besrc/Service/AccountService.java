package com.example.besrc.Service;

import com.example.besrc.Entities.Account;
import com.example.besrc.Entities.EnumEntities.ERole;
import com.example.besrc.Entities.Role;
import com.example.besrc.ServerResponse.AccountResponse;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.requestClient.AccountUpdateRequest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Set;

@Service
public interface AccountService extends UserDetailsService {
    void saveAccount(Account account);
    Role saveRole(Role role);

    Account getRawUserByUsername(String username);
    AccountResponse getUserByUsername(String username);
    AccountResponse getUserByEmail(String email);

    void addRoleToAccount(String username, ERole role);
    void removeRoleAccount(String username, ERole role);
    List<AccountResponse> getAccounts();
    Boolean isUsernameExisted(String name);
    Boolean isEmailExisted(String email);
    Boolean isPasswordValid(String password);

    @Override
    UserDetails loadUserByUsername(String username);

    AccountResponse getAccountByName(String name);
    List<AccountResponse> searchByName(String username);
    void deleteAccountByUsername(String username);
    Set<ERole> getRoleFromAccount(String username);

    boolean accountHaveRole(String username, ERole role);
    boolean accountHaveRole(Account account, ERole role);

    MyApiResponse getURIForgetPassword(String email) throws Exception;
    MyApiResponse checkRecoveryCode(String code);
    MyApiResponse setNewPassword(String code, String password);

    int countAccountFromIP(String client_ip);
    public MyApiResponse updateProfile(String username, AccountUpdateRequest request);
    }
