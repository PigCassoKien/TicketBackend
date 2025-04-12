package com.example.besrc.ServicesImplement;

import com.example.besrc.Entities.Account;
import com.example.besrc.Entities.EnumEntities.ERole;
import com.example.besrc.Entities.Role;
import com.example.besrc.Exception.BadRequestException;
import com.example.besrc.Exception.NotFoundException;
import com.example.besrc.Repository.AccountRepository;
import com.example.besrc.Repository.RoleRepository;
import com.example.besrc.Security.InputValidationFilter;
import com.example.besrc.ServerResponse.AccountResponse;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.EmailResponse;
import com.example.besrc.Service.AccountService;
import com.example.besrc.Service.EmailService;
import com.example.besrc.requestClient.AccountUpdateRequest;
import com.example.besrc.utils.DateUtils;
import com.example.besrc.utils.RegexExtractor;
import jakarta.mail.MessagingException;
import lombok.Getter;
import lombok.Setter;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AccountServiceImplement implements AccountService {

    @Value("${app.base_recover_pass_url}")
    private String base_recover_pass_url;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private InputValidationFilter inputValidationFilter;

    @Setter
    @Getter
    private Queue<EmailResponse> emailResponseQueue = new LinkedList<>();


    private JSONObject checkToken(String code) {
        String decrypt = new String(Base64.getDecoder().decode(code), StandardCharsets.UTF_8);
        try {
            JSONObject jsonData = new JSONObject(decrypt);
            String date = jsonData.getString("expired");

            if (DateUtils.YourDateIsGreaterThanNow(date, 2)) {
                return null;
            }
            return jsonData;
        } catch (Exception e) {
            return null;
        }
    }

    @Scheduled(fixedDelay = 5000)
    public void sendRestCodeMail() throws MessagingException {
        while (!this.emailResponseQueue.isEmpty()) {
            EmailResponse data = this.emailResponseQueue.poll();
            emailService.sendVerificationMail(data.getMail(), data.getSubject(), data.getContent());

        }
    }
    @Override
    public void saveAccount(Account account) {
        accountRepository.save(account);
    }

    @Override
    public Role saveRole(Role role) {
        return roleRepository.save(role);
    }

    @Override
    public Account getRawUserByUsername(String username) {
        return accountRepository.getByUsername(username).orElseThrow(
                () -> new UsernameNotFoundException("Username: " + username + " NOT FOUND")
        );
    }

    @Override
    public AccountResponse getUserByUsername(String username) {
        Account account = accountRepository.getByUsername(username).orElse(null);
        assert account != null;
        return new AccountResponse(account);
    }

    @Override
    public AccountResponse getUserByEmail(String email) {
        Account account = accountRepository.getByEmail(email).orElseThrow(()
                -> new UsernameNotFoundException("Email: " + email + " NOT FOUND"));
        return new AccountResponse(account);
    }

    @Override
    public void addRoleToAccount(String username, ERole erole) {
        Account account = accountRepository.getByUsername(username).orElseThrow(()
                -> new NotFoundException("Username: " + username + " NOT FOUND"));
        Role role = roleRepository.findByName(erole).orElseThrow(()
                -> new NotFoundException("Role: " + erole + " NOT FOUND"));

        if (role == null) {
            role = new Role(erole);  // Nếu role không tồn tại, tạo mới
            roleRepository.save(role);
        }

        account.getRoles().add(role);
        accountRepository.save(account);
    }

    @Override
    public void removeRoleAccount(String username, ERole erole) {
        Account account = accountRepository.getByUsername(username).orElseThrow(()
                -> new UsernameNotFoundException("Username: " + username + " NOT FOUND"));
        Set<Role> oldRoles = account.getRoles();
        Set<Role> newRoles = new HashSet<>();

        for (Role role : oldRoles) {
            if (!role.getName().equals(erole)) {
                newRoles.add(role);
            }
        }
        account.setRoles(newRoles);
        accountRepository.save(account);
    }

    @Override
    public List<AccountResponse> getAccounts() {
        List<Account> list = accountRepository.findAll();
        List<AccountResponse> responses = new ArrayList<>();
        for (Account account : list) {
            responses.add(new AccountResponse(account));
        }
        return responses;
    }

    @Override
    public Boolean isUsernameExisted(String name) {
        String regex = "^[a-zA-Z0-9._]{5,}$";
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(name);

        if (!matcher.matches()) {
            throw new BadRequestException("Username invalid");
        }

        return accountRepository.existsByUsername(name);
    }
    @Override
    public Boolean isEmailExisted(String email) {
        String regex = "^(.+)@(.+)$";
        Pattern pattern = Pattern.compile(regex);

        if (!pattern.matcher(email).matches()) {
            throw new BadRequestException("Email invalid");
        }
        return accountRepository.existsByEmail(email);
    }

    @Override
    public Boolean isPasswordValid(String password) {
        Pattern pattern = Pattern.compile(RegexExtractor.GOOD_PASSWORD);
        Matcher matcher = pattern.matcher(password);

        if (!matcher.matches()) {
            throw new BadRequestException("Password is invalid. Password must have:\n + At least 8 characters long\n + Contains at least one uppercase letter\n + Contains at least one lowercase letter\n + Contains at least one digit\n + Contains at least one special character\n");
        }
        return true;
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Account account = accountRepository.getByUsername(username).orElseThrow(
                () -> new UsernameNotFoundException(" " + username + " NOT FOUND"));
        return new Account(account.getUsername(), account.getPassword(), account.getAuthorities());

    }

    @Override
    public AccountResponse getAccountByName(String name) {
        Account account = this.getRawUserByUsername(name);
        return new AccountResponse(account);
    }

    @Override
    public List<AccountResponse> searchByName(String username) {
        List<Account> list = accountRepository.findByUsernameContaining(username);
        List<AccountResponse> responses = new ArrayList<>();
        for (Account account : list) {
            responses.add(new AccountResponse(account));
        }
        return responses;
    }

    @Override
    @Transactional
    public void deleteAccountByUsername(String username) {
        accountRepository.deleteByUsername(username);

    }

    @Override
    public Set<ERole> getRoleFromAccount(String username) {
        Account account = accountRepository.getByUsername(username).orElseThrow(()
                -> new UsernameNotFoundException("Username: " + username + " NOT FOUND"));
        return account.getRoles().stream()
                .map(role -> ERole.valueOf(String.valueOf(role.getName())))  // Chuyển đổi từ Role sang ERole
                .collect(Collectors.toSet());
    }

    @Override
    public boolean accountHaveRole(String username, ERole role) {
        Set<ERole> roles = this.getRoleFromAccount(username);
        return roles.contains(role);
    }

    @Override
    public boolean accountHaveRole(Account account, ERole role) {
        return account.getRoles().contains(role);
    }

    @Override
    public MyApiResponse getURIForgetPassword(String username) throws Exception {
        Account account = accountRepository.getByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Username: " + username + " NOT FOUND"));
        JSONObject data = new JSONObject();
        data.put("username", username);
        data.put("expired", DateUtils.getDateAfter(2));
        String cypherText = Base64.getEncoder().encodeToString(data.toString().getBytes());

        this.emailResponseQueue.offer(new EmailResponse(account.getEmail(), "Film-Project: Recover your email",
                "This is your link to set new password, it will be expired in 2 hours. Please, do not share it to anyone.\n" + base_recover_pass_url + cypherText ));
        return new MyApiResponse("Check your email to reset your password");
    }

    @Override
    public MyApiResponse checkRecoveryCode(String code) {
        JSONObject decrypt = this.checkToken(code);
        if (decrypt == null) {
            throw new NotFoundException("URL not found");
        }
        return new MyApiResponse("Token is valid");
    }

    @Override
    public MyApiResponse setNewPassword(String code, String password) {
        JSONObject decrypt = this.checkToken(code);
        if (decrypt == null) {
            throw new NotFoundException("URL not found");
        }

        String username = decrypt.get("username").toString();
        Account account = accountRepository.getByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Username: " + username + " NOT FOUND"));
        if (inputValidationFilter.checkInput(password)) {
            throw new BadRequestException("Contain illegal characters");
        }
        account.setPassword(passwordEncoder.encode(password));
        accountRepository.save(account);
        return new MyApiResponse("Password has been changed successfully");
    }

    @Override
    public int countAccountFromIP(String client_ip) {
        return accountRepository.countByIp(client_ip);
    }


    @Override
    public MyApiResponse updateProfile(String username, AccountUpdateRequest request) {
        // Tìm người dùng theo username
        Account account = this.getRawUserByUsername(username);

        if (account == null) {
            throw new BadRequestException("User not found");
        }

        // Cập nhật thông tin
        account.setFullName(request.getFullName());
        account.setPhoneNumber(request.getPhoneNumber());
        account.setAddress(request.getAddress());

        // Lưu thay đổi vào DB
        accountRepository.save(account);

        return new MyApiResponse("Profile updated successfully!");
    }

}
