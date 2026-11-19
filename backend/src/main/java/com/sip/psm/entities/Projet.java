package com.sip.psm.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "projets")
@Getter @Setter @NoArgsConstructor
public class Projet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String libelle;

    private Double budget;

    /** Duree en mois */
    private Integer duree;

    @Column(length = 2000)
    private String description;

    // Many-to-One Projet -> Client (colonne id_client)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_client", nullable = false)
    private Client client;
}
