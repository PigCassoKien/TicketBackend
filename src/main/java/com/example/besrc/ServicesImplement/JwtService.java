package com.example.besrc.ServicesImplement;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.*;
import java.util.function.Function;

import com.example.besrc.Entities.Account;
import com.example.besrc.Exception.ErrorServerException;
import com.example.besrc.Service.AccountService;
import lombok.SneakyThrows;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParserBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Service
public class JwtService {

    @Autowired
    private AccountService accountService;

    @Value("${app.issuer}")
    private String issuer;

    @Value("${app.jwtSecret}")
    private String secretKey;

    @Value("${app.jwtRefreshSecret}")
    private String refreshKey;

    @Value("${app.jwtPublickey}")
    private String publicKey;

    @Value("${app.jwtExpirationInMs}")
    private Long expired_time;

    @Value("${app.jwtRefreshExpirationInMs}")
    private Long expired_refresh_time;

    // Generate Token
    // ------------------------------------------------------------------------------------------------------------

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();

        // Lấy danh sách roles đúng từ GrantedAuthority
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority) // Không sửa đổi gì thêm
                .toList();

        extraClaims.put("roles", roles); // Thêm roles vào JWT

        return generateToken(extraClaims, userDetails);
    }


    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, secretKey, expired_time);
    }

    public String generateRefreshToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, refreshKey, expired_refresh_time);
    }

    public String generateTokenFromRefreshToken(String refresh_token) {
        Claims claims = this.extractAllClaims(refresh_token, refreshKey);

        if (claims != null) {
            String username = claims.getSubject();
            Account account = accountService.getRawUserByUsername(username);

            Map<String, Collection<?>> list_roles = new HashMap<>();
            list_roles.put("roles", account.getAuthorities());

            return this.generateToken(new HashMap<>(), account);
        }
        return null;
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, String key, long expiration) {
        return Jwts.builder()
                .setIssuer(issuer)
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(this.loadPrivateKey(key), SignatureAlgorithm.RS256)
                .compact();
    }


    // ------------------------------------------------------------------------------------------------------------------------

    // Valid Token
    // ------------------------------------------------------------------------------------------------------------
    public boolean isValidToken(String token, UserDetails userDetails, boolean useSecretKey) {
        final String username = extractUsername(token, useSecretKey);
        if (username == null)
            return false;
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token, useSecretKey);
    }

    private boolean isTokenExpired(String token, boolean useSecretKey) {
        return extractExpiration(token, useSecretKey).before(new Date());
    }

    public String extractUsername(String token, boolean useSecretKey) {
        if (useSecretKey)
            return extractClaim(token, secretKey, Claims::getSubject);
        else
            return extractClaim(token, refreshKey, Claims::getSubject);
    }

    private Date extractExpiration(String token, boolean useSecretKey) {
        if (useSecretKey)
            return extractClaim(token, secretKey, Claims::getExpiration);
        return extractClaim(token, refreshKey, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, String key, Function<Claims, T> claimsResolver) {
        Claims claims = extractAllClaims(token, key);
        if (claims == null)
            return null;
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token, String key) {
        String algorithm = this.getAlgorithm(token);
        return switch (algorithm) {
            case "RS256" -> this.RS256_verify(token);
            case "HS256" -> this.HS256_verify(token);
            default -> throw new AccessDeniedException("Token is invalid");
        };
    }

    private Claims HS256_verify(String token) {
        try {
            // Sử dụng secretKey cho HS256
            byte[] secretKeyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
            JwtParserBuilder claimsBuilder = Jwts.parserBuilder().setSigningKey(secretKeyBytes);
            return this.getClaims(claimsBuilder, token);

        } catch (Exception e) {
            return null;
        }
    }


    private Claims RS256_verify(String token) {
        PublicKey publicKey = this.loadPublicKey(); // Tải khóa công khai RSA
        JwtParserBuilder claimsBuilder = Jwts.parserBuilder().setSigningKey(publicKey);
        return this.getClaims(claimsBuilder, token);
    }


    private Claims getClaims(JwtParserBuilder claimsBuilder, String token) {
        try {
            return claimsBuilder
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

        } catch (Exception e) {
            return null;
        }
    }

    // ------------------------------------------------------------------------------------------------------------

    // Load Key Object

    private PrivateKey loadPrivateKey(String private_key) {
        try {
            byte[] privateKeyBytes = Base64.getDecoder().decode(private_key);
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            return keyFactory.generatePrivate(keySpec);

        } catch (Exception e) {
            throw new ErrorServerException("Can not load private key " + e.getMessage());
        }
    }

    private PublicKey loadPublicKey() {
        try {
            byte[] publicKeyBytes = Base64.getDecoder().decode(this.publicKey);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicKeyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            return keyFactory.generatePublic(keySpec);

        } catch (Exception e) {
            throw new ErrorServerException("Can not load public key");
        }
    }

    @SneakyThrows
    private JSONObject getTokenPart(String token) {
        String[] tokenParts = token.split("\\.");
        if (tokenParts.length >= 2) {
            String data = new String(Base64.getUrlDecoder().decode(tokenParts[0]));
            return new JSONObject(data);
        }
        return null;
    }

    public String getAlgorithm(String token) {
        JSONObject header = getTokenPart(token);
        assert header != null;
        if (!header.isEmpty())
            return header.getString("alg");
        return null;
    }

    public Collection<? extends GrantedAuthority> getAuthoritiesFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        if (claims == null) {
            throw new AccessDeniedException("Invalid token: claims is null");
        }

        List<String> roles = (List<String>) claims.get("roles");
        if (roles == null || roles.isEmpty()) {
            throw new AccessDeniedException("Token does not contain roles");
        }
        return roles.stream()
                .map(SimpleGrantedAuthority::new)
                .toList();

    }

    // Phương thức getClaimsFromToken
    public Claims getClaimsFromToken(String token) {
        try {
            String algorithm = getAlgorithm(token);
            if ("HS256".equals(algorithm)) {
                return Jwts.parserBuilder()
                        .setSigningKey(secretKey.getBytes(StandardCharsets.UTF_8))
                        .build()
                        .parseClaimsJws(token)
                        .getBody();
            } else if ("RS256".equals(algorithm)) {
                PublicKey publicKey = loadPublicKey();
                return Jwts.parserBuilder()
                        .setSigningKey(publicKey)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();
            }
        } catch (Exception e) {
            System.out.println("JWT error: " + e.getMessage());
            throw new AccessDeniedException("Token verification failed");
        }
        throw new AccessDeniedException("Invalid token algorithm");
    }

}