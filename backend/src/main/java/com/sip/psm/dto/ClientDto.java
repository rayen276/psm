package com.sip.psm.dto;

import com.sip.psm.entities.Client;

public record ClientDto(Long id, String nom, String tel, String email, String adresse, int nbProjets) {

    public static ClientDto from(Client c) {
        return new ClientDto(c.getId(), c.getNom(), c.getTel(), c.getEmail(), c.getAdresse(), c.getProjets().size());
    }
}
