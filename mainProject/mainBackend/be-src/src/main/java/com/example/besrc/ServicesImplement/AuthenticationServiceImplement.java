package com.example.besrc.ServicesImplement;

import com.example.besrc.Entities.Account;
import com.example.besrc.Entities.AccountTemp;
import com.example.besrc.Entities.EnumEntities.ERole;
import com.example.besrc.Entities.JWTToken;
import com.example.besrc.Exception.BadRequestException;
import com.example.besrc.Exception.DenyAccessException;
import com.example.besrc.Repository.AccountRepository;
import com.example.besrc.Repository.AccountTempRepository;
import com.example.besrc.Security.InputValidationFilter;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.AuthenticTokenResponse;
import com.example.besrc.ServerResponse.AuthenticationResponse;
import com.example.besrc.ServerResponse.EmailResponse;
import com.example.besrc.Service.AccountService;
import com.example.besrc.Service.AuthenticationService;
import com.example.besrc.Service.EmailService;
import com.example.besrc.Service.JWTokenService;
import com.example.besrc.requestClient.LoginRequest;
import com.example.besrc.requestClient.SignUpRequest;
import com.example.besrc.utils.VerificationCodeUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.GrantedAuthority;



import java.util.*;

import static com.example.besrc.Entities.EnumEntities.UserStatus.ACTIVE;

@Service
public class AuthenticationServiceImplement implements AuthenticationService {

    @Value("${app.redirectURL}")
    private String redirectURL;

    @Value("${app.base_verified_url}")
    private String base_verified_url;

    @Autowired
    private AccountService accountService;

    @Autowired
    private AccountTempRepository accountTempRepository;

    @Autowired
    private InputValidationFilter inputValidationFilter;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JWTokenService jwTokenService;

    private final Queue<EmailResponse> mailQueue = new LinkedList<>();
    @Autowired
    private AccountRepository accountRepository;

    private List<String> createTokens(String rawIP, Account account, AuthenticTokenResponse data, boolean isUpdate) {
        Collection<String> ip = new ArrayList<>();
        ip.add(rawIP);
        Map<String, Object> ip_addr = new HashMap<>();
        ip_addr.put("ip_addr", ip);

        Map<String, Object> list_roles = new HashMap<>();
        list_roles.put("roles", account.getAuthorities());

        String accessToken = jwtService.generateToken(list_roles, account);
        String refreshToken = jwtService.generateRefreshToken(ip_addr, account);
        JWTToken save;

        if (!isUpdate) {
            save = jwTokenService.saveInfo(account, accessToken, refreshToken);
        } else {
            save = jwTokenService.updateInfo(data.getData(), accessToken, refreshToken);
        }

        List<String> tokens = new ArrayList<>();
        tokens.add(accessToken);
        tokens.add(save.getRefreshToken());
        return tokens;
    }

    public MyApiResponse signUp(SignUpRequest request, String client_ip) {

        String username = inputValidationFilter.sanitizeInput(request.getUsername()).toLowerCase();
        String password = inputValidationFilter.sanitizeInput(request.getPassword());
        String email = inputValidationFilter.sanitizeInput(request.getEmail()).toLowerCase();
        String fullname = inputValidationFilter.sanitizeInput(request.getFullName());

        if (inputValidationFilter.checkInput(username + " " + password + " " + email + " " + fullname))
            throw new BadRequestException("Data contains illegal characters");

        if (accountService.isUsernameExisted(username) || accountTempRepository.existsByUsername(username))
            throw new BadRequestException("Username is already registered or waiting for email verification");

        if (accountService.isEmailExisted(email) || accountTempRepository.existsByEmail(email))
            throw new BadRequestException("Email is already registered or waiting for email verification");

        if (!accountService.isPasswordValid(password))
            throw new BadRequestException("Password is too weak");

        // ✅ Bật xác minh email
        boolean verifyEmail = true;

        if (!verifyEmail) {
            // ✅ Không cần xác minh email -> Đăng ký ngay
            Account account = new Account(null, fullname, username, passwordEncoder.encode(password),
                    request.getPhoneNumber(), request.getAddress(), email, client_ip);

            accountService.addRoleToAccount(username, ERole.USER);
            account.setStatus(ACTIVE);
            accountService.saveAccount(account);

            return new MyApiResponse("Your account has been successfully registered");
        } else {
            // ✅ Cần xác minh email -> Lưu vào bảng AccountTemp
            String verificationCode = VerificationCodeUtil.generateCode();

            AccountTemp accountTemp = new AccountTemp(null, fullname, username, passwordEncoder.encode(password),
                    request.getPhoneNumber(), request.getAddress(), email, verificationCode, client_ip);

            accountTempRepository.save(accountTemp);

            // ✅ Tạo email xác nhận
            String emailContent = "<p>Chào " + fullname + ",</p>"
                    + "<p>Mã xác nhận của bạn: <b>" + verificationCode + "</b></p>"
                    + "<p>Mã này sẽ hết hạn sau 10 phút.</p>"
                    + "<p>Nếu bạn không đăng ký, hãy bỏ qua email này.</p>"
                    + "<p>Cảm ơn!</p>";

            // ✅ Thêm vào hàng chờ gửi email
            System.out.println("📩 Adding email to queue: " + email);
            this.mailQueue.offer(new EmailResponse(email, "Verify your email", emailContent));
            System.out.println("📊 Queue size after adding: " + this.mailQueue.size());

            return new MyApiResponse("Check your email for the verification code.");
        }
    }

