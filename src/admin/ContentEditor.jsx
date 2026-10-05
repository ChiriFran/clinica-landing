import { useEffect, useMemo, useState } from 'react'
import { loadContent, saveContent, uploadImage as uploadImageFile } from '../lib/contentRepo'
import { DEFAULT_CONTENT } from '../lib/defaultContent'

const SAVE_ERRORS = {
  'permission-denied': 'Firebase no te permitió escribir. Deployá las reglas (firestore.rules) y revisá que tu email esté autorizado.',
  unavailable: 'Sin conexión con Firebase. Revisá tu internet.',
  'not-authenticated': 'Tu sesión expiró. Volvé a iniciar sesión.',
}

const listToText = (arr) => (Array.isArray(arr) ? arr.join('\n') : '')
const textToList = (text) =>
  text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

function Text({ label, value, onChange, hint, multiline, rows = 3, placeholder }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {multiline ? (
        <textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
      {hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  )
}

function ListText({ label, value, onChange, hint, rows = 4 }) {
  return (
    <Text label={label} multiline rows={rows} value={listToText(value)} onChange={(v) => onChange(textToList(v))} hint={hint} />
  )
}

function Toggle({ label, value, onChange, hint }) {
  return (
    <label className="field check">
      <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <strong>{label}</strong>
        {hint ? <span className="field__hint"> {hint}</span> : null}
      </span>
    </label>
  )
}

function Card({ title, children, desc }) {
  return (
    <section className="admin__card">
      <h3>{title}</h3>
      {desc ? <p className="muted admin__desc">{desc}</p> : null}
      <div className="admin__grid">{children}</div>
    </section>
  )
}

export function ContentEditor({ user, mode }) {
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [baseline, setBaseline] = useState(null)
  const [state, setState] = useState('loading')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const load = async () => {
    setState('loading')
    try {
      const remote = await loadContent()
      setContent(remote)
      setBaseline(structuredClone(remote))
      setState(remote.updatedAt ? 'ready' : 'empty')
    } catch (err) {
      setState('error')
      setMessage(`No pudimos leer el contenido: ${err.message}`)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const set = (path) => (value) => {
    setContent((c) => {
      const next = structuredClone(c)
      const keys = path.split('.')
      let ref = next
      for (let i = 0; i < keys.length - 1; i += 1) {
        if (typeof ref[keys[i]] !== 'object' || ref[keys[i]] === null) ref[keys[i]] = {}
        ref = ref[keys[i]]
      }
      ref[keys.at(-1)] = value
      return next
    })
    setMessage(null)
  }

  const dirty = useMemo(() => JSON.stringify(content) !== JSON.stringify(baseline), [content, baseline])

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await saveContent(content, user)
      setBaseline(structuredClone(content))
      setState('ready')
      setMessage('Guardado. La landing ya muestra los cambios.')
    } catch (err) {
      setMessage(SAVE_ERRORS[err.code] || `No pudimos guardar: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const restoreDefaults = () => {
    setContent(structuredClone(DEFAULT_CONTENT))
    setMessage('Volviste a los valores de ejemplo. No olvides Guardar.')
  }

  const uploadImage = async (file, fieldPath, storageName) => {
    if (!file) return
    setMessage('Subiendo imagen…')
    try {
      const { url } = await uploadImageFile(file, storageName)
      set(fieldPath)(url)
      setMessage('Imagen subida. No olvides Guardar.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  if (state === 'loading') return <div className="admin__card muted">Cargando contenido…</div>

  return (
    <>
      <div className="admin__bar">
        <div className="admin__bar-info">
          {state === 'empty' ? (
            <span className="chip chip--alert">Sin contenido guardado: se usan los valores de ejemplo</span>
          ) : null}
          {dirty ? <span className="chip chip--accent">Cambios sin guardar</span> : <span className="chip chip--ghost">Todo guardado</span>}
          {message ? <span className="muted">{message}</span> : null}
        </div>
        <div className="admin__bar-actions">
          <button className="btn btn--ghost btn--sm" onClick={restoreDefaults}>
            Valores de ejemplo
          </button>
          <button className="btn btn--primary" onClick={save} disabled={saving || !dirty}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {mode === 'formulario' ? (
        <FormSettings content={content} set={set} uploadImage={uploadImage} />
      ) : (
        <SiteSettings content={content} set={set} uploadImage={uploadImage} />
      )}
    </>
  )
}

function SiteSettings({ content, set, uploadImage }) {
  return (
    <>
      <Card title="Marca y evento">
        <Text label="Nombre del evento" value={content.brand.name} onChange={set('brand.name')} />
        <Text label="Edicion" value={content.brand.edition} onChange={set('brand.edition')} />
        <Text
          label="Version del evento"
          value={content.version}
          onChange={(v) => set('version')(Number(v) || 1)}
          hint="Subilo cuando sea un evento nuevo: separa las inscripciones del anterior"
        />
        <Text label="Fecha del hero" value={content.hero.badge} onChange={set('hero.badge')} hint="Se muestra arriba del titulo" />
        <Text label="Titulo" value={content.hero.title} onChange={set('hero.title')} />
        <Text label="Subtitulo" multiline value={content.hero.subtitle} onChange={set('hero.subtitle')} />
        <Text label="Boton principal" value={content.hero.ctaText} onChange={set('hero.ctaText')} />
        <Text label="Boton secundario" value={content.hero.ctaSecondaryText} onChange={set('hero.ctaSecondaryText')} />
      </Card>

      <Card title="Fotos" desc="Las imagenes se suben a Firebase Storage y quedan publicas.">
        <div className="field">
          <span className="field__label">Foto principal (fondo del hero)</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => uploadImage(e.target.files?.[0], 'hero.image', 'hero')} />
          <Text label="URL" value={content.hero.image} onChange={set('hero.image')} hint="O pega una URL externa" />
          {content.hero.image ? <img className="admin__preview" src={content.hero.image} alt="preview" /> : null}
        </div>
        <Toggle
          label="Mostrar foto de fondo"
          value={content.theme.showHeroImage}
          onChange={set('theme.showHeroImage')}
          hint="Si la apagamos se ve el diseno con gradientes"
        />
        <Text
          label="Opacidad del fondo"
          value={content.theme.heroImageOpacity}
          onChange={(v) => set('theme.heroImageOpacity')(Number(v) || 0)}
          hint="0 a 1"
        />
        <Text label="Color de acento" value={content.theme.accent} onChange={set('theme.accent')} hint="Hex, ej #f97316" />
        <Text label="Color de acento secundario" value={content.theme.accentAlt} onChange={set('theme.accentAlt')} />
      </Card>

      <Card title="La clinica" desc="El instructors y la descripcion se muestran en el hero.">
        <Text label="Instructores" value={content.about.instructors} onChange={set('about.instructors')} />
        <Text label="Descripcion de la clinica" multiline rows={5} value={content.about.body} onChange={set('about.body')} />
      </Card>

      <Card title="Datos del evento">
        <Text label="Fecha" value={content.event.date} onChange={set('event.date')} />
        <Text label="Hora" value={content.event.time} onChange={set('event.time')} />
        <Text label="Predio" value={content.event.venue} onChange={set('event.venue')} />
        <Text label="Direccion" value={content.event.address} onChange={set('event.address')} />
        <Text label="Link de mapa" value={content.event.mapsUrl} onChange={set('event.mapsUrl')} />
        <Text label="Chip de aviso" value={content.event.badge} onChange={set('event.badge')} hint="Ej: Cupos limitados" />
        <ListText label="Notas al pie (uno por linea)" value={content.event.notes} onChange={set('event.notes')} />
      </Card>

      <Card title="Precios">
        <Text label="Valor inscripcion" value={content.pricing.basePrice} onChange={set('pricing.basePrice')} hint="Se muestra como texto. Ej: $120.000,-" />
        <Text label="Nota del precio" multiline value={content.pricing.baseNote} onChange={set('pricing.baseNote')} />
        <Toggle label="Ofrecer almuerzo" value={content.pricing.lunchEnabled} onChange={set('pricing.lunchEnabled')} />
        <Text label="Titulo del almuerzo" value={content.pricing.lunchTitle} onChange={set('pricing.lunchTitle')} />
        <Text label="Precio del almuerzo" value={content.pricing.lunchPrice} onChange={set('pricing.lunchPrice')} />
        <Text label="Descripcion del almuerzo" value={content.pricing.lunchDescription} onChange={set('pricing.lunchDescription')} />
        <Text label="Nota del almuerzo" multiline value={content.pricing.lunchNote} onChange={set('pricing.lunchNote')} />
        <Text label="Callout de motos" multiline value={content.pricing.callout} onChange={set('pricing.callout')} />
      </Card>

      <Card title="Preguntas frecuentes">
        <div className="admin__list">
          {content.faq.map((item, i) => (
            <div className="admin__list-item" key={i}>
              <Text label={`Pregunta ${i + 1}`} value={item.q} onChange={(v) => set(`faq.${i}.q`)(v)} />
              <Text label={`Respuesta ${i + 1}`} multiline value={item.a} onChange={(v) => set(`faq.${i}.a`)(v)} />
              <button
                className="btn btn--danger btn--sm"
                onClick={() => set('faq')(content.faq.filter((_, x) => x !== i))}
                type="button"
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            className="btn btn--ghost btn--sm"
            type="button"
            onClick={() => set('faq')([...content.faq, { q: 'Nueva pregunta', a: 'Respuesta' }])}
          >
            + Agregar pregunta
          </button>
        </div>
      </Card>

      <Card title="Contacto y redes">
        <Text label="Nombre de contacto" value={content.contact.name} onChange={set('contact.name')} />
        <Text label="Telefono" value={content.contact.phone} onChange={set('contact.phone')} />
        <Text label="Link de WhatsApp" value={content.contact.whatsapp} onChange={set('contact.whatsapp')} hint="https://wa.me/54…" />
        <ListText label="Hashtags (uno por linea)" value={content.social.hashtags} onChange={set('social.hashtags')} />
      </Card>
    </>
  )
}

function FormSettings({ content, set }) {
  return (
    <>
      <Card title="Textos del formulario">
        <Text label="Titulo" value={content.form.title} onChange={set('form.title')} />
        <Text label="Subtitulo" multiline value={content.form.subtitle} onChange={set('form.subtitle')} />
        <Text label="Boton de confirmacion" value={content.form.confirmLabel} onChange={set('form.confirmLabel')} />
        <Text label="Titulo del exito" value={content.form.thanksTitle} onChange={set('form.thanksTitle')} />
        <Text label="Mensaje de exito" multiline value={content.form.thanksBody} onChange={set('form.thanksBody')} />
        <Text label="Nota de privacidad" multiline value={content.form.privacyNote} onChange={set('form.privacyNote')} />
      </Card>

      <Card title="Pasos opcionales" desc="Ideal para reutilizar la landing en otros eventos.">
        <Toggle label="Mostrar paso de alimentacion" value={content.form.showLunch} onChange={set('form.showLunch')} />
        <Toggle label="Preguntar si quiere rodar en grupo" value={content.form.showGroupRide} onChange={set('form.showGroupRide')} />
        <Toggle label="Campo de notas libre" value={content.form.showNotes} onChange={set('form.showNotes')} />
      </Card>

      <Card title="Opciones de las listas desplegables" desc="Una por linea.">
        <ListText label="Nivel de experiencia" value={content.form.experienceOptions} onChange={set('form.experienceOptions')} />
        <ListText label="Tipo de moto" value={content.form.bikeTypeOptions} onChange={set('form.bikeTypeOptions')} />
        <ListText label="Como llega al evento" value={content.form.rideWithGroupOptions} onChange={set('form.rideWithGroupOptions')} />
      </Card>
    </>
  )
}