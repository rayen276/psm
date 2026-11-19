package com.sip.psm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ClientRequest(
        @NotBlank(message = "Le nom est obligatoire") String nom,
        String tel,
        @Email(message = "Email invalide") String email,
        String adresse) {
}
