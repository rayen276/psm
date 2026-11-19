package com.sip.psm.dto;

import com.sip.psm.entities.Projet;

public record ProjetDto(Long id, String libelle, Double budget, Integer duree, String description,
                        Long clientId, String clientNom) {

    public static ProjetDto from(Projet p) {
        return new ProjetDto(p.getId(), p.getLibelle(), p.getBudget(), p.getDuree(), p.getDescription(),
                p.getClient().getId(), p.getClient().getNom());
    }
}
