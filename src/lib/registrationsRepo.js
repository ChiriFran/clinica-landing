import { collection, deleteDoc, doc, getDocs, limit, orderBy, query, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import { sanitizeRegistration } from './validate'

const COLLECTION = 'registrations'
const MAX_LOADED = 500

export { emailLooksValid, sanitizeRegistration } from './validate'

async function hashId(version, email) {
  const raw = `${version}|${String(email).toLowerCase()}`
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `v${version}-${hex.slice(0, 16)}`
}

export async function submitRegistration(payload, meta = {}) {
  const { errors, data } = sanitizeRegistration(payload, meta)
  if (errors.length) {
    const err = new Error(errors[0])
    err.details = errors
    throw err
  }

  const id = await hashId(data.contentVersion, data.persona.email)
  data.receipt = `INS-${id.slice(-6).toUpperCase()}`

  try {
    // setDoc sobre un id derivado del email: si ya existe, Firestore lo ve como
    // update y las reglas lo rechazan -> no se pueden duplicar inscripciones.
    await setDoc(doc(db, COLLECTION, id), data)
    return { id, receipt: data.receipt }
  } catch (err) {
    if (err.code === 'permission-denied') {
      throw new Error('Ya existe una inscripción con ese email para este evento.')
    }
    throw err
  }
}

export async function listRegistrations() {
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(MAX_LOADED)))
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return { items, stats: computeStats(items) }
}

export function computeStats(items) {
  const stats = { total: items.length, pendientes: 0, aprobados: 0, rechazados: 0, cancelados: 0, almuerzo: 0, conBebida: 0, grupo: 0 }
  for (const i of items) {
    if (i.status === 'pendiente') stats.pendientes += 1
    if (i.status === 'aprobado') stats.aprobados += 1
    if (i.status === 'rechazado') stats.rechazados += 1
    if (i.status === 'cancelado') stats.cancelados += 1
    if (i.alimentacion?.almuerzo === 'si') stats.almuerzo += 1
    if (i.alimentacion?.bebida === 'si') stats.conBebida += 1
    if (String(i.final?.grupo || '').toLowerCase().startsWith('si')) stats.grupo += 1
  }
  return stats
}

export async function setRegistrationStatus(id, status) {
  await updateDoc(doc(db, COLLECTION, id), { status, updatedAt: new Date().toISOString() })
}

export async function deleteRegistration(id) {
  await deleteDoc(doc(db, COLLECTION, id))
}