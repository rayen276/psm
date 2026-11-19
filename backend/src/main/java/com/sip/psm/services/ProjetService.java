package com.sip.psm.services;

import com.sip.psm.dto.ProjetDto;
import com.sip.psm.dto.ProjetRequest;
import com.sip.psm.entities.Client;
import com.sip.psm.entities.Projet;
import com.sip.psm.repositories.ClientRepository;
import com.sip.psm.repositories.ProjetRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class ProjetService {

    private final ProjetRepository projetRepo;
    private final ClientRepository clientRepo;

    public ProjetService(ProjetRepository projetRepo, ClientRepository clientRepo) {
        this.projetRepo = projetRepo;
        this.clientRepo = clientRepo;
    }

    @Transactional(readOnly = true)
    public List<ProjetDto> findAll(Long clientId) {
        List<Projet> list = (clientId == null)
                ? projetRepo.findAll(Sort.by(Sort.Direction.DESC, "id"))
                : projetRepo.findByClientId(clientId);
        return list.stream().map(ProjetDto::from).toList();
    }

    @Transactional(readOnly = true)
    public ProjetDto findById(Long id) {
        return ProjetDto.from(get(id));
    }

    public ProjetDto create(ProjetRequest req) {
        Projet p = new Projet();
        apply(p, req);
        return ProjetDto.from(projetRepo.save(p));
    }

    public ProjetDto update(Long id, ProjetRequest req) {
        Projet p = get(id);
        apply(p, req);
        return ProjetDto.from(projetRepo.save(p));
    }

    public void delete(Long id) {
        projetRepo.delete(get(id));
    }

    private Projet get(Long id) {
        return projetRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projet introuvable (id=" + id + ")"));
    }

    private void apply(Projet p, ProjetRequest req) {
        Client client = clientRepo.findById(req.clientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Client introuvable (id=" + req.clientId() + ")"));
        p.setLibelle(req.libelle());
        p.setBudget(req.budget());
        p.setDuree(req.duree());
        p.setDescription(req.description());
        p.setClient(client);
    }
}
