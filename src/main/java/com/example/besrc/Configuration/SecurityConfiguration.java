package com.example.besrc.Configuration;

import com.example.besrc.Exception.CustomAccessDeniedHandler;
import com.example.besrc.Exception.CustomAuthenticationEntryPoint;
import com.example.besrc.Security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfiguration {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Cấu hình disable CSRF dùng lambda
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/account/getMyAccountInformation").authenticated()
                        .requestMatchers("/api/account/admin/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN")
                        .requestMatchers("/api/account//superadmin/**").hasAuthority("ROLE_SUPER_ADMIN")
                        .requestMatchers("/api/auth/verify/**").permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        // Xử lý khi người dùng chưa xác thực
                        .authenticationEntryPoint(customAuthenticationEntryPoint())
                        // Xử lý khi người dùng đã xác thực nhưng không có quyền truy cập
                         .accessDeniedHandler(customAccessDeniedHandler())
                )

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Thêm JWT filter trước khi xử lý xác thực bằng username/password
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        ;

        return http.build();
    }

    // Xử lý lỗi khi người dùng chưa xác thực
    @Bean
    public AuthenticationEntryPoint customAuthenticationEntryPoint() {
        return new CustomAuthenticationEntryPoint(); // Nếu bạn có một handler riêng cho AuthenticationEntryPoint
    }

    // Xử lý lỗi khi người dùng đã xác thực nhưng không có quyền
    @Bean
    public AccessDeniedHandler customAccessDeniedHandler() {
        return new CustomAccessDeniedHandler(); // Nếu bạn có CustomAccessDeniedHandler triển khai AccessDeniedHandler
    }
}
