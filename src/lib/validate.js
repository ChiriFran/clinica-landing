// Validacion y limpieza de una inscripcion.
// Modulo puro: lo usan el formulario (src/components/RegistrationSection.jsx) a
// traves de registrationsRepo y el test scripts/test-validate.mjs.
// Las reglas de firestore.rules validan lo mismo del lado del servidor.

const clean = (v, max = 300) => String(v ?? '').trim().slice(0, max)
const digits = (v) => String(v || '').replace(/\D/g, '')
const addIfPresent = (target, key, value, max) => {
  const cleaned = clean(value, max)
  if (cleaned) target[key] = cleaned
}

export const emailLooksValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim())

export function sanitizeRegistration(payload, meta = {}) {
  const p = payload.persona || {}
  const m = payload.moto || {}
  const a = payload.alimentacion || {}
  const f = payload.final || {}

  const errors = []
  if (clean(p.nombre, 80).length < 2) errors.push('Falta el nombre')
  if (clean(p.apellido, 80).length < 2) errors.push('Falta el apellido')
  if (digits(p.dni).length < 7) errors.push('DNI inválido')
  if (!emailLooksValid(p.email)) errors.push('Email inválido')
  if (digits(p.whatsapp).length < 10) errors.push('WhatsApp incompleto (incluí el área)')
  if (!clean(p.experiencia, 60)) errors.push('Falta elegir el nivel de experiencia')
  if (!clean(m.cilindradaRango, 20)) errors.push('Falta el rango de cilindrada')
  if (clean(m.anio, 4) && !/^(19|20)\d{2}$/.test(clean(m.anio, 4))) errors.push('Año inválido')
  if (a.almuerzo === 'si' && !clean(a.opcionAlmuerzo, 40)) errors.push('Falta elegir la opción de almuerzo')
  if (f.aceptaTerminos !== true) errors.push('Falta la confirmación de términos')

  if (errors.length) return { errors, data: null }

  const persona = {
    nombre: clean(p.nombre, 80),
    apellido: clean(p.apellido, 80),
    dni: clean(p.dni, 16),
    email: clean(p.email, 160).toLowerCase(),
    whatsapp: clean(p.whatsapp, 40),
    experiencia: clean(p.experiencia, 60),
  }
  addIfPresent(persona, 'localidad', p.localidad, 80)
  addIfPresent(persona, 'comoSeEntero', p.comoSeEntero, 120)

  const alimentacion = {}
  addIfPresent(alimentacion, 'almuerzo', a.almuerzo, 10)
  if (a.almuerzo === 'si') addIfPresent(alimentacion, 'opcionAlmuerzo', a.opcionAlmuerzo, 40)
  addIfPresent(alimentacion, 'restricciones', a.restricciones, 300)

  const final = { aceptaTerminos: true }
  addIfPresent(final, 'grupo', f.grupo, 60)
  addIfPresent(final, 'notas', f.notas, 500)

  const data = {
    receipt: '',
    status: 'pendiente',
    contentVersion: Number(meta.contentVersion) || 1,
    source: 'web',
    createdAt: new Date().toISOString(),
    persona,
    moto: {
      cilindradaRango: clean(m.cilindradaRango, 20),
    },
    alimentacion,
    final,
  }

  return { errors: [], data }
}