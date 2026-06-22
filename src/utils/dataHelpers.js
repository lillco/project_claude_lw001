// Generate unique ID: timestamp + random suffix so a tight loop (e.g. saving
// several categorizations at once) cannot mint duplicate primary keys within
// the same millisecond.
export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
