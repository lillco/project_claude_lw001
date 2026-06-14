/**
 * Kontaktrollen-Modell
 *
 * Die Rolle(n) eines Geschäftspartners liegen als Kategorisierung unter dem
 * Kategorietyp "Kontakttyp" (siehe api/migrate_contact_roles.php). Die
 * Rollen-Kategorie-IDs entsprechen exakt den alten contact_type-Werten
 * (role_<contact_type>), sodass contact_type als denormalisierte "Primärrolle"
 * erhalten bleibt. Ein Partner kann mehrere Rollen gleichzeitig tragen.
 */

export const ROLE_KEYS = ['organ', 'member', 'retailer', 'vendor']

export const ROLE_LABELS = {
  organ: 'Organ',
  member: 'Mitglied',
  retailer: 'Einzelhändler',
  vendor: 'Marktbeschicker',
}

// roleKey ↔ categoryId
export const ROLE_CATEGORY_ID = {
  organ: 'role_organ',
  member: 'role_member',
  retailer: 'role_retailer',
  vendor: 'role_vendor',
}

export const CATEGORY_ID_ROLE = Object.fromEntries(
  Object.entries(ROLE_CATEGORY_ID).map(([role, catId]) => [catId, role])
)

export const ROLE_CATEGORY_IDS = Object.values(ROLE_CATEGORY_ID)

/**
 * Map<contactId, Set<roleKey>> aus den Kategorisierungs-Datensätzen bauen.
 */
export function buildRoleMap(categorizations = []) {
  const map = new Map()
  for (const c of categorizations) {
    if (c.entityType !== 'contact') continue
    const role = CATEGORY_ID_ROLE[c.categoryId]
    if (!role) continue
    if (!map.has(c.entityId)) map.set(c.entityId, new Set())
    map.get(c.entityId).add(role)
  }
  return map
}

/**
 * Effektive Rollen eines Kontakts: explizite Rollen-Kategorisierungen, sonst
 * Fallback auf das alte contact_type (für noch nicht migrierte Kontakte).
 */
export function getEffectiveRoles(roleMap, contact) {
  const explicit = roleMap.get(contact.id)
  if (explicit && explicit.size > 0) return explicit
  return new Set(contact.contact_type ? [contact.contact_type] : [])
}

export function contactHasRole(roleMap, contact, roleKey) {
  return getEffectiveRoles(roleMap, contact).has(roleKey)
}
