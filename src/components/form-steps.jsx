const CILINDRADA_RANGOS = [
  { value: 'hasta 150', label: 'Hasta 150 cc' },
  { value: 'hasta 300', label: 'Hasta 300 cc' },
  { value: 'hasta 600', label: 'Hasta 600 cc' },
  { value: 'mas 600', label: 'Más de 600 cc' },
]

function Field({ label, error, hint, children, className = '' }) {
  return (
    <label className={`field ${error ? 'field--error' : ''} ${className}`}>
      <span className="field__label">{label}</span>
      {children}
      {hint ? <span className="field__hint">{hint}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  )
}

function Options({ name, value, onChange, options, error, columns = 2 }) {
  return (
    <div className="options" style={{ '--cols': columns }} role="radiogroup">
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value
        const label = typeof opt === 'string' ? opt : opt.label
        return (
          <label key={val} className={`option ${value === val ? 'option--on' : ''}`}>
            <input type="radio" name={name} value={val} checked={value === val} onChange={onChange} />
            <span>{label}</span>
          </label>
        )
      })}
      {error ? <span className="field__error">{error}</span> : null}
    </div>
  )
}

export function StepPersona({ form, data, set, errors }) {
  const p = data.persona
  return (
    <div className="step">
      <header className="step__head">
        <h3>Paso 1 · Tu persona</h3>
        <p>Conocemos who's coming.</p>
      </header>
      <div className="grid grid--2">
        <Field label="Nombre *" error={errors['persona.nombre']}>
          <input value={p.nombre} onChange={set('persona', 'nombre')} placeholder="Juan" autoComplete="given-name" />
        </Field>
        <Field label="Apellido *" error={errors['persona.apellido']}>
          <input value={p.apellido} onChange={set('persona', 'apellido')} placeholder="Perez" autoComplete="family-name" />
        </Field>
        <Field label="DNI *" error={errors['persona.dni']}>
          <input value={p.dni} onChange={set('persona', 'dni')} placeholder="12345678" inputMode="numeric" />
        </Field>
        <Field label="Localidad">
          <input value={p.localidad} onChange={set('persona', 'localidad')} placeholder="Lujan" />
        </Field>
        <Field label="Email *" error={errors['persona.email']}>
          <input type="email" value={p.email} onChange={set('persona', 'email')} placeholder="nombre@email.com" autoComplete="email" />
        </Field>
        <Field label="WhatsApp *" hint="Con area, ej: 1150443330" error={errors['persona.whatsapp']}>
          <input value={p.whatsapp} onChange={set('persona', 'whatsapp')} placeholder="1150443330" inputMode="tel" autoComplete="tel" />
        </Field>
        <Field label="Como nos conociste" className="span-2">
          <input value={p.comoSeEntero} onChange={set('persona', 'comoSeEntero')} placeholder="Instagram, grupo de WhatsApp, un amigo…" />
        </Field>
      </div>
    </div>
  )
}

