# Kontakte – Anforderungsspezifikation

## Überblick

Der Bereich „Kontakte" umfasst alle Personen und Organisationen, die im System verwaltet werden. Dazu gehören drei Hauptgruppen:

- **Organe** – interne Vereinsorgane und Funktionsträger
- **Mitglieder** – eingetragene Vereinsmitglieder
- **Einzelhändler / Geschäftspartner** – externe Handelspartner

Diese drei Bereiche werden als **separate Tabs** unter dem Bereich „Verwaltung" in der Navigation eingegliedert:

```
Verwaltung
  ├── Verein (bestehend)
  ├── Organe (NEU)
  ├── Mitglieder (NEU)
  └── Einzelhändler (NEU)
```

---

## 1. Stammdaten

Jeder Kontakt enthält folgende Grundinformationen:

| Feld | Beschreibung | Typ | Pflichtfeld |
|---|---|---|---|
| **Lage** | Standort / Lage des Kontakts (Kategorie, siehe Abschnitt 6.4) | Kategorie-Referenz | Optional |
| **Status** | z.B. aktiv, inaktiv, gekündigt | Text/Dropdown | Ja |
| **Eintrittsdatum** | Datum des Eintritts oder der Aufnahme | Datum | Optional |
| **Firma** | Name der Organisation oder des Unternehmens | Text | Ja |
| **Anrede** | z.B. Herr, Frau, Divers | Dropdown | Optional |
| **Ansprechpartner** | Name der zuständigen Person | Text | Optional |

### Technische Umsetzung – Stammdaten

**Datenbank-Tabelle:** `contacts`

```sql
CREATE TABLE contacts (
  id VARCHAR(50) PRIMARY KEY,
  contact_type VARCHAR(50) NOT NULL,  -- 'organ', 'member', 'retailer'
  location_category_id VARCHAR(50),   -- FK zu categories (Lage)
  status VARCHAR(50) NOT NULL,        -- 'active', 'inactive', 'terminated'
  entry_date DATE,
  company_name VARCHAR(255) NOT NULL,
  salutation VARCHAR(50),             -- 'Herr', 'Frau', 'Divers'
  contact_person VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_category_id) REFERENCES categories(id) ON DELETE SET NULL
)
```

---

## 2. Adresse

### 2.1 Geschäftsadresse (Hauptadresse)

Jeder Kontakt hat eine Hauptadresse mit folgenden Feldern:

- **Straße**
- **PLZ**
- **Ort**

### 2.2 Abweichende Geschäftsadresse

Falls die Korrespondenz- oder Rechnungsadresse von der Hauptadresse abweicht, können folgende Felder zusätzlich erfasst werden:

- **Straße (abweichend)**
- **PLZ (abweichend)**
- **Ort (abweichend)**

Die abweichende Geschäftsadresse ist **optional** und wird nur befüllt, wenn sie von der Hauptadresse abweicht.

### Technische Umsetzung – Adresse

**Erweiterung der `contacts`-Tabelle:**

```sql
-- Hauptadresse
street VARCHAR(255),
zip VARCHAR(10),
city VARCHAR(255),

-- Abweichende Adresse (optional)
alt_street VARCHAR(255),
alt_zip VARCHAR(10),
alt_city VARCHAR(255)
```

**Entscheidung:** Einzelfelder (nicht Freitext) für Konsistenz und Filterbarkeit.

---

## 3. Kommunikationskanäle

Kommunikationsdaten werden in einer **separaten verknüpften Tabelle** gespeichert. Pro Kontakt können beliebig viele Einträge angelegt werden.

### 3.1 Struktur der Kommunikationstabelle

Jeder Eintrag besteht aus:

| Feld | Beschreibung | Typ |
|---|---|---|
| **Typ** | Kategorie des Kanals (siehe 3.2) | Dropdown/Kategorie |
| **Bezeichnung** | Genauere Beschreibung (z.B. „Zentrale", „Mobil", „Geschäftsführer") | Text |
| **Wert** | Die eigentliche Angabe (Nummer, Adresse, Handle, URL) | Text |
| **Hauptkontakt** | Markierung, ob dies der bevorzugte Kanal ist | Boolean |

### 3.2 Mögliche Typen

- **Telefon** – z.B. Zentrale, Mobil, Fax
- **Email** – z.B. Allgemein, Ansprechpartner
- **Website** – Homepage, Onlineshop
- **Social Media** – z.B. Instagram, LinkedIn, Facebook, YouTube

### 3.3 Vorteile der separaten Tabelle

- Unbegrenzt viele Einträge pro Kontakt möglich
- Flexibel erweiterbar für neue Kanaltypen
- Keine leeren Spalten in der Stammdatentabelle
- Klare Kennzeichnung des bevorzugten Hauptkontakts

### Technische Umsetzung – Kommunikationskanäle

**Datenbank-Tabelle:** `contact_communication`

```sql
CREATE TABLE contact_communication (
  id VARCHAR(50) PRIMARY KEY,
  contact_id VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,          -- 'phone', 'email', 'website', 'social_media'
  label VARCHAR(255),                 -- 'Zentrale', 'Mobil', 'Geschäftsführer', etc.
  value TEXT NOT NULL,                -- Telefonnummer, E-Mail, URL, etc.
  is_primary BOOLEAN DEFAULT 0,       -- Hauptkontakt ja/nein
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
)
```

**Entscheidung:** Typ als **Dropdown** (über Kategorie-Framework steuerbar), nicht frei eingebbar.

---

## 4. Begriffsentscheidung

Für die Benennung des Bereichs wurde **„Kontakte"** gewählt, da:

- es dem Branchenstandard gängiger Vereinsverwaltungs-Softwares entspricht (z.B. ClubDesk, campai)
- es alle drei Gruppen (Organe, Mitglieder, Einzelhändler) neutral und intuitiv abdeckt
- es in digitalen Anwendungen am verbreitetsten und verständlichsten ist

**Alternativbegriffe die geprüft wurden:** Register, Verzeichnis, Geschäftspartner, Adressbuch.

---

## 5. Kategorien

Alle Kategorien nutzen dasselbe gemeinsame **Kategorie-Framework** (bereits in lw001 implementiert) und werden per View in die jeweiligen Bereiche eingebunden. Es gibt folgende Kategorietypen:

### 5.1 Mitglieder

| Kategorie | Beschreibung |
|---|---|
| **Vollmitglied** | Eingetragenes Mitglied mit allen Rechten |
| **Schnuppermitglied** | Mitglied auf Probe / Einstiegsstufe |
| **Fördermitglied** | Unterstützendes Mitglied ohne aktive Teilnahme |
| **Ehrenmitglied** | Besondere Auszeichnung durch den Verein |
| **Passivmitglied** | Mitglied ohne aktive Vereinsteilnahme |
| **Gekündigt / Ausgetreten** | Ehemaliges Mitglied |

### 5.2 Organe

| Kategorie | Beschreibung |
|---|---|
| **1. Vorstand** | Vorsitzender des Vereins |
| **2. Vorstand** | Stellvertretender Vorsitzender |
| **Schatzmeister / Kassenwart** | Verantwortlich für Finanzen (eine Funktion) |
| **Geschäftsstellenleiter** | Leitung der Geschäftsstelle |
| **Beirat** | Beratendes Organ |
| **Kassenprüfer** | Prüfung der Vereinsfinanzen |
| **Schriftführer** | Protokoll und Schriftverkehr |

**Entscheidung:** Schatzmeister & Kassenwart = **eine Rolle** („Schatzmeister / Kassenwart").

### 5.3 Einzelhandel

| Kategorie | Beschreibung |
|---|---|
| **Normal** | Standardkonditionen |
| **Vergünstigt** | Reduzierte Konditionen / Sondertarif |
| **Inaktiv / Ruhend** | Derzeit nicht aktiver Partner |

### 5.4 Lage

**Kategorietyp:** Lage  
Die Kategorien beschreiben den Standort des Kontakts innerhalb der Stadt. Gilt übergreifend für alle Kontakttypen und wird per View eingebunden.

| Kategorie |
|---|
| Katzenlauf |
| Marktplatz |
| Hauptstraße |
| Grabengasse |
| Fußgängerzone Anfang |
| Burgenpassage |
| Fußgängerzone Mitte |
| Fußgängerzone Ende |
| WeinheimGaleria |
| Institutstr. |
| Karlsberg Carré |
| Bahnhofstraße |
| Mittlere Hauptstr. |
| Untere Hauptstr. |
| Friedrichstr. |
| Außerhalb |

---

## 6. Technische Umsetzung – Kategorien

### Übersicht aller Kategorietypen und ihrer Kategorien

| Kategorietyp | Kategorien (Beispiele) |
|---|---|
| **Kontakttyp** | Organ, Mitglied, Einzelhandel |
| **Mitglied** | Vollmitglied, Schnuppermitglied, Fördermitglied, ... |
| **Organ** | 1. Vorstand, 2. Vorstand, Schatzmeister, ... |
| **Einzelhandel** | Normal, Vergünstigt, Inaktiv |
| **Lage** | Marktplatz, Fußgängerzone Mitte, Außerhalb, ... |

### Implementierung

- Ein gemeinsames **Kategorie-Framework** für alle Kategorietypen (bereits implementiert in lw001)
- Jeder Kategorietyp wird als **View** (gefilterte Ansicht) eingebunden
- Keine separate Datenhaltung pro Kategorietyp – alles in einer zentralen Kategorientabelle
- Neue Kategorietypen oder Werte jederzeit erweiterbar ohne Strukturänderung
- Die Stammdatentabelle (`contacts`) referenziert die Kategorien per Verlinkung

**Bestehende Tabellen (bereits implementiert):**
- `category_types` – Kategorietypen (z.B. „Mitglied", „Organ", „Lage")
- `categories` – Kategorien (z.B. „Vollmitglied", „1. Vorstand", „Marktplatz")
- `categorization` – Verknüpfung Entity ↔ Kategorie

---

## 7. Offene Punkte & Entscheidungen

| # | Frage | Entscheidung |
|---|---|---|
| 1 | Sind die Kommunikations-Typen fix (Dropdown) oder frei eingebbar? | **Dropdown** – über Kategorie-Framework steuerbar, konsistente Daten |
| 2 | Ist „Firma" bei Organen und Mitgliedern ein Pflichtfeld oder optional? | **Pflichtfeld** – für alle Kontakttypen (kann bei Privatpersonen = Name der Person sein) |
| 3 | Soll die abweichende Adresse dieselben Einzelfelder haben oder ein Freitextfeld sein? | **Einzelfelder** (Straße, PLZ, Ort) – konsistent mit Hauptadresse, filterbar |
| 4 | Schatzmeister & Kassenwart – eine oder zwei separate Rollen? | **Eine Rolle** – „Schatzmeister / Kassenwart" |

---

## 8. Verifizierungsstatus

### ✅ Bereits implementiert (lw001)

- **Kategorie-Framework** – `category_types`, `categories`, `categorization` Tabellen
- **CRUD-Operationen** für Kategorien (Frontend + Backend)
- **Navigation** – Verwaltung/Einstellungen-Struktur
- **Vereins-Stammdaten** – `association`-Tabelle mit Adresse, Kontaktdaten

### ❌ Noch zu implementieren

- **Kontakte-Tabelle** (`contacts`) – Stammdaten für Organe, Mitglieder, Einzelhändler
- **Kommunikationstabelle** (`contact_communication`) – Flexible Kommunikationskanäle
- **Navigation** – Tabs für Organe, Mitglieder, Einzelhändler unter Verwaltung
- **Frontend-Komponenten** – Formulare, Tabellen, Detailansichten für Kontakte
- **API-Endpunkte** – CRUD für Kontakte und Kommunikationskanäle
- **Seed-Daten** – Kategorien für Mitglieder, Organe, Einzelhandel, Lage

### ⚠️ Teilweise implementiert

- **SEPA-Bankverbindung** – Tabelle `association_sepa` existiert, Frontend-Integration als TODO markiert

---

## 9. Datenbank-Schema (Komplett)

### Neue Tabellen

```sql
-- Kontakte (Organe, Mitglieder, Einzelhändler)
CREATE TABLE contacts (
  id VARCHAR(50) PRIMARY KEY,
  contact_type VARCHAR(50) NOT NULL,  -- 'organ', 'member', 'retailer'
  location_category_id VARCHAR(50),   -- FK zu categories (Lage)
  status VARCHAR(50) NOT NULL,        -- 'active', 'inactive', 'terminated'
  entry_date DATE,
  company_name VARCHAR(255) NOT NULL,
  salutation VARCHAR(50),             -- 'Herr', 'Frau', 'Divers'
  contact_person VARCHAR(255),
  
  -- Hauptadresse
  street VARCHAR(255),
  zip VARCHAR(10),
  city VARCHAR(255),
  
  -- Abweichende Adresse (optional)
  alt_street VARCHAR(255),
  alt_zip VARCHAR(10),
  alt_city VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Kommunikationskanäle
CREATE TABLE contact_communication (
  id VARCHAR(50) PRIMARY KEY,
  contact_id VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,          -- 'phone', 'email', 'website', 'social_media'
  label VARCHAR(255),                 -- 'Zentrale', 'Mobil', 'Geschäftsführer', etc.
  value TEXT NOT NULL,                -- Telefonnummer, E-Mail, URL, etc.
  is_primary BOOLEAN DEFAULT 0,       -- Hauptkontakt ja/nein
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);
```

### Bestehende Tabellen (bereits implementiert)

```sql
-- Kategorietypen
CREATE TABLE category_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  applicableEntities TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kategorien
CREATE TABLE categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  typeId VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (typeId) REFERENCES category_types(id) ON DELETE SET NULL
);

-- Kategorisierung (Verknüpfung Entity ↔ Kategorie)
CREATE TABLE categorization (
  id VARCHAR(50) PRIMARY KEY,
  entityType VARCHAR(50) NOT NULL,
  entityId VARCHAR(50) NOT NULL,
  categoryId VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entityType, entityId, categoryId),
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
);
```

---

## 10. Implementierungs-Roadmap

### Phase 1: Datenbank & Backend
1. Tabellen `contacts` und `contact_communication` erstellen
2. API-Endpunkte für CRUD-Operationen (PHP + Node.js)
3. Seed-Daten für Kategorien (Mitglieder, Organe, Einzelhandel, Lage)

### Phase 2: Frontend – Basis
4. Navigation erweitern (Tabs: Organe, Mitglieder, Einzelhändler)
5. Kontakte-Tabelle (Liste mit Suche, Filter, Sortierung)
6. Kontakt-Formular (Stammdaten + Adresse)

### Phase 3: Frontend – Kommunikation
7. Kommunikationskanäle-Verwaltung (Tabelle im Formular)
8. Hauptkontakt-Markierung
9. Validierung (IBAN, E-Mail, Telefon, URLs)

### Phase 4: Zusatzfunktionen
10. Import/Export (CSV, Excel)
11. Serienbrief-Funktion
12. Statistiken & Reports
13. Historisierung (Änderungsprotokoll)

---

## 11. Hinweise für die Implementierung

### Frontend-Komponenten (React)

- `ContactsTable.jsx` – Liste aller Kontakte (mit Filter nach Typ)
- `ContactForm.jsx` – Formular für Stammdaten + Adresse
- `CommunicationChannelsTable.jsx` – Verwaltung der Kommunikationskanäle (eingebettet im ContactForm)
- `ContactDetail.jsx` – Detailansicht eines Kontakts

### API-Endpunkte

```
GET    /api/contacts              - Alle Kontakte abrufen
GET    /api/contacts/:id          - Einzelnen Kontakt abrufen
POST   /api/contacts              - Neuen Kontakt erstellen
PUT    /api/contacts/:id          - Kontakt aktualisieren
DELETE /api/contacts/:id          - Kontakt löschen

GET    /api/contacts/:id/communication       - Kommunikationskanäle eines Kontakts
POST   /api/contacts/:id/communication       - Neuen Kanal hinzufügen
PUT    /api/communication/:id                - Kanal aktualisieren
DELETE /api/communication/:id                - Kanal löschen
```

### Validierung

- **IBAN:** Format-Prüfung (DE + 20 Zeichen)
- **E-Mail:** RFC 5322 Standard
- **Telefon:** Flexibel (internationale Formate)
- **URLs:** HTTP/HTTPS-Protokoll

---

## 12. Zusammenfassung

Der Kontakte-Bereich ist eine **zentrale Erweiterung** des lw001-Moduls (Vereinsverwaltung) und ermöglicht die strukturierte Verwaltung von:

- **Organen** (Vorstand, Beirat, etc.)
- **Mitgliedern** (Voll-, Förder-, Ehrenmitglieder, etc.)
- **Einzelhändlern** (Geschäftspartner mit verschiedenen Konditionen)

Die Implementierung nutzt das **bestehende Kategorie-Framework** und erweitert es um zwei neue Tabellen (`contacts`, `contact_communication`). Die flexible Struktur ermöglicht beliebig viele Kommunikationskanäle pro Kontakt und eine klare Kategorisierung über das zentrale Kategorie-System.

**Status:** Spezifikation abgeschlossen, Implementierung steht noch aus.
