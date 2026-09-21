# CRUD Product App

Kleine Fullstack-Anwendung zur Verwaltung von Produkten (Anlegen, Anzeigen,
Bearbeiten, Löschen). Entstanden als Übungsprojekt.

## Technologien

**Backend:** .NET 10 Minimal API, Entity Framework Core, SQLite
**Frontend:** React 19, Vite, Dexie (IndexedDB)

## Aufbau

Das Backend stellt vier Endpunkte unter `/api/products` bereit (GET, POST,
PUT, DELETE) und speichert die Daten in einer lokalen SQLite-Datei. Das
Frontend greift per `fetch` darauf zu.

Zusätzlich wird eine UI-Einstellung in der IndexedDB des Browsers abgelegt, damit sie beim neu laden nicht verschwindet.

## Starten

Voraussetzungen: .NET SDK 10, Node.js 20+

**Backend** (läuft auf `http://localhost:5288`):

    cd Backend
    dotnet run

**Frontend** (läuft auf `http://localhost:5173`):

    cd frontend
    npm install
    npm run dev

Die Datenbank wird beim ersten Start automatisch angelegt.

## API

| Methode | Pfad                 | Beschreibung          |
|---------|----------------------|-----------------------|
| GET     | `/api/products`      | Alle Produkte         |
| POST    | `/api/products`      | Produkt anlegen       |
| PUT     | `/api/products/{id}` | Produkt aktualisieren |
| DELETE  | `/api/products/{id}` | Produkt löschen       |
