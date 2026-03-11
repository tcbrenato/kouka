export function fmt(n) {
  if (!n && n !== 0) return '—'
  return Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' F'
}

export function calcItem(item) {
  const qty = parseFloat(item.qty) || 0
  const pu = parseFloat(item.pu) || 0
  return qty * pu
}

export function calcTotals(items, tva = true, aib = false) {
  const ht = items.reduce((s, it) => s + calcItem(it), 0)
  const aibAmt = aib ? Math.round(ht * 0.01) : 0
  const base = ht + aibAmt
  const tvaAmt = tva ? Math.round(base * 0.18) : 0
  const ttc = base + tvaAmt
  return { ht, aibAmt, tvaAmt, ttc }
}

export function newItem() {
  return { id: Date.now(), code: '', desc: '', qty: '1', pu: '' }
}

export const DOC_LABELS = {
  proforma: { title: 'PRO FORMA', short: 'PF', prefix: 'PF' },
  commande: { title: 'BON DE COMMANDE', short: 'BC', prefix: 'BC' },
  facture:  { title: 'FACTURE', short: 'FA', prefix: 'FA' },
}

// Default seller info (Malak and Co)
export const DEFAULT_SELLER = {
  name: 'MALAK AND CO',
  address: '390 Avenue Pape Jean-Paul II, Cotonou Bénin',
  tel: '01 61 81 81 81',
  email: 'koukapastry@gmail.com',
  rccm: 'RB/COT 24 B 37142',
  ifu: '3202410481922',
}

export function today() {
  return new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function newDocNum(prefix) {
  const d = new Date()
  const y = d.getFullYear()
  const seq = String(Math.floor(Math.random() * 900) + 100)
  return `${prefix}-${y}-${seq}`
}
