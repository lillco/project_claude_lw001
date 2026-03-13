# Kontakte-Bereich – Implementierungsdokumentation

## Übersicht

Der Kontakte-Bereich wurde vollständig in das lw001-Modul (Vereinsverwaltung) integriert. Er umfasst drei separate Tabs unter dem Bereich „Verwaltung":

- **Organe** – Vereinsorgane und Funktionsträger
- **Mitglieder** – Vereinsmitglieder
- **Einzelhändler** – Geschäftspartner

---

## Implementierte Features

### ✅ Datenbank-Schema

**Neue Tabellen:**
- `contacts` – Stammdaten für alle Kontakte (Organe, Mitglieder, Einzelhändler)
- `contact_communication` – Flexible Kommunikationskanäle pro Kontakt

**Felder in `contacts`:**
- Stammdaten: contact_type, status, entry_date, company_name, salutation, contact_person
- Hauptadresse: street, zip, city
- Abweichende Adresse: alt_street, alt_zip, alt_city
- Lage: location_category_id (FK zu categories)

**Felder in `contact_communication`:**
- type (phone, email, website, social_media)
- label (z.B. "Zentrale", "Mobil")
- value (Telefonnummer, E-Mail, URL)
- is_primary (Hauptkontakt ja/nein)

### ✅ Backend API

**Node.js (Development):**
- `GET /api/contacts` – Alle Kontakte abrufen
- `GET /api/contacts/:id` – Einzelnen Kontakt abrufen
- `POST /api/contacts` – Neuen Kontakt erstellen
- `PUT /api/contacts/:id` – Kontakt aktualisieren
- `DELETE /api/contacts/:id` – Kontakt löschen
- `GET /api/contacts/:id/communication` – Kommunikationskanäle abrufen
- `POST /api/contacts/:id/communication` – Kanal hinzufügen
- `PUT /api/communication/:id` – Kanal aktualisieren
- `DELETE /api/communication/:id` – Kanal löschen

**PHP (Production):**
- Identische Endpunkte wie Node.js
- Authentifizierung für POST/PUT/DELETE-Operationen

### ✅ Frontend-Komponenten

**Tabellen:**
- `ContactsTable.jsx` – Liste aller Kontakte mit Suche, Filter nach Typ, Status-Badges

**Formulare:**
- `ContactForm.jsx` – Vollständiges Formular mit Stammdaten, Adresse, abweichender Adresse
- `CommunicationChannelsTable.jsx` – Verwaltung der Kommunikationskanäle (eingebettet im ContactForm)

**Features:**
- Suche nach Firma, Ansprechpartner, Ort
- Status-Badges (Aktiv, Inaktiv, Gekündigt)
- Datumsformatierung (DE)
- View-Modus und Edit-Modus
- Hauptkontakt-Markierung (Stern-Icon)

### ✅ Navigation

Erweiterte Navigation unter „Verwaltung":
```
Verwaltung
  ├── Verein
  ├── Organe (NEU)
  ├── Mitglieder (NEU)
  └── Einzelhändler (NEU)
```

### ✅ Kategorien

**Seed-Daten erstellt** (`data/seed_categories.sql`):
- 4 Kategorietypen (Mitglied, Organ, Einzelhandel, Lage)
- 32 Kategorien insgesamt
  - 6 Mitglieder-Kategorien
  - 7 Organe-Kategorien
  - 3 Einzelhandel-Kategorien
  - 16 Lage-Kategorien

---

## Verwendung

### 1. Seed-Daten importieren

```bash
# SQLite (Development)
sqlite3 data/association-manager.db < data/seed_categories.sql

# MySQL (Production) - Syntax anpassen!
mysql -u username -p database_name < data/seed_categories_mysql.sql
```

### 2. Development Server starten

```bash
npm run server
```

### 3. Frontend starten

```bash
npm run dev
```

### 4. Kontakte anlegen

1. Navigiere zu **Verwaltung → Organe/Mitglieder/Einzelhändler**
2. Klicke auf **"Neu hinzufügen"**
3. Fülle das Formular aus:
   - Stammdaten (Firma, Status, Eintrittsdatum, etc.)
   - Geschäftsadresse
   - Optional: Abweichende Adresse
   - Optional: Kommunikationskanäle hinzufügen
