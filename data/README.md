# Seed-Daten für Kontakte-Kategorien

## Verwendung

### SQLite (Development)

Um die Seed-Daten in die SQLite-Datenbank zu importieren:

```bash
sqlite3 data/association-manager.db < data/seed_categories.sql
```

### MySQL (Production)

Um die Seed-Daten in die MySQL-Datenbank zu importieren:

```bash
mysql -u username -p database_name < data/seed_categories.sql
```

**Hinweis:** Für MySQL muss die SQL-Syntax angepasst werden (`INSERT OR IGNORE` → `INSERT IGNORE`).

## Inhalt

Das Skript `seed_categories.sql` legt folgende Kategorietypen und Kategorien an:

### Kategorietypen
- **Mitglied** – Kategorien für Vereinsmitglieder
- **Organ** – Kategorien für Vereinsorgane und Funktionsträger
- **Einzelhandel** – Kategorien für Einzelhändler und Geschäftspartner
- **Lage** – Standorte innerhalb der Stadt

### Kategorien

#### Mitglieder (6 Kategorien)
- Vollmitglied
- Schnuppermitglied
- Fördermitglied
- Ehrenmitglied
- Passivmitglied
- Gekündigt / Ausgetreten

#### Organe (7 Kategorien)
- 1. Vorstand
- 2. Vorstand
- Schatzmeister / Kassenwart
- Geschäftsstellenleiter
- Beirat
- Kassenprüfer
- Schriftführer

#### Einzelhandel (3 Kategorien)
- Normal
- Vergünstigt
- Inaktiv / Ruhend

#### Lage (16 Kategorien)
- Katzenlauf
- Marktplatz
- Hauptstraße
- Grabengasse
- Fußgängerzone Anfang
- Burgenpassage
- Fußgängerzone Mitte
- Fußgängerzone Ende
- WeinheimGaleria
- Institutstr.
- Karlsberg Carré
- Bahnhofstraße
- Mittlere Hauptstr.
- Untere Hauptstr.
- Friedrichstr.
- Außerhalb

## Automatische Initialisierung

Die Kategorien können auch über die Anwendungs-UI unter **Einstellungen → Kategorien** manuell angelegt werden.
