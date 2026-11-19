package com.sip.psm.dto;

import com.sip.psm.entities.Role;
import com.sip.psm.entities.User;

import java.util.List;

public record UserDto(Long id, String email, String nom, String prenom, String tel, List<String> roles) {

    public static UserDto from(User u) {
        List<String> roles = u.getRoles().stream().map(Role::getLibelle).sorted().toList();
        return new UserDto(u.getId(), u.getEmail(), u.getNom(), u.getPrenom(), u.getTel(), roles);
    }
}
