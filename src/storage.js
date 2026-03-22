const STORAGE_KEY = 'math_master_history_v1'

export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((x) => x && typeof x === 'object')
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
  } catch {
    return []
  }
}

export function appendHistory(entry) {
  const next = [...loadHistory(), entry].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

