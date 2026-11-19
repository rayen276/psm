package com.sip.psm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record ProjetRequest(
        @NotBlank(message = "Le libelle est obligatoire") String libelle,
        @NotNull(message = "Le budget est obligatoire") @PositiveOrZero(message = "Le budget doit etre positif") Double budget,
        @NotNull(message = "La duree est obligatoire") @Positive(message = "La duree doit etre positive") Integer duree,
        String description,
        @NotNull(message = "Le client est obligatoire") Long clientId) {
}
