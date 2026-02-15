# Vereinsverwaltung (Association Manager) - lw001

Vereinsverwaltung für Lebendiges Weinheim e.V.

## Features

- **Verein (Association)**: Verwalten Sie die Stammdaten Ihres Vereins (Name, Adresse, Beschreibung)
- Single-record entity - es gibt immer genau einen Vereinseintrag
- Responsive UI mit Tailwind CSS
- SSO-Integration mit zentraler Authentifizierung
- Dual-Backend: SQLite (Entwicklung) / MySQL (Produktion)

## Technologie-Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend (Dev)**: Node.js, Express, SQLite
- **Backend (Prod)**: PHP, MySQL
- **Auth**: Shared SSO from lw000 launchpad

## Installation

```bash
# Dependencies installieren
npm install
```

## Entwicklung

```bash
# Terminal 1: Backend-Server starten (Port 3000)
npm run server

# Terminal 2: Frontend-Dev-Server starten (Port 5173)
npm run dev
```

Die Anwendung ist dann verfügbar unter: `http://localhost:5173`

## Produktion

```bash
# Build für Produktion erstellen
npm run build

# Dateien aus dem dist/ Ordner auf den Server kopieren
# Nach /association/ Verzeichnis auf dem Webserver
```

### Produktions-Setup

1. **Datenbank erstellen**:
   ```sql
   CREATE DATABASE association_manager;
   ```

2. **PHP-Konfiguration**:
   - Kopiere `api/config.example.php` nach `api/config.php`
   - Passe die Datenbankverbindung an

3. **Deployment**:
   - Kopiere den Inhalt von `dist/` nach `/association/` auf dem Webserver
   - Kopiere `api/` Ordner ebenfalls
   - Stelle sicher, dass `.htaccess` Dateien vorhanden sind

## Datenbankstruktur

### Tabelle: association

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | VARCHAR(50) | Primary Key |
| name | VARCHAR(255) | Name des Vereins |
| street | VARCHAR(255) | Straße |
| zip | VARCHAR(10) | Postleitzahl |
| city | VARCHAR(255) | Stadt |
| description | TEXT | Beschreibung |
| created_at | TIMESTAMP | Erstellungsdatum |

## Projektstruktur

```
project-claude-lw001_association/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Navigation
│   │   ├── forms/           # AssociationForm
│   │   ├── auth/            # Login, AuthenticatedApp
│   │   └── shared/          # Modal, etc.
│   ├── hooks/               # useAuth, useApi
│   ├── api/                 # API clients
│   ├── db/                  # Database layer (dev)
│   └── utils/               # Helper functions
├── api/                     # PHP backend (production)
├── data/                    # SQLite database (dev)
└── dist/                    # Build output
```

## Integration mit Launchpad

Das Modul ist im lw000 Launchpad unter `/association/` registriert und erscheint als "Vereinsverwaltung" Kachel.

## Lizenz

Proprietary - Lebendiges Weinheim e.V.
