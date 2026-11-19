package com.sip.psm.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final ObjectMapper mapper;

    public SecurityConfig(JwtService jwtService, UserDetailsService userDetailsService, ObjectMapper mapper) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.mapper = mapper;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // --- Public : login & registration
                .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                // --- Gestion des utilisateurs / roles : ADMIN uniquement
                .requestMatchers("/api/users", "/api/users/**", "/api/roles", "/api/roles/**").hasRole("ADMIN")
                // --- Clients & Projets : consulter + ajouter = ADMIN ou COLLABORATEUR
                .requestMatchers(HttpMethod.GET, "/api/clients", "/api/clients/**",
                        "/api/projets", "/api/projets/**", "/api/stats", "/api/auth/me")
                    .hasAnyRole("ADMIN", "COLLABORATEUR")
                .requestMatchers(HttpMethod.POST, "/api/clients", "/api/projets")
                    .hasAnyRole("ADMIN", "COLLABORATEUR")
                // --- Modifier + supprimer = ADMIN uniquement
                .requestMatchers(HttpMethod.PUT, "/api/clients/**", "/api/projets/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/clients/**", "/api/projets/**").hasRole("ADMIN")
                // --- Toute autre route /api est protegee
                .requestMatchers("/api/**").authenticated()
                // --- Fichiers statiques Angular (index.html, js, css...)
                .anyRequest().permitAll())
            .exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) ->
                        writeError(res, HttpServletResponse.SC_UNAUTHORIZED, "Authentification requise ou session expiree"))
                .accessDeniedHandler((req, res, ex) ->
                        writeError(res, HttpServletResponse.SC_FORBIDDEN, "Acces refuse : droits insuffisants")))
            .addFilterBefore(new JwtAuthenticationFilter(jwtService, userDetailsService),
                    UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private void writeError(HttpServletResponse res, int status, String message) throws java.io.IOException {
        res.setStatus(status);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setCharacterEncoding("UTF-8");
        mapper.writeValue(res.getWriter(), Map.of("status", status, "message", message));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") String origins) {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).toList());
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/api/**", cfg);
        return src;
    }
}
