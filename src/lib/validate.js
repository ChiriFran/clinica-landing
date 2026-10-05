// Validacion y limpieza de una inscripcion.
// Modulo puro: lo usan el formulario (src/components/RegistrationSection.jsx) a
// traves de registrationsRepo y el test scripts/test-validate.mjs.
// Las reglas de firestore.rules validan lo mismo del lado del servidor.

const clean = (v, max = 300) => String(v ?? '').trim().slice(0, max)
const digits = (v) => String(v || '').replace(/\D/g, '')

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
  if (!clean(m.marca, 60)) errors.push('Falta la marca de la moto')
  if (!clean(m.modelo, 60)) errors.push('Falta el modelo de la moto')
  if (clean(m.anio, 4) && !/^(19|20)\d{2}$/.test(clean(m.anio, 4))) errors.push('Año inválido')
  if (a.almuerzo === 'si' && !clean(a.opcionAlmuerzo, 40)) errors.push('Falta elegir la opción de almuerzo')
  if (f.aceptaTerminos !== true) errors.push('Falta la confirmación de términos')

  if (errors.length) return { errors, data: null }

  const data = {
    receipt: '',
    status: 'pendiente',
    contentVersion: Number(meta.contentVersion) || 1,
    source: 'web',
    createdAt: new Date().toISOString(),
    persona: {
      nombre: clean(p.nombre, 80),
      apellido: clean(p.apellido, 80),
      dni: clean(p.dni, 16),
      email: clean(p.email, 160).toLowerCase(),
      whatsapp: clean(p.whatsapp, 40),
      localidad: clean(p.localidad, 80),
      experiencia: clean(p.experiencia, 60),
      comoSeEntero: clean(p.comoSeEntero, 120),
    },
    moto: {
      marca: clean(m.marca, 60),
      modelo: clean(m.modelo, 60),
      anio: clean(m.anio, 4),
      cilindrada: clean(m.cilindrada, 12),
      tipo: clean(m.tipo, 60),
      aptaParaTierra: clean(m.aptaParaTierra, 20),
      tieneSeguro: clean(m.tieneSeguro, 20),
    },
    alimentacion: {
      almuerzo: clean(a.almuerzo, 10),
      opcionAlmuerzo: clean(a.opcionAlmuerzo, 40),
      restricciones: clean(a.restricciones, 300),
      bebida: clean(a.bebida, 10),
    },
    final: {
      grupo: clean(f.grupo, 60),
      notas: clean(f.notas, 500),
      aceptaTerminos: true,
    },
  }

  return { errors: [], data }
}