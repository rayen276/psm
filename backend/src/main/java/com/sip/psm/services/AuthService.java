package com.sip.psm.services;

import com.sip.psm.dto.AuthResponse;
import com.sip.psm.dto.LoginRequest;
import com.sip.psm.dto.RegisterRequest;
import com.sip.psm.dto.UserDto;
import com.sip.psm.entities.Role;
import com.sip.psm.entities.User;
import com.sip.psm.repositories.RoleRepository;
import com.sip.psm.repositories.UserRepository;
import com.sip.psm.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final MailService mailService;

    public AuthService(UserRepository userRepo, RoleRepository roleRepo, PasswordEncoder encoder,
                       AuthenticationManager authManager, JwtService jwtService, MailService mailService) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.encoder = encoder;
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }

    @Transactional
    public UserDto register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (userRepo.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est deja utilise");
        }
        Role collab = roleRepo.findByLibelle(Role.COLLABORATEUR)
                .orElseGet(() -> roleRepo.save(new Role(Role.COLLABORATEUR)));

        User u = new User();
        u.setEmail(email);
        u.setPassword(encoder.encode(req.password()));
        u.setNom(req.nom());
        u.setPrenom(req.prenom());
        u.setTel(req.tel());
        // Une inscription publique donne toujours le role COLLABORATEUR ; seul un ADMIN peut promouvoir.
        u.setRoles(new HashSet<>(Set.of(collab)));
        User saved = userRepo.save(u);

        mailService.notifyAdminOfRegistration(saved);   // asynchrone
        return UserDto.from(saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.email().trim(), req.password()));
        User u = userRepo.findByEmailIgnoreCase(req.email().trim()).orElseThrow();
        return new AuthResponse(jwtService.generateToken(u), UserDto.from(u));
    }

    @Transactional(readOnly = true)
    public UserDto me(String email) {
        return UserDto.from(userRepo.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable")));
    }
}
