import { renderToString } from 'react-dom/server'
import { Hero } from '../src/components/Hero'
import { RegistrationSection } from '../src/components/RegistrationSection'
import { Footer } from '../src/components/Footer'
import { Landing } from '../src/components/Landing'
import { DEFAULT_CONTENT, emptyRegistration } from '../src/lib/defaultContent'

const results = []

function check(name, element) {
  const html = renderToString(element)
  results.push([name, html.length, html.includes('undefined') ? 'TIENE "undefined"' : 'ok'])
}

check('Hero', <Hero content={DEFAULT_CONTENT} state="fallback" />)
check('Hero con foto', <Hero content={{ ...DEFAULT_CONTENT, hero: { ...DEFAULT_CONTENT.hero, image: 'https://example.com/foto.jpg' }, faq: [{ q: 'x', a: 'y' }] }} state="ready" />)
check('Registration', <RegistrationSection content={DEFAULT_CONTENT} />)
check('Footer', <Footer content={DEFAULT_CONTENT} />)
check('Landing', <Landing />)
check('Summary', <p>{JSON.stringify(emptyRegistration().persona)}</p>)

for (const [name, len, status] of results) {
  console.log(`${status === 'ok' ? 'OK   ' : 'AVISO'} ${name.padEnd(18)} ${len} chars — ${status}`)
}

const heroHtml = renderToString(<Hero content={DEFAULT_CONTENT} state="fallback" />)
const checks = [
  ['fecha hero', '4 de OCTUBRE 2026'],
  ['predio', 'PANDA TROUPE Off Road'],
  ['direccion', 'RN5 KM 71'],
  ['precio', '$120.000,-'],
  ['precio almuerzo', '$40.000,-'],
  ['telefono', '1150443330'],
  ['aviso cupos', 'Cupos limitados'],
  ['nota almuerzo', 'tildar la pregunta'],
  ['lluvia', 'En caso de lluvia se reprograma'],
  ['instagram tags', '#clinicaoffroad'],
]

for (const [label, needle] of checks) {
  console.log(`${heroHtml.includes(needle) ? 'OK   ' : 'FALTA'} ${label}: "${needle}"`)
}

const regHtml = renderToString(<RegistrationSection content={DEFAULT_CONTENT} />)
for (const [label, needle] of [
  ['titulo paso 1', 'Paso 1'],
  ['titulo paso 3', 'Alimentacion'],
  ['campo paso 1', 'WhatsApp'],
  ['total estimado', 'Total estimado'],
]) {
  console.log(`${regHtml.includes(needle) ? 'OK   ' : 'FALTA'} ${label}: "${needle}"`)
}