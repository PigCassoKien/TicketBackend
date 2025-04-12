package com.example.besrc.Security;

import java.io.IOException;
import java.util.List;

import com.example.besrc.ServicesImplement.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.micrometer.common.lang.NonNull;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            final String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            final String jwt = authHeader.substring(7);
            final String username = jwtService.extractUsername(jwt, true);

            if (username == null) {
                sendErrorResponse(response, "Token is missing or malformed");
                return;
            }

            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                filterChain.doFilter(request, response);
                return;
            }

            UserDetails userDetail = userDetailService.loadUserByUsername(username);
            if (!jwtService.isValidToken(jwt, userDetail, true)) {
                sendErrorResponse(response, "Token is invalid or expired");
                return;
            }

            List<SimpleGrantedAuthority> authorities = jwtService.getAuthoritiesFromToken(jwt)
                    .stream()
                    .map(auth -> {
                        String role = auth.getAuthority();
                        if (role.startsWith("ROLE_ROLE_")) {
                            role = role.replace("ROLE_ROLE_", "ROLE_"); // Fix lỗi dư tiền tố
                        }
                        return new SimpleGrantedAuthority(role);
                    })
                    .toList();



            System.out.println("Roles in Security Context: " + authorities);

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetail, null, authorities);
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);

            // 🔹 Chỉ tiếp tục nếu xác thực thành công
            filterChain.doFilter(request, response);

        } catch (ExpiredJwtException e) {
            sendErrorResponse(response, "Token has expired");
        } catch (MalformedJwtException e) {
            sendErrorResponse(response, "Malformed token");
        } catch (AccessDeniedException e) {
            sendErrorResponse(response, "Access Denied");
        } catch (Exception e) {
            sendErrorResponse(response, "An unexpected error occurred");
        }
    }


    private void sendErrorResponse(HttpServletResponse response, String errorMessage) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + errorMessage + "\"}");
    }

}
