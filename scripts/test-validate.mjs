import assert from 'node:assert/strict'
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
  moto: { cilindradaRango: 'hasta 300' },
  alimentacion: { almuerzo: 'si', opcionAlmuerzo: 'parrilla', restricciones: 'sin gluten' },
  final: { grupo: 'Si, quiero rodar en grupo', notas: '', aceptaTerminos: true },
}

const a = sanitizeRegistration(good)
assert.equal(a.errors.length, 0, a.errors.join(' | '))
assert.equal(a.data.persona.email, 'juan.perez@mail.com')
assert.equal(a.data.moto.cilindradaRango, 'hasta 300')
assert.deepEqual(a.data.moto, { cilindradaRango: 'hasta 300' })
assert.equal('bebida' in a.data.alimentacion, false)
console.log('valido sin marca/modelo ->', JSON.stringify(a.data.persona.email))

const withoutLunch = sanitizeRegistration({
  ...good,
  alimentacion: { ...good.alimentacion, almuerzo: 'no', opcionAlmuerzo: '', restricciones: '' },
})
assert.equal(withoutLunch.errors.length, 0, withoutLunch.errors.join(' | '))
assert.deepEqual(withoutLunch.data.alimentacion, { almuerzo: 'no' })

const withoutOptionalValues = sanitizeRegistration({
  ...good,
  persona: { ...good.persona, localidad: '', comoSeEntero: '' },
  alimentacion: { almuerzo: 'no', opcionAlmuerzo: '', restricciones: '' },
  final: { ...good.final, grupo: '', notas: '' },
})
assert.deepEqual(withoutOptionalValues.data.persona, {
  nombre: 'Juan',
  apellido: 'Perez',
  dni: '30111222',
  email: 'juan.perez@mail.com',
  whatsapp: '11 5044-3333',
  experiencia: 'Principiante',
})
assert.deepEqual(withoutOptionalValues.data.alimentacion, { almuerzo: 'no' })
assert.deepEqual(withoutOptionalValues.data.final, { aceptaTerminos: true })

const badCases = [
  ['sin email', { ...good, persona: { ...good.persona, email: 'nope' } }],
  ['dni corto', { ...good, persona: { ...good.persona, dni: '12' } }],
  ['sin terminos', { ...good, final: { ...good.final, aceptaTerminos: false } }],
  ['almuerzo sin opcion', { ...good, alimentacion: { ...good.alimentacion, opcionAlmuerzo: '' } }],
  ['anio raro', { ...good, moto: { ...good.moto, anio: '99' } }],
  ['sin experiencia', { ...good, persona: { ...good.persona, experiencia: '' } }],
  ['sin rango de cilindrada', { ...good, moto: { ...good.moto, cilindradaRango: '' } }],
]

for (const [name, payload] of badCases) {
  const r = sanitizeRegistration(payload)
  assert.ok(r.errors.length > 0, `${name} deberia ser invalido`)
  console.log(`OK  ${name} -> ${r.errors.join(' | ')}`)
}

console.log('\nEjemplo crudo del txt:', sanitizeRegistration(good).data.moto)