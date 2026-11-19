package com.sip.psm.controllers;

import com.sip.psm.dto.UserDto;
import com.sip.psm.dto.UserUpdateRequest;
import com.sip.psm.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Reserve aux ADMIN (voir SecurityConfig). */
@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping("/users")
    public List<UserDto> list() {
        return service.findAll();
    }

    @GetMapping("/users/{id}")
    public UserDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PutMapping("/users/{id}")
    public UserDto update(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        service.delete(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/roles")
    public List<String> roles() {
        return service.findAllRoles();
    }
}
