// Developpement : `ng serve` (port 4200) appelle l'API Spring Boot sur le port 8080 (CORS autorise cote backend).
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
