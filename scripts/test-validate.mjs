import { sanitizeRegistration } from '../src/lib/validate.js'

const good = {
  persona: {
    nombre: 'Juan',
    apellido: 'Perez',
    dni: '30111222',
    email: 'Juan.Perez@Mail.com',
    whatsapp: '11 5044-3333',
    localidad: 'Lujan',
    experiencia: 'Principiante',
  },
  moto: { marca: 'Honda', modelo: 'XR 250L', anio: '2021', cilindrada: '250', tipo: 'Trail', aptaParaTierra: 'si', tieneSeguro: 'no' },
  alimentacion: { almuerzo: 'si', opcionAlmuerzo: 'parrilla', restricciones: 'sin gluten', bebida: 'si' },
  final: { grupo: 'Si, quiero rodar en grupo', notas: '', aceptaTerminos: true },
}

const a = sanitizeRegistration(good)
console.log('valido ->', a.errors.length === 0, JSON.stringify(a.data.persona.email))

const badCases = [
  ['sin email', { ...good, persona: { ...good.persona, email: 'nope' } }],
  ['dni corto', { ...good, persona: { ...good.persona, dni: '12' } }],
  ['sin terminos', { ...good, final: { ...good.final, aceptaTerminos: false } }],
  ['almuerzo sin opcion', { ...good, alimentacion: { ...good.alimentacion, opcionAlmuerzo: '' } }],
  ['anio raro', { ...good, moto: { ...good.moto, anio: '99' } }],
  ['moto sin marca', { ...good, moto: { ...good.moto, marca: '  ' } }],
]

for (const [name, payload] of badCases) {
  const r = sanitizeRegistration(payload)
  console.log(`${r.errors.length ? 'OK  ' : 'FALLA'} ${name} -> ${r.errors.join(' | ') || 'sin errores'}`)
}

console.log('\nEjemplo crudo del txt:', sanitizeRegistration(good).data.moto)