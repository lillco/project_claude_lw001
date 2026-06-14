/**
 * Kontakt-Kategorisierung
 *
 * Die Reiter-Zugehörigkeit eines Kontakts ergibt sich ausschließlich aus seinen
 * Kategorisierungen unter dem Kategorietyp "Kontakttyp" — es gibt KEIN
 * contact_type-Feld und keine "Rollen"-Abstraktion mehr.
 *
 * Die categoryId-Werte (z.B. 'role_vendor') sind reine Kategorie-IDs in der DB;
 * der Präfix ist historisch und ohne weitere Bedeutung.
 */

export const KONTAKTTYP_TYPE_ID = 'type_kontakttyp'

// Welche "Kontakttyp"-Kategorie jeder Reiter repräsentiert.
export const TAB_CATEGORY_ID = {
  organe: 'role_organ',
  mitglieder: 'role_member',
  einzelhaendler: 'role_retailer',
  marktbeschicker: 'role_vendor',
}

/**
 * Prüft, ob eine (komma-separierte) applicableEntities-Angabe eine Entität enthält.
 */
export function applicableTo(entitiesStr, entity) {
  return String(entitiesStr || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .includes(entity)
}

/**
 * Map<contactId, Set<categoryId>> aus den Kategorisierungs-Datensätzen
 * (nur entityType 'contact').
 */
export function buildContactCategoryMap(categorizations = []) {
  const map = new Map()
  for (const c of categorizations) {
    if (c.entityType !== 'contact') continue
    if (!map.has(c.entityId)) map.set(c.entityId, new Set())
    map.get(c.entityId).add(c.categoryId)
  }
  return map
}

export function contactHasCategory(map, contactId, categoryId) {
  return !!map.get(contactId)?.has(categoryId)
}
