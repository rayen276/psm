package com.sip.psm.controllers;

import com.sip.psm.dto.ProjetDto;
import com.sip.psm.dto.ProjetRequest;
import com.sip.psm.services.ProjetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projets")
public class ProjetController {

    private final ProjetService service;

    public ProjetController(ProjetService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProjetDto> list(@RequestParam(required = false) Long clientId) {
        return service.findAll(clientId);
    }

    @GetMapping("/{id}")
    public ProjetDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<ProjetDto> create(@Valid @RequestBody ProjetRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    public ProjetDto update(@PathVariable Long id, @Valid @RequestBody ProjetRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
