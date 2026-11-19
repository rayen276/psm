# ---------- 1. Build Angular ----------
FROM node:20-alpine AS front
WORKDIR /app/frontend
COPY frontend/package*.json frontend/.npmrc ./
RUN npm install
COPY frontend/ ./
RUN npx ng build --configuration production

# ---------- 2. Build Spring Boot (avec Angular dans /static) ----------
FROM maven:3.9-eclipse-temurin-17 AS back
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn -q dependency:go-offline
COPY backend/src ./src
RUN rm -rf src/main/resources/static && mkdir -p src/main/resources/static
COPY --from=front /app/frontend/dist/psm/ ./src/main/resources/static/
RUN mvn -q clean package -DskipTests

# ---------- 3. Image finale ----------
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=back /app/backend/target/psm.jar psm.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "psm.jar"]