    @Override
    public AuthenticationResponse logIn(LoginRequest request, HttpServletRequest servletRequest, boolean adminLogin) {
        String username = inputValidationFilter.sanitizeInput(request.getUsername());
        String password = request.getPassword();

        if (inputValidationFilter.checkInput(username + " " + password)) {
            throw new BadRequestException("Contain illegal contents");
        }

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        } catch (BadCredentialsException e) {
            throw new DenyAccessException("Username or password is wrong");
        }

        Account account = accountService.getRawUserByUsername(username);

        if (adminLogin && !accountService.accountHaveRole(account, ERole.ADMIN)) {
            throw new UsernameNotFoundException("User not found");
        }

        // Chuyển đổi Account thành UserDetails để sử dụng generateToken(UserDetails)
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                account.getUsername(),
                account.getPassword(),
                account.getAuthorities()
        );
        Map<String, Object> extraClaims = new HashMap<>();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
        extraClaims.put("roles", roles);

        // Sử dụng generateToken(userDetails) để tạo accessToken
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(extraClaims,userDetails);

        jwTokenService.saveInfo(account, accessToken, refreshToken);

        return new AuthenticationResponse(accessToken, refreshToken, username, account.getEmail(), account.getFullName(), account.getPhoneNumber());
    }


    @Transactional
    @Override
    public ResponseEntity<?> verifyEmail(String email, String code, HttpServletResponse response) {
        Optional<AccountTemp> accountTempOpt = accountTempRepository.findByEmail(email);

        if (accountTempOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Email not found.");
        }

        AccountTemp accountTemp = accountTempOpt.get();

        // Kiểm tra xem mã OTP có hết hạn không
        if (accountTemp.isExpired()) {
            accountTempRepository.delete(accountTemp);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Verification code has expired. Please sign up again.");
        }

        // Kiểm tra xem mã OTP có khớp không
        if (!accountTemp.getCode().equals(code)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid verification code.");
        }

        // ✅ Tạo tài khoản chính thức
        Account user = new Account(accountTemp);
        accountService.saveAccount(user);
        accountService.addRoleToAccount(user.getUsername(), ERole.USER);

        // ✅ Xoá tài khoản tạm
        accountTempRepository.deleteByUsername(user.getUsername());

        return ResponseEntity.ok("Account verified successfully! Please log in.");
    }


    @Override
    public boolean isEmailRegistered(String email) {
        return accountRepository.existsByEmail(email);
    }

    @Override
    public AuthenticationResponse refreshAccessToken(String refreshToken, HttpServletRequest servletRequest) {
        AuthenticTokenResponse data = jwTokenService.getFromRefreshToken(refreshToken);
        Account user = data.getData().getAccount();

        if (jwtService.isValidToken(data.getAccessDecrypt(), user, true))
            return new AuthenticationResponse(data.getAccessDecrypt(), data.getData().getRefreshToken(), "", "", "", "");

        if (!jwtService.isValidToken(data.getRefreshDecrypt(), user, false))
            throw new DenyAccessException("Refresh token is invalid");

        String accessToken = jwtService.generateTokenFromRefreshToken(data.getRefreshDecrypt());
        jwTokenService.setAccessToken(data.getData(), accessToken);
        return new AuthenticationResponse(accessToken, data.getData().getRefreshToken(), "", "", "", "");
    }

    @Scheduled(fixedDelay = 10000)
    public void sendVerificationMails() {
        System.out.println("🕒 Checking mail queue...");

        while (!this.mailQueue.isEmpty()) {
            EmailResponse data = this.mailQueue.poll();
            System.out.println("📤 Sending verification email to: " + data.getMail());

            try {
                emailService.sendVerificationMail(data.getMail(), data.getSubject(), data.getContent());
                System.out.println("✅ Email sent successfully to " + data.getMail());
            } catch (Exception e) {
                System.err.println("❌ Failed to send email to " + data.getMail());
                e.printStackTrace();
                this.mailQueue.offer(data); // Đẩy lại vào hàng đợi nếu lỗi
            }
        }
    }


}
