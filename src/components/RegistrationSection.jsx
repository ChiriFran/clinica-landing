import { useMemo, useState } from 'react'
import { emptyRegistration } from '../lib/defaultContent'
import { submitRegistration } from '../lib/registrationsRepo'
import { StepPersona, StepMoto, StepAlimentacion, StepFinal } from './form-steps'

const STEPS = [
  { id: 'persona', label: 'Tu persona' },
  { id: 'moto', label: 'Tu moto' },
  { id: 'alimentacion', label: 'Alimentacion' },
  { id: 'final', label: 'Confirmar' },
]

const digits = (v) => String(v || '').replace(/\D/g, '')

export function RegistrationSection({ content }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState(emptyRegistration)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [serverError, setServerError] = useState(null)
  const [receipt, setReceipt] = useState(null)

  const { form, pricing, event, contact } = content

  const set = (group, field) => (e) => {
    const raw = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setData((d) => ({ ...d, [group]: { ...d[group], [field]: raw } }))
    setErrors((x) => ({ ...x, [`${group}.${field}`]: null }))
  }

  const lunchPrice = useMemo(() => {
    if (!form?.showLunch) return 0
    if (data.alimentacion.almuerzo !== 'si') return 0
    return (parseInt(pricing?.lunchPrice?.replace(/[^\d]/g, ''), 10) || 0)
  }, [form, pricing, data.alimentacion.almuerzo])

  const totalPrice = useMemo(() => {
    const base = parseInt(pricing?.basePrice?.replace(/[^\d]/g, ''), 10) || 0
    return base + lunchPrice
  }, [pricing, lunchPrice])

  const validate = (index) => {
    const e = {}
    const p = data.persona
    const m = data.moto
    const a = data.alimentacion

    if (index === 0) {
      if (!p.nombre.trim()) e['persona.nombre'] = 'Ingresa tu nombre'
      if (!p.apellido.trim()) e['persona.apellido'] = 'Ingresa tu apellido'
      if (!p.dni.trim()) e['persona.dni'] = 'Ingresa tu DNI'
      else if (!/^\d{7,10}$/.test(digits(p.dni))) e['persona.dni'] = 'DNI invalido'
      if (!p.email.trim()) e['persona.email'] = 'Ingresa tu email'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email.trim())) e['persona.email'] = 'Email invalido'
      if (!p.whatsapp.trim()) e['persona.whatsapp'] = 'Ingresa tu WhatsApp'
      else if (digits(p.whatsapp).length < 10) e['persona.whatsapp'] = 'Numero incompleto (incluye area)'
    }

    if (index === 1) {
      if (!p.experiencia) e['persona.experiencia'] = 'Elegi tu nivel'
      if (!m.cilindradaRango) e['moto.cilindradaRango'] = 'Elegi un rango de cilindrada'
    }

    if (index === 2 && form?.showLunch) {
      if (!a.almuerzo) e['alimentacion.almuerzo'] = 'Elegi si almorzás con nosotros'
      if (a.almuerzo === 'si' && !a.opcionAlmuerzo) e['alimentacion.opcionAlmuerzo'] = 'Como querés almorzar?'
    }

    if (index === 3) {
      if (form?.showGroupRide && !data.final.grupo) e['final.grupo'] = 'Elegi como llegas'
      if (!data.final.aceptaTerminos) e['final.aceptaTerminos'] = 'Necesitamos tu confirmacion'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (!validate(step)) return
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate(3)) return
    setStatus('sending')
    setServerError(null)
    try {
      const res = await submitRegistration(data, { contentVersion: content.version })
      setReceipt(res.receipt)
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setServerError(
        err.code === 'permission-denied'
          ? 'Firebase no permitió guardar la inscripción. Avisale al admin (puede faltar deployar las reglas).'
          : err.message,
      )
    }
  }

  const restart = () => {
    setData(emptyRegistration())
    setStep(0)
    setErrors({})
    setStatus('idle')
    setServerError(null)
    setReceipt(null)
  }

  const money = (n) => `$${n.toLocaleString('es-AR')},-`

  return (
    <section className="reg" id="inscripcion">
      <div className="reg__inner">
        <aside className="reg__aside">
          <span className="chip chip--accent">{form?.title}</span>
          <h2 className="reg__title">{event?.date}</h2>
          <p className="reg__subtitle">{form?.subtitle}</p>

          <ol className="stepper">
            {STEPS.map((s, i) => (
              <li key={s.id} className={i === step ? 'is-active' : i < step ? 'is-done' : ''}>
                <button type="button" onClick={() => i < step && setStep(i)} disabled={i > step}>
                  <span className="stepper__num">{i < step ? '✓' : i + 1}</span>
                  {s.label}
                </button>
              </li>
            ))}
          </ol>

          <div className="reg__total">
            <div>
              <span>Inscripcion</span>
              <strong>{pricing?.basePrice}</strong>
            </div>
            {form?.showLunch ? (
              <div>
                <span>{pricing?.lunchTitle}</span>
                <strong>{data.alimentacion.almuerzo === 'si' ? pricing?.lunchPrice : 'No'}</strong>
              </div>
            ) : null}
            <div className="reg__total-sum">
              <span>Total estimado</span>
              <strong>{money(totalPrice)}</strong>
            </div>
          </div>

          <p className="reg__help">
            Consultas: <a href={contact?.whatsapp} target="_blank" rel="noreferrer">{contact?.phone}</a> · {event?.venue}
          </p>
        </aside>

        <div className="reg__card">
          {status === 'done' ? (
            <div className="done">
              <span className="done__badge">✓</span>
              <h3>{form?.thanksTitle}</h3>
              <p>{form?.thanksBody}</p>
              {receipt ? <p className="done__receipt">Nro de inscripcion: <strong>{receipt}</strong></p> : null}
              <div className="done__actions">
                <a className="btn btn--wa" href={contact?.whatsapp} target="_blank" rel="noreferrer">
                  Enviar por WhatsApp
                </a>
                <button type="button" className="btn btn--ghost" onClick={restart}>
                  Registrar otra persona
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              {step === 0 ? <StepPersona form={form} data={data} set={set} errors={errors} /> : null}
              {step === 1 ? <StepMoto form={form} data={data} set={set} errors={errors} /> : null}
              {step === 2 ? <StepAlimentacion form={form} data={data} set={set} errors={errors} /> : null}
              {step === 3 ? <StepFinal form={form} pricing={pricing} data={data} set={set} errors={errors} totalPrice={totalPrice} money={money} /> : null}

              {serverError ? <p className="alert alert--error">{serverError}</p> : null}

              <div className="reg__nav">
                {step > 0 ? (
                  <button type="button" className="btn btn--ghost" onClick={back}>
                    Volver
                  </button>
                ) : (
                  <span />
                )}
                {step < STEPS.length - 1 ? (
                  <button type="button" className="btn btn--primary" onClick={next}>
                    Continuar
                  </button>
                ) : (
                  <button type="submit" className="btn btn--primary" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Enviando…' : form?.confirmLabel}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export { STEPS }