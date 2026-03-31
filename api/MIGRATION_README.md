# Datenbank-Migration für lw001 Association Manager

## Problem

Die Produktionsdatenbank ist nicht synchron mit dem Schema in `Database.php`. Es fehlen mehrere Spalten in der `association` Tabelle, was zu SQL-Fehlern führt:

```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'logo' in 'field list'
```

## Lösung: Umfassendes Migrationsskript

Das neue Skript **`migrate_schema.sql`** ist die empfohlene Lösung für alle Schema-Probleme.

### Was macht das Skript?

✅ **Sicher & Idempotent**: Kann mehrfach ausgeführt werden ohne Datenverlust  
✅ **Keine Daten löschen**: Fügt nur fehlende Spalten hinzu  
✅ **Vollständige Prüfung**: Überprüft ALLE Tabellen und Spalten  
✅ **Automatische Verifikation**: Zeigt am Ende alle Tabellen-Strukturen an  

### Geprüfte Tabellen

Das Skript überprüft und korrigiert folgende Tabellen:

1. **association** - Fügt fehlende Spalten hinzu:
   - `logo` (TEXT)
   - `street` (VARCHAR 255)
   - `zip` (VARCHAR 10)
   - `city` (VARCHAR 255)
   - `contact_person` (VARCHAR 255)
   - `phone` (VARCHAR 50)
   - `facebook` (VARCHAR 500)
   - `instagram` (VARCHAR 500)
   - `website` (VARCHAR 500)
   - `email` (VARCHAR 255)
   - `created_at` (TIMESTAMP)

2. **association_sepa** - Erstellt Tabelle falls nicht vorhanden
3. **category_types** - Erstellt Tabelle falls nicht vorhanden
4. **categories** - Erstellt Tabelle falls nicht vorhanden
5. **categorization** - Erstellt Tabelle falls nicht vorhanden
6. **contacts** - Erstellt Tabelle falls nicht vorhanden
7. **contact_communication** - Erstellt Tabelle falls nicht vorhanden

## Anwendung

### Option 1: MySQL Command Line (Empfohlen)

```bash
mysql -u IHR_USERNAME -p IHR_DATENBANKNAME < api/migrate_schema.sql
```

### Option 2: phpMyAdmin

1. In phpMyAdmin einloggen
2. Ihre Datenbank auswählen
3. Zum Tab "SQL" navigieren
4. Inhalt von `api/migrate_schema.sql` kopieren und einfügen
5. "Ausführen" klicken

### Option 3: Andere MySQL-Tools

Öffnen Sie `api/migrate_schema.sql` in Ihrem bevorzugten MySQL-Tool (z.B. MySQL Workbench, HeidiSQL, DBeaver) und führen Sie das Skript aus.

## Verifikation

Nach der Ausführung zeigt das Skript automatisch:

- ✓ Alle Spalten jeder Tabelle
- ✓ Datentypen und Eigenschaften
- ✓ Erfolgsmeldung

Sie können auch manuell prüfen:

```sql
DESCRIBE association;
```

Erwartete Spalten in `association`:
- id, name, description, logo, street, zip, city, contact_person, phone, facebook, instagram, website, email, created_at

## Alte Skripte (nicht mehr empfohlen)

- ❌ `add_logo_column.sql` - Nur für logo-Spalte (unvollständig)
- ❌ `fix_database.sql` - Löscht Tabellen und Daten (gefährlich)

**Verwenden Sie stattdessen `migrate_schema.sql`** - es ist sicherer und vollständiger!

## Nach der Migration

Nach erfolgreicher Migration sollten alle API-Endpunkte funktionieren:

- ✅ POST `/api/association` - Verein erstellen
- ✅ PUT `/api/association/:id` - Verein aktualisieren
- ✅ GET `/api/association` - Verein abrufen

## Troubleshooting

### Problem: "Table 'association' doesn't exist"

Die Tabelle muss zuerst erstellt werden. Das Skript erstellt sie automatisch, wenn sie nicht existiert.

### Problem: "Access denied"

Stellen Sie sicher, dass Ihr MySQL-Benutzer die Berechtigung hat, Tabellen zu ändern:

```sql
GRANT ALTER, CREATE ON datenbankname.* TO 'username'@'localhost';
FLUSH PRIVILEGES;
```

### Problem: Foreign Key Constraints

Falls Foreign Key Fehler auftreten, führen Sie zuerst aus:

```sql
SET FOREIGN_KEY_CHECKS = 0;
-- Dann migrate_schema.sql ausführen
SET FOREIGN_KEY_CHECKS = 1;
```

## Backup-Empfehlung

Obwohl das Skript sicher ist, empfehlen wir vor jeder Migration ein Backup:

```bash
mysqldump -u IHR_USERNAME -p IHR_DATENBANKNAME > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Support

Bei Problemen:
1. Prüfen Sie die MySQL-Logs
2. Führen Sie das Skript erneut aus (es ist idempotent)
3. Kontaktieren Sie den Entwickler

---

**Datum**: 26. März 2026  
**Version**: 1.0  
**Projekt**: lw001 Association Manager
