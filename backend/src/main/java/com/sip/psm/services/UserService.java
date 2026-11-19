package com.sip.psm.services;

import com.sip.psm.dto.UserDto;
import com.sip.psm.dto.UserUpdateRequest;
import com.sip.psm.entities.Role;
import com.sip.psm.entities.User;
import com.sip.psm.repositories.RoleRepository;
import com.sip.psm.repositories.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;

    public UserService(UserRepository userRepo, RoleRepository roleRepo) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
    }

    @Transactional(readOnly = true)
    public List<UserDto> findAll() {
        return userRepo.findAll(Sort.by("id")).stream().map(UserDto::from).toList();
    }

    @Transactional(readOnly = true)
    public UserDto findById(Long id) {
        return UserDto.from(get(id));
    }

    @Transactional(readOnly = true)
    public List<String> findAllRoles() {
        return roleRepo.findAll().stream().map(Role::getLibelle).sorted().toList();
    }

    public UserDto update(Long id, UserUpdateRequest req) {
        User u = get(id);
        Set<Role> roles = new HashSet<>();
        for (String libelle : req.roles()) {
            roles.add(roleRepo.findByLibelle(libelle.toUpperCase())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role inconnu : " + libelle)));
        }
        // On evite qu'un admin se retire lui-meme le role ADMIN et verrouille l'application
        boolean wasAdmin = u.getRoles().stream().anyMatch(r -> Role.ADMIN.equals(r.getLibelle()));
        boolean stillAdmin = roles.stream().anyMatch(r -> Role.ADMIN.equals(r.getLibelle()));
        if (wasAdmin && !stillAdmin && countAdmins() <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Impossible de retirer le role du dernier administrateur");
        }
        u.setNom(req.nom());
        u.setPrenom(req.prenom());
        u.setTel(req.tel());
        u.setRoles(roles);
        return UserDto.from(userRepo.save(u));
    }

    public void delete(Long id, String currentEmail) {
        User u = get(id);
        if (u.getEmail().equalsIgnoreCase(currentEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vous ne pouvez pas supprimer votre propre compte");
        }
        userRepo.delete(u);
    }

    private long countAdmins() {
        return userRepo.findAll().stream()
                .filter(x -> x.getRoles().stream().anyMatch(r -> Role.ADMIN.equals(r.getLibelle())))
                .count();
    }

    private User get(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable (id=" + id + ")"));
    }
}
