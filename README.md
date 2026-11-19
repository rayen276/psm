# PSM - Projects Manager

Application fullstack **Spring Boot 3 (Java 17) + Angular 15** (template **Velzon**) pour gerer des **clients** et leurs **projets**,
avec authentification **JWT** et deux roles : **ADMIN** et **COLLABORATEUR**.

```
psm/
├── backend/    Spring Boot : entites, repositories, services, controllers, Spring Security + JWT, email
├── frontend/   Angular 15 + template Velzon : login, register, dashboard, clients, projets, users, guards, interceptors
├── deploy/     psm.service (systemd), nginx, exemple de variables, collection Postman
├── build.sh    produit psm.jar (API + Angular dans /static)
├── Dockerfile / docker-compose.yml
```

## Modele de donnees (CDC)

| Entite | Champs | Relation |
|---|---|---|
| User | id, email, password (BCrypt), tel, nom, prenom | Many-to-Many avec Role (`user_roles`) |
| Role | id, libelle (`ADMIN` / `COLLABORATEUR`) | |
| Client | id, nom, tel, email, adresse | One-to-Many vers Projet |
| Projet | id, libelle, budget, duree (mois), description, id_client | Many-to-One vers Client |

## Droits

| Action | ADMIN | COLLABORATEUR |
|---|:-:|:-:|
| Consulter clients / projets / dashboard | oui | oui |
| Ajouter client / projet | oui | oui |
| Modifier / supprimer client / projet | oui | **non** (403 + boutons masques) |
| Page Utilisateurs (liste, roles, suppression) | oui | **non** (RoleGuard + 403) |

Une inscription publique cree toujours un **COLLABORATEUR** ; seul un ADMIN peut changer les roles.
Apres chaque inscription, un **email est envoye a l'admin** (`ADMIN_NOTIFY_EMAIL`), en asynchrone : un echec SMTP ne bloque jamais l'inscription.

Compte admin cree au demarrage : **admin@psm.com / Admin@123** (modifiable via `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
Au premier lancement, 3 clients et 4 projets de demonstration sont inseres (`SEED_DEMO_DATA=false` pour desactiver).

## Lancer en developpement

### 1. Backend
Prerequis : JDK 17, Maven, MySQL (la base `psm_db` est creee automatiquement).

```bash
cd backend
# MySQL : adapter DB_USERNAME / DB_PASSWORD si besoin (defaut root / vide)
DB_PASSWORD=monmotdepasse mvn spring-boot:run
# ou, sans MySQL (base H2 en memoire) :
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```
API : http://localhost:8080/api

### 2. Frontend
Prerequis : Node 18/20.

```bash
cd frontend
npm install          # .npmrc active legacy-peer-deps
npm start            # http://localhost:4200
```
En dev, Angular appelle `http://localhost:8080/api` (`src/environments/environment.ts`) ; CORS est autorise pour `localhost:4200`.

### Email (inscription -> admin)
Par defaut SMTP = `localhost:1025` (echec silencieux, logue en WARN). Pour recevoir reellement l'email :

```bash
# Mailtrap (test)               # Gmail (mot de passe d'application)
MAIL_HOST=sandbox.smtp.mailtrap.io   MAIL_HOST=smtp.gmail.com
MAIL_PORT=2525                       MAIL_PORT=587
MAIL_USERNAME=...  MAIL_PASSWORD=... MAIL_SMTP_AUTH=true  MAIL_STARTTLS=true
```

## Tester l'API avec Postman
Importer `deploy/PSM.postman_collection.json`. Lancer d'abord **Login ADMIN** (le token est stocke dans la variable `token`),
puis les requetes. Refaire **Login COLLABORATEUR** pour verifier les `403` sur PUT / DELETE.

| Methode | URL | Acces |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | public |
| GET | `/api/auth/me`, `/api/stats` | connecte |
| GET / POST | `/api/clients`, `/api/projets` | ADMIN, COLLABORATEUR |
| GET | `/api/clients/{id}`, `/api/projets/{id}`, `/api/projets?clientId=` | ADMIN, COLLABORATEUR |
| PUT / DELETE | `/api/clients/{id}`, `/api/projets/{id}` | ADMIN |
| GET / PUT / DELETE | `/api/users`, `/api/users/{id}`, `/api/roles` | ADMIN |

## Construire `psm.jar` (API + Angular)
```bash
./build.sh            # npm install + ng build + copie dans backend/.../static + mvn package -> ./psm.jar
java -jar psm.jar     # http://localhost:8080  (Angular + API sur le meme port)
```
Les routes Angular (F5 sur `/clients`...) sont gerees par `SpaWebConfig` (fallback vers `index.html`).

## Deploiement sur un VPS
```bash
# Sur le VPS : sudo apt install openjdk-17-jre mysql-server nginx
sudo mysql -e "CREATE DATABASE psm_db; CREATE USER 'psm'@'localhost' IDENTIFIED BY 'mot-de-passe'; GRANT ALL ON psm_db.* TO 'psm'@'localhost';"
scp psm.jar user@vps:/opt/psm/psm.jar
# copier deploy/psm.env.example -> /opt/psm/psm.env (renseigner DB, JWT_SECRET, SMTP) et deploy/psm.service -> /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now psm
# Optionnel : deploy/nginx-psm.conf + certbot pour HTTPS
```
Alternative Docker : `JWT_SECRET=$(openssl rand -base64 48) docker compose up -d --build`.

**Securite avant mise en production** : definir `JWT_SECRET`, changer `ADMIN_PASSWORD`, mettre `SEED_DEMO_DATA=false`.

## Ce qui a ete adapte dans le template Velzon
- Pages de demonstration supprimees ; layout vertical conserve (sidebar + topbar + footer).
- Menu lateral : Tableau de bord, Clients, Projets, et **Utilisateurs visible uniquement pour l'ADMIN**.
- Faux backend / Firebase retires ; `AuthGuard`, `RoleGuard`, `JwtInterceptor`, `ErrorInterceptor` ajoutes (`src/app/core`).

## Deploiement sur Render (demo en ligne)
Render a besoin d'un depot Git (GitHub/GitLab, prive possible). Nouveau "Web Service" -> Runtime **Docker** (le `Dockerfile` est a la racine).
Variables d'environnement pour une demo sans MySQL :
`SPRING_PROFILES_ACTIVE=h2`, `JWT_SECRET=<openssl rand -base64 48>`, `ADMIN_PASSWORD=...`, `JAVA_TOOL_OPTIONS=-Xmx350m`.
Le port est pris automatiquement depuis la variable `PORT` de Render.
