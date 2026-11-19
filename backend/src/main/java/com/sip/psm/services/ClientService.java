package com.sip.psm.services;

import com.sip.psm.dto.ClientDto;
import com.sip.psm.dto.ClientRequest;
import com.sip.psm.entities.Client;
import com.sip.psm.repositories.ClientRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class ClientService {

    private final ClientRepository repo;

    public ClientService(ClientRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<ClientDto> findAll() {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "id")).stream().map(ClientDto::from).toList();
    }

    @Transactional(readOnly = true)
    public ClientDto findById(Long id) {
        return ClientDto.from(get(id));
    }

    public ClientDto create(ClientRequest req) {
        Client c = new Client();
        apply(c, req);
        return ClientDto.from(repo.save(c));
    }

    public ClientDto update(Long id, ClientRequest req) {
        Client c = get(id);
        apply(c, req);
        return ClientDto.from(repo.save(c));
    }

    public void delete(Long id) {
        repo.delete(get(id));
    }

    private Client get(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client introuvable (id=" + id + ")"));
    }

    private void apply(Client c, ClientRequest req) {
        c.setNom(req.nom());
        c.setTel(req.tel());
        c.setEmail(req.email());
        c.setAdresse(req.adresse());
    }
}
