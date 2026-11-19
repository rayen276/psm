package com.sip.psm.services;

import com.sip.psm.entities.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;
    private final String from;
    private final String adminEmail;

    public MailService(JavaMailSender mailSender,
                       @Value("${app.mail.from}") String from,
                       @Value("${app.admin.notify-email}") String adminEmail) {
        this.mailSender = mailSender;
        this.from = from;
        this.adminEmail = adminEmail;
    }

    /** Envoie un email a l'administrateur apres une inscription. Un echec d'envoi ne bloque jamais l'inscription. */
    @Async
    public void notifyAdminOfRegistration(User user) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(adminEmail);
            msg.setSubject("[PSM] Nouvelle inscription : " + user.getPrenom() + " " + user.getNom());
            msg.setText("Bonjour,\n\nUn nouvel utilisateur vient de s'inscrire sur Projects Manager :\n\n"
                    + "  Nom       : " + user.getNom() + "\n"
                    + "  Prenom    : " + user.getPrenom() + "\n"
                    + "  Email     : " + user.getEmail() + "\n"
                    + "  Telephone : " + (user.getTel() == null ? "-" : user.getTel()) + "\n"
                    + "  Role      : COLLABORATEUR (par defaut)\n\n"
                    + "Vous pouvez modifier ses roles depuis le menu Utilisateurs.\n\n-- PSM");
            mailSender.send(msg);
            log.info("Email de notification envoye a {}", adminEmail);
        } catch (Exception e) {
            log.warn("Impossible d'envoyer l'email de notification a {} : {}", adminEmail, e.getMessage());
        }
    }
}
