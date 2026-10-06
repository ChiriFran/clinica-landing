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
assert.equal(a.data.moto.marca, '')
assert.equal(a.data.alimentacion.bebida, 'si')
console.log('valido sin marca/modelo ->', JSON.stringify(a.data.persona.email))

const withoutLunch = sanitizeRegistration({
  ...good,
  alimentacion: { ...good.alimentacion, almuerzo: 'no', opcionAlmuerzo: '' },
})
assert.equal(withoutLunch.errors.length, 0, withoutLunch.errors.join(' | '))
assert.equal(withoutLunch.data.alimentacion.bebida, 'no')

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