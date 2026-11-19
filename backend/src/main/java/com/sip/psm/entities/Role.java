package com.sip.psm.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Role {

    public static final String ADMIN = "ADMIN";
    public static final String COLLABORATEUR = "COLLABORATEUR";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ADMIN ou COLLABORATEUR */
    @Column(nullable = false, unique = true, length = 30)
    private String libelle;

    public Role(String libelle) {
        this.libelle = libelle;
    }
}
