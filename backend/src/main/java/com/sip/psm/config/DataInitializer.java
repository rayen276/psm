package com.sip.psm.config;

import com.sip.psm.entities.Client;
import com.sip.psm.entities.Projet;
import com.sip.psm.entities.Role;
import com.sip.psm.entities.User;
import com.sip.psm.repositories.ClientRepository;
import com.sip.psm.repositories.ProjetRepository;
import com.sip.psm.repositories.RoleRepository;
import com.sip.psm.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

/** Cree au demarrage les roles, un compte admin et (optionnel) quelques donnees de demonstration. */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepo;
    private final UserRepository userRepo;
    private final ClientRepository clientRepo;
    private final ProjetRepository projetRepo;
    private final PasswordEncoder encoder;

    @Value("${app.admin.email}") private String adminEmail;
    @Value("${app.admin.password}") private String adminPassword;
    @Value("${app.seed-demo-data:true}") private boolean seedDemo;

    public DataInitializer(RoleRepository roleRepo, UserRepository userRepo, ClientRepository clientRepo,
                           ProjetRepository projetRepo, PasswordEncoder encoder) {
        this.roleRepo = roleRepo;
        this.userRepo = userRepo;
        this.clientRepo = clientRepo;
        this.projetRepo = projetRepo;
        this.encoder = encoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Role admin = roleRepo.findByLibelle(Role.ADMIN).orElseGet(() -> roleRepo.save(new Role(Role.ADMIN)));
        roleRepo.findByLibelle(Role.COLLABORATEUR).orElseGet(() -> roleRepo.save(new Role(Role.COLLABORATEUR)));

        if (!userRepo.existsByEmailIgnoreCase(adminEmail)) {
            User u = new User();
            u.setEmail(adminEmail);
            u.setPassword(encoder.encode(adminPassword));
            u.setNom("Admin");
            u.setPrenom("PSM");
            u.setTel("00000000");
            u.setRoles(new HashSet<>(Set.of(admin)));
            userRepo.save(u);
            log.info("Compte administrateur cree : {}", adminEmail);
        }

        if (seedDemo && clientRepo.count() == 0) {
            Client c1 = client("SmartSoft Solutions", "71 123 456", "contact@smartsoft.tn", "Tunis, Les Berges du Lac");
            Client c2 = client("Tunisie Telecom", "71 000 111", "projets@tt.tn", "Tunis, Montplaisir");
            Client c3 = client("Delice Danone", "71 222 333", "it@delice.tn", "Ben Arous");
            projet(c1, "Refonte du site web", 18000d, 3, "Nouveau site vitrine responsive.");
            projet(c1, "Application mobile", 42000d, 6, "Application iOS / Android de suivi client.");
            projet(c2, "Portail self-care", 65000d, 8, "Portail de gestion de compte pour les abonnes.");
            projet(c3, "Tableau de bord BI", 27000d, 4, "Reporting des ventes et de la production.");
            log.info("Donnees de demonstration inserees");
        }
    }

    private Client client(String nom, String tel, String email, String adresse) {
        Client c = new Client();
        c.setNom(nom);
        c.setTel(tel);
        c.setEmail(email);
        c.setAdresse(adresse);
        return clientRepo.save(c);
    }

    private void projet(Client c, String libelle, double budget, int duree, String description) {
        Projet p = new Projet();
        p.setLibelle(libelle);
        p.setBudget(budget);
        p.setDuree(duree);
        p.setDescription(description);
        p.setClient(c);
        projetRepo.save(p);
    }
}
