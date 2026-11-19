package com.sip.psm.services;

import com.sip.psm.dto.StatsDto;
import com.sip.psm.entities.Client;
import com.sip.psm.entities.Projet;
import com.sip.psm.repositories.ClientRepository;
import com.sip.psm.repositories.ProjetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class StatsService {

    private final ClientRepository clientRepo;
    private final ProjetRepository projetRepo;

    public StatsService(ClientRepository clientRepo, ProjetRepository projetRepo) {
        this.clientRepo = clientRepo;
        this.projetRepo = projetRepo;
    }

    public StatsDto compute() {
        List<Client> clients = clientRepo.findAll();
        List<Projet> projets = projetRepo.findAll();
        double total = projets.stream().mapToDouble(p -> p.getBudget() == null ? 0 : p.getBudget()).sum();
        double moyen = projets.isEmpty() ? 0 : total / projets.size();

        List<StatsDto.ClientStat> top = clients.stream()
                .map(c -> new StatsDto.ClientStat(c.getNom(), c.getProjets().size(),
                        c.getProjets().stream().mapToDouble(p -> p.getBudget() == null ? 0 : p.getBudget()).sum()))
                .sorted(Comparator.comparingDouble(StatsDto.ClientStat::budget).reversed())
                .limit(5)
                .toList();

        return new StatsDto(clients.size(), projets.size(), total, moyen, top);
    }
}
