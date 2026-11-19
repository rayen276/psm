#!/usr/bin/env bash
# Construit psm.jar = API Spring Boot + distribution Angular (dossier static)
set -euo pipefail
cd "$(dirname "$0")"

echo ">> 1/3  Build Angular (production)"
cd frontend
npm install            # .npmrc active legacy-peer-deps
npx ng build --configuration production
cd ..

echo ">> 2/3  Copie du build Angular dans backend/src/main/resources/static"
rm -rf backend/src/main/resources/static
mkdir -p backend/src/main/resources/static
cp -r frontend/dist/psm/. backend/src/main/resources/static/

echo ">> 3/3  Build Spring Boot -> psm.jar"
cd backend
mvn clean package -DskipTests
cp target/psm.jar ../psm.jar

echo ""
echo "OK : ./psm.jar  (lancer avec :  java -jar psm.jar)"