export function StepMoto({ form, data, set, errors }) {
  const p = data.persona
  const m = data.moto
  return (
    <div className="step">
      <header className="step__head">
        <h3>Paso 2 · Tu nivel</h3>
        <p>Con esto armamos los grupos y los circuitos.</p>
      </header>
      <div className="grid grid--2">
        <Field label="Nivel off road *" error={errors['persona.experiencia']}>
          <select value={p.experiencia} onChange={set('persona', 'experiencia')}>
            <option value="">Elegi una opcion</option>
            {(form?.experienceOptions || []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Rango de cilindrada *" error={errors['moto.cilindradaRango']}>
          <select value={m.cilindradaRango} onChange={set('moto', 'cilindradaRango')}>
            <option value="">Elegi una opcion</option>
            {CILINDRADA_RANGOS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  )
}

export function StepAlimentacion({ form, data, set, errors }) {
  const a = data.alimentacion
  return (
    <div className="step">
      <header className="step__head">
        <h3>Paso 3 · Alimentacion</h3>
        <p>{form?.showLunch ? 'El almuerzo es opcional y se prepara segun la cantidad anotada.' : 'No hay nada que completar en este paso.'}</p>
      </header>

      {form?.showLunch ? (
        <>
          <div className="block">
            <span className="field__label">Vas a almorzar con nosotros? *</span>
            <Options
              name="almuerzo"
              value={a.almuerzo}
              onChange={set('alimentacion', 'almuerzo')}
              options={[
                { value: 'si', label: 'Si, quiero almuerzo' },
                { value: 'no', label: 'No, llevo mi propio almuerzo' },
              ]}
            />
            {errors['alimentacion.almuerzo'] ? <span className="field__error">{errors['alimentacion.almuerzo']}</span> : null}
          </div>

          {a.almuerzo === 'si' ? (
            <div className="block">
              <span className="field__label">Como queres almorzar? *</span>
              <Options
                name="opcionAlmuerzo"
                value={a.opcionAlmuerzo}
                onChange={set('alimentacion', 'opcionAlmuerzo')}
                options={[
                  { value: 'parrilla', label: 'Parrillada completa' },
                  { value: 'vegetariano', label: 'Parrillada vegetariana' },
                ]}
              />
              {errors['alimentacion.opcionAlmuerzo'] ? (
                <span className="field__error">{errors['alimentacion.opcionAlmuerzo']}</span>
              ) : null}
            </div>
          ) : null}

          <div className="grid grid--2">
            <Field label="Restricciones o alergias" className="span-2" hint="Vegetariano, sin gluten, celiaco, etc.">
              <textarea rows={3} value={a.restricciones} onChange={set('alimentacion', 'restricciones')} placeholder="Opcional" />
            </Field>
          </div>
        </>
      ) : (
        <p className="muted">No hay preguntas de alimentacion para este evento.</p>
      )}
    </div>
  )
}

export function StepFinal({ form, pricing, data, set, errors, totalPrice, money }) {
  const p = data.persona
  const m = data.moto
  const a = data.alimentacion
  const f = data.final

  return (
    <div className="step">
      <header className="step__head">
        <h3>Paso 4 · Revisar y confirmar</h3>
        <p>Ultimo paso: revisa los datos y confirmalos.</p>
      </header>

      {form?.showGroupRide ? (
        <div className="block">
          <span className="field__label">Como llegas? *</span>
          <Options
            name="grupo"
            value={f.grupo}
            onChange={set('final', 'grupo')}
            options={form?.rideWithGroupOptions || []}
          />
          {errors['final.grupo'] ? <span className="field__error">{errors['final.grupo']}</span> : null}
        </div>
      ) : null}

      {form?.showNotes ? (
        <div className="block">
          <label className="field">
            <span className="field__label">Algo mas que debamos saber?</span>
            <textarea rows={2} value={f.notas} onChange={set('final', 'notas')} placeholder="Opcional" />
          </label>
        </div>
      ) : null}

      <Summary persona={p} moto={m} alimentacion={a} final={f} pricing={pricing} />

      <div className="total">
        <span>Total a pagar</span>
        <strong>{money(totalPrice)}</strong>
        <small>Pagamento en el predio. {pricing?.baseNote}</small>
      </div>

      <label className={`field check ${errors['final.aceptaTerminos'] ? 'field--error' : ''}`}>
        <input type="checkbox" checked={f.aceptaTerminos} onChange={set('final', 'aceptaTerminos')} />
        <span>
          Confirmo que los datos son correctos y acepto la organizacion de la evento. {form?.privacyNote}
        </span>
      </label>
      {errors['final.aceptaTerminos'] ? <span className="field__error">{errors['final.aceptaTerminos']}</span> : null}
    </div>
  )
}

export function Summary({ persona, moto, alimentacion, final, pricing }) {
  const rows = [
    ['Nombre', `${persona.nombre || '-'} ${persona.apellido || ''}`.trim()],
    ['DNI', persona.dni || '-'],
    ['Email', persona.email || '-'],
    ['WhatsApp', persona.whatsapp || '-'],
    ['Localidad', persona.localidad || '-'],
    ['Experiencia', persona.experiencia || '-'],
    ['Cilindrada', moto.cilindradaRango || '-'],
    ['Almuerzo', alimentacion.almuerzo === 'si' ? `${alimentacion.opcionAlmuerzo || 'si'}` : 'No'],
    ['Restricciones', alimentacion.restricciones || '-'],
    ['Llegada', final.grupo || '-'],
  ]

  return (
    <div className="summary">
      <span className="field__label">Resumen</span>
      <dl>
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {pricing?.lunchEnabled && alimentacion.almuerzo === 'si' ? (
        <p className="summary__note">{pricing.lunchNote}</p>
      ) : null}
    </div>
  )
}