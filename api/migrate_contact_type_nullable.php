<?php
/**
 * Migration: contacts.contact_type nullable machen (Stilllegung)
 *
 * Die Reiter-Zugehörigkeit läuft jetzt ausschließlich über die Kategorisierung
 * (Typ "Kontakttyp"). Das alte Feld contact_type wird vom Code nicht mehr
 * geschrieben. Damit das Anlegen neuer Kontakte (Insert ohne contact_type)
 * nicht an der NOT-NULL-Bedingung scheitert, wird die Spalte nullable gemacht.
 *
 * Die Spalte bleibt vorerst als (tote) Spalte erhalten — ein physischer DROP
 * kann nach einem vollen Markt-/Abrechnungszyklus separat erfolgen.
 *
 * Dry run: migrate_contact_type_nullable.php?dry_run=1
 */

require_once __DIR__ . '/Database.php';

header('Content-Type: text/html; charset=utf-8');

$dryRun = isset($_GET['dry_run']) && $_GET['dry_run'] === '1';

echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Migration: contact_type nullable</title></head><body>";
echo "<h1>Migration: contacts.contact_type nullable" . ($dryRun ? " (DRY RUN)" : "") . "</h1><pre>";

try {
    $db = new Database();
    $conn = $db->getConnection();

    $col = $conn->query("SHOW COLUMNS FROM contacts LIKE 'contact_type'")->fetch(PDO::FETCH_ASSOC);
    if (!$col) {
        echo "✓ Spalte 'contact_type' existiert nicht (mehr) — nichts zu tun.\n";
        echo "</pre><p><a href='../index.html'>← Zurück</a></p></body></html>";
        exit();
    }
    echo "Aktuell: Type={$col['Type']}, Null={$col['Null']}\n";

    if (strtoupper($col['Null']) === 'YES') {
        echo "✓ Spalte ist bereits nullable — nichts zu tun.\n";
        echo "</pre><p><a href='../index.html'>← Zurück</a></p></body></html>";
        exit();
    }

    if ($dryRun) {
        echo "\n=== DRY RUN — würde Spalte auf NULL setzen ===\n";
        echo "</pre><p><a href='../index.html'>← Zurück</a></p></body></html>";
        exit();
    }

    $conn->exec("ALTER TABLE contacts MODIFY contact_type VARCHAR(50) NULL");
    $after = $conn->query("SHOW COLUMNS FROM contacts LIKE 'contact_type'")->fetch(PDO::FETCH_ASSOC);
    echo "✓ Spalte geändert → Type={$after['Type']}, Null={$after['Null']}\n";
    echo "\n✓✓✓ Migration abgeschlossen! ✓✓✓\n";
    echo "contact_type wird vom Code nicht mehr verwendet; physischer DROP optional später.\n";

} catch (Exception $e) {
    echo "\n✗ ERROR: " . $e->getMessage() . "\n";
}

echo "</pre><p><a href='../index.html'>← Zurück zur Vereinsverwaltung</a></p></body></html>";