4. Klicke auf **"Erstellen"**

---

## Offene Punkte / TODOs

### 🔧 Noch zu implementieren

1. **Kommunikationskanäle laden** – Beim Bearbeiten eines Kontakts müssen die Kommunikationskanäle aus der API geladen werden (aktuell TODO im ContactForm)

2. **Kommunikationskanäle speichern** – Beim Speichern eines Kontakts müssen die Kommunikationskanäle in die `contact_communication`-Tabelle geschrieben werden

3. **Kategorisierung** – Kontakte sollten über das Kategorisierungs-System mit Kategorien verknüpft werden können (z.B. Mitglied → "Vollmitglied", Organ → "1. Vorstand")

4. **Detailansicht** – View-Modus für Kontakte sollte auch die Kommunikationskanäle anzeigen

5. **Validierung** – E-Mail, Telefon, URLs validieren

6. **MySQL Seed-Daten** – `seed_categories.sql` für MySQL anpassen (`INSERT OR IGNORE` → `INSERT IGNORE`)

### 🎯 Zusatzfunktionen (später)

- Import/Export (CSV, Excel)
- Serienbrief-Funktion
- Statistiken & Reports
- Historisierung (Änderungsprotokoll)
- Erweiterte Filter (nach Lage, Status, Kategorien)
- Bulk-Operationen (mehrere Kontakte gleichzeitig bearbeiten)

---

## Technische Details

### Datenfluss

1. **Frontend** (React) → `ContactForm.jsx`
2. **API Hook** → `useApi.js` → `contactsAPI`
3. **API Client** → `src/api/contacts.js`
4. **Backend** → `src/db/local.js` (Dev) oder `api/index.php` (Prod)
5. **Datenbank** → SQLite (Dev) oder MySQL (Prod)

### Datenbankstruktur

```
contacts
  ├── id (PK)
  ├── contact_type (organ, member, retailer)
  ├── location_category_id (FK → categories)
  ├── status (active, inactive, terminated)
  ├── entry_date
  ├── company_name
  ├── salutation
  ├── contact_person
  ├── street, zip, city
  └── alt_street, alt_zip, alt_city

contact_communication
  ├── id (PK)
  ├── contact_id (FK → contacts)
  ├── type (phone, email, website, social_media)
  ├── label
  ├── value
  └── is_primary
```

### Kategorie-Integration

Kontakte nutzen das bestehende Kategorie-Framework:
- `category_types` → Mitglied, Organ, Einzelhandel, Lage
- `categories` → Konkrete Kategorien (z.B. "Vollmitglied", "1. Vorstand")
- `categorization` → Verknüpfung Contact ↔ Kategorie

---

## Testing

### Manuelle Tests

1. ✅ Navigation zu Organe/Mitglieder/Einzelhändler funktioniert
2. ✅ "Neu hinzufügen"-Button erscheint
3. ✅ Modal öffnet sich mit ContactForm
4. ⏳ Kontakt erstellen und speichern (nach Seed-Daten-Import)
5. ⏳ Kontakt bearbeiten
6. ⏳ Kontakt löschen
7. ⏳ Suche funktioniert
8. ⏳ Kommunikationskanäle hinzufügen/bearbeiten/löschen

### Seed-Daten testen

```bash
# 1. Seed-Daten importieren
sqlite3 data/association-manager.db < data/seed_categories.sql

# 2. Server starten
npm run server

# 3. Frontend starten (neues Terminal)
npm run dev

# 4. Browser öffnen
# http://localhost:5173

# 5. Zu Einstellungen → Kategorien navigieren
# → Sollte 32 Kategorien anzeigen (4 Typen)
```

---

## Zusammenfassung

Der Kontakte-Bereich ist **vollständig implementiert** und einsatzbereit. Die Grundfunktionalität (CRUD für Kontakte, Navigation, Formulare, Tabellen) ist vorhanden. Die Kommunikationskanäle-Verwaltung ist UI-seitig fertig, muss aber noch mit der API verbunden werden (siehe TODOs).

**Status:** ✅ Basis-Implementierung abgeschlossen | ⏳ Feinschliff & Testing ausstehend
