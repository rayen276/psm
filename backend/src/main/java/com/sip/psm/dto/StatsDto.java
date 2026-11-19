package com.sip.psm.dto;

import java.util.List;

public record StatsDto(long totalClients, long totalProjets, double budgetTotal, double budgetMoyen,
                       List<ClientStat> topClients) {

    public record ClientStat(String clientNom, long nbProjets, double budget) {
    }
}
