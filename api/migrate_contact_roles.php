<?php
/**
 * Migration: Kontaktrollen als n:m-Kategorisierung einführen
 *
 * Bisher trägt jeder Kontakt genau eine Rolle im Feld contacts.contact_type
 * (organ | member | retailer | vendor). Künftig ist die Rolle eine
 * Kategorisierung unter dem neuen Kategorietyp "Kontakttyp" — ein Partner kann
 * dadurch mehrere Rollen gleichzeitig tragen (eine Zeile statt Dubletten).
 *
 * Dieses Skript ist idempotent (INSERT IGNORE) und kann beliebig oft laufen.
 * Es legt an:
 *   1. category_type 'type_kontakttyp' ("Kontakttyp")
 *   2. 4 Rollen-Kategorien role_member/retailer/vendor/organ
 *   3. je bestehendem Kontakt eine categorization-Zeile role_<contact_type>
 *      (contact_type bleibt als denormalisierte Primärrolle erhalten)
 *
 * Dry run: migrate_contact_roles.php?dry_run=1 (nur Zählungen, keine Änderungen)
 */

require_once __DIR__ . '/Database.php';

header('Content-Type: text/html; charset=utf-8');

$dryRun = isset($_GET['dry_run']) && $_GET['dry_run'] === '1';

echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Migration: Kontaktrollen</title></head><body>";
echo "<h1>Migration: Kontaktrollen → Kategorisierung" . ($dryRun ? " (DRY RUN)" : "") . "</h1>";
echo "<pre>";

// Rolle (contact_type) → Rollen-Kategorie
$roleCategories = [
    'role_member'   => 'Mitglied',
    'role_retailer' => 'Einzelhandel',
    'role_vendor'   => 'Marktbeschicker',
    'role_organ'    => 'Organ',
];
$validTypes = ['member', 'retailer', 'vendor', 'organ'];

try {
    $db = new Database();
    $conn = $db->getConnection();

    // --- Preflight ---
    $stmt = $conn->query("SHOW TABLES LIKE 'contacts'");
    if (!$stmt->fetch()) {
        throw new Exception("Tabelle 'contacts' nicht gefunden.");
    }

    $contactCount = (int)$conn->query("SELECT COUNT(*) FROM contacts")->fetchColumn();
    echo "Kontakte gesamt: {$contactCount}\n";

    // Verteilung der Primärrollen anzeigen
    $dist = $conn->query("SELECT contact_type, COUNT(*) AS n FROM contacts GROUP BY contact_type")
                 ->fetchAll(PDO::FETCH_ASSOC);
    echo "Verteilung contact_type:\n";
    foreach ($dist as $row) {
        echo "  - {$row['contact_type']}: {$row['n']}\n";
    }

    // Kontakte mit unbekanntem contact_type (bekommen keine Rolle)
    $placeholders = implode(',', array_fill(0, count($validTypes), '?'));
    $stmtUnknown = $conn->prepare("SELECT COUNT(*) FROM contacts WHERE contact_type NOT IN ($placeholders)");
    $stmtUnknown->execute($validTypes);
    $unknownCount = (int)$stmtUnknown->fetchColumn();
    if ($unknownCount > 0) {
        echo "⚠ {$unknownCount} Kontakt(e) mit unbekanntem contact_type — bekommen KEINE Rolle.\n";
    }

    // Wie viele Rollen-Kategorisierungen würden fehlen?
    $stmtMissing = $conn->prepare("
        SELECT COUNT(*) FROM contacts c
        WHERE c.contact_type IN ($placeholders)
          AND NOT EXISTS (
            SELECT 1 FROM categorization z
            WHERE z.entityType = 'contact'
              AND z.entityId = c.id
              AND z.categoryId = CONCAT('role_', c.contact_type)
          )
    ");
    $stmtMissing->execute($validTypes);
    $missingCount = (int)$stmtMissing->fetchColumn();
    echo "Fehlende Rollen-Kategorisierungen: {$missingCount}\n";

    if ($dryRun) {
        echo "\n=== DRY RUN — keine Änderungen vorgenommen ===\n";
        echo "</pre><p><a href='../index.html'>← Zurück zur Vereinsverwaltung</a></p></body></html>";
        exit();
    }

    $conn->beginTransaction();

    // --- 1. Kategorietyp "Kontakttyp" ---
    $conn->prepare("INSERT IGNORE INTO category_types (id, name, applicableEntities) VALUES (?, ?, ?)")
         ->execute(['type_kontakttyp', 'Kontakttyp', 'contact']);
    echo "✓ Kategorietyp 'Kontakttyp' bereit\n";

    // --- 2. Rollen-Kategorien ---
    $insCat = $conn->prepare("INSERT IGNORE INTO categories (id, typeId, name) VALUES (?, 'type_kontakttyp', ?)");
    foreach ($roleCategories as $catId => $catName) {
        $insCat->execute([$catId, $catName]);
    }
    echo "✓ " . count($roleCategories) . " Rollen-Kategorien bereit (" . implode(', ', array_values($roleCategories)) . ")\n";

    // --- 3. Rollen-Kategorisierung je Kontakt (Primärrolle aus contact_type) ---
    $stmtBackfill = $conn->prepare("
        INSERT IGNORE INTO categorization (id, entityType, entityId, categoryId)
        SELECT CONCAT('catz_role_', c.id), 'contact', c.id, CONCAT('role_', c.contact_type)
        FROM contacts c
        WHERE c.contact_type IN ($placeholders)
    ");
    $stmtBackfill->execute($validTypes);
    $inserted = $stmtBackfill->rowCount();
    echo "✓ Rollen-Kategorisierungen angelegt: {$inserted}\n";

    $conn->commit();

    // --- Verifikation ---
    echo "\n=== Verifikation ===\n";
    foreach ($roleCategories as $catId => $catName) {
        $stmtN = $conn->prepare("SELECT COUNT(*) FROM categorization WHERE categoryId = ? AND entityType = 'contact'");
        $stmtN->execute([$catId]);
        echo "  - {$catName}: " . (int)$stmtN->fetchColumn() . " Kontakte\n";
    }
    $totalRoles = (int)$conn->query("
        SELECT COUNT(*) FROM categorization
        WHERE entityType = 'contact' AND categoryId LIKE 'role_%'
    ")->fetchColumn();
    echo "Rollen-Kategorisierungen gesamt: {$totalRoles}\n";
    echo "\n✓✓✓ Migration abgeschlossen! ✓✓✓\n";

} catch (Exception $e) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    echo "\n✗ ERROR: " . $e->getMessage() . "\n";
}

echo "</pre>";
echo "<p><a href='../index.html'>← Zurück zur Vereinsverwaltung</a></p>";
echo "</body></html>";
