import { useState } from 'react'

function Icon({ name, className = '' }) {
  const paths = {
    calendar: 'M7 3v3m10-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3 2',
    pin: 'M12 21s-7-5.4-7-11a7 7 0 1 1 14 0c0 5.6-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    check: 'M4 12.5 9 17.5 20 6.5',
    burger: 'M4 8h16M4 13h16M4 18h10',
    badge: 'M12 3 4 6.5V12c0 4.4 3.4 8.4 8 9.5 4.6-1.1 8-5.1 8-9.5V6.5L12 3Z',
    whatsapp:
      'M3.5 20.5 5 16.2A8 8 0 1 1 8 19.3l-4.5 1.2Zm5-8.3c.2 1.2 1.6 3 2.8 3.6.7.3 1.2.1 1.5-.4l.4-.6c.1-.2.3-.2.5-.1l1.2.7c.2.1.3.3.2.6a2.4 2.4 0 0 1-2 1.4c-1.3 0-3.6-1.2-4.9-2.6-1.1-1.2-1.9-2.7-1',
    arrow: 'M5 12h14m-6-6 6 6-6 6',
    external: 'M14 4h6v6M20 4 11 13M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
    chevron: 'm6 9 6 6 6-6',
    alert: 'M12 8v5m0 3h.01M10.3 3.9 2.6 17.5A1.5 1.5 0 0 0 3.9 20h16.2a1.5 1.5 0 0 0 1.3-2.5L13.7 3.9a1.5 1.5 0 0 0-2.6 0Z',
  }
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}

function Spec({ icon, label, value, extra, link, wide }) {
  const inner = (
    <>
      <span className="spec__top">
        <Icon name={icon} className="spec__icon" />
        <span className="spec__label">{label}</span>
      </span>
      <strong className="spec__value">{value}</strong>
      {extra ? <span className="spec__extra">{extra}</span> : null}
      {link ? (
        <span className="spec__link">
          Ver en el mapa
          <Icon name="external" className="spec__link-icon" />
        </span>
      ) : null}
    </>
  )
  const cls = `spec${wide ? ' spec--wide' : ''}${link ? ' spec--link' : ''}`
  return link ? (
    <a className={cls} href={link} target="_blank" rel="noreferrer">
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  )
}

function Point({ icon, children, accent }) {
  return (
    <p className={`point ${accent ? 'point--accent' : ''}`}>
      <Icon name={icon} className="point__icon" />
      <span>{children}</span>
    </p>
  )
}

export function Hero({ content, state }) {
  const [openFaq, setOpenFaq] = useState(null)
  const { brand, hero, about, event, pricing, faq, contact, social, theme } = content
  const safeImage = typeof hero?.image === 'string' ? hero.image.trim() : ''
  const showImage = theme?.showHeroImage !== false && Boolean(safeImage)

  return (
    <section className="hero" id="inicio">
      {showImage ? (
        <div
          className="hero__bg"
          style={{
            backgroundImage: `url(${JSON.stringify(safeImage).slice(1, -1)})`,
            opacity: theme?.heroImageOpacity ?? 0.45,
          }}
          aria-hidden="true"
        />
      ) : (
        <div className="hero__bg hero__bg--pattern" aria-hidden="true" />
      )}

      <div className="hero__inner">
        <header className="hero__top">
          <div className="brand">
            <span className="brand__mark">CO</span>
            <span className="brand__name">{brand.name}</span>
            <span className="brand__edition">{brand.edition}</span>
          </div>
          <div className="hero__top-right">
            <span className="badge badge--alert">
              <Icon name="alert" className="badge__icon" />
              {event.badge}
            </span>
            <a className="btn btn--wa btn--sm" href={contact.whatsapp} target="_blank" rel="noreferrer">
              <Icon name="whatsapp" className="btn__icon" />
              {contact.phone}
            </a>
          </div>
        </header>

        <div className="hero__layout">
          <div className="hero__main">
            <p className="hero__eyebrow">
              <span className="hero__eyebrow-date">{hero.badge}</span>
              <span className="hero__eyebrow-sep" />
              {event.time}
              <span className="hero__eyebrow-sep" />
              {event.venue}
            </p>

            <h1 className="hero__title">{hero.title}</h1>

            <p className="hero__subtitle">{hero.subtitle}</p>

            <span className="badge badge--instructors">
              <Icon name="badge" className="badge__icon" />
              {about.instructors}
            </span>

            <div className="hero__cta">
              <a className="btn btn--primary btn--lg" href="#inscripcion">
                {hero.ctaText}
                <Icon name="arrow" className="btn__icon" />
              </a>
              <div className="price">
                <span className="price__label">Valor</span>
                <strong className="price__value">{pricing.basePrice}</strong>
              </div>
            </div>

            <div className="hero__points" id="info">
              {about.body ? <p className="hero__about">{about.body}</p> : null}
              <div className="points">
                <Point icon="check">{pricing.callout}</Point>
                {pricing.lunchEnabled ? (
                  <Point icon="burger" accent>
                    {pricing.lunchTitle}: <strong>{pricing.lunchPrice}</strong> · {pricing.lunchDescription}
                  </Point>
                ) : null}
              </div>
            </div>
          </div>

          <aside className="hero__panel" aria-label="Datos del evento">
            <div className="panel__head">
              <h2 className="panel__title">Datos del evento</h2>
              <span className="panel__hint">Confirmá tu lugar</span>
            </div>

            <div className="spec-grid">
              <Spec icon="calendar" label="Fecha" value={event.date} />
              <Spec icon="clock" label="Hora" value={event.time} />
              <Spec icon="pin" label="Predio" value={event.venue} extra={event.address} link={event.mapsUrl} wide />
              <Spec icon="badge" label="Incluye" value={pricing.baseNote} wide />
            </div>
          </aside>
        </div>

        <footer className="hero__bottom">
          <div className="hero__notes">
            {(event.notes || []).map((n) => (
              <span key={n}>{n}</span>
            ))}
            {pricing.lunchEnabled ? <span>{pricing.lunchNote}</span> : null}
            <span className="hero__tags">{(social.hashtags || []).join('  ')}</span>
          </div>

          <div className="hero__actions">
            {state === 'loading' ? <span className="muted">Cargando…</span> : null}
            <a className="btn btn--ghost btn--sm" href="#info">
              {hero.ctaSecondaryText}
            </a>

            {faq?.length ? (
              <div className="faq">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setOpenFaq(openFaq === null ? 0 : null)}
                  aria-expanded={openFaq !== null}
                >
                  FAQ
                  <Icon name="chevron" className={`btn__icon ${openFaq !== null ? 'is-flip' : ''}`} />
                </button>
                {openFaq !== null ? (
                  <div className="faq__panel" role="region" aria-label="Preguntas frecuentes">
                    <button type="button" className="faq__close" onClick={() => setOpenFaq(null)} aria-label="Cerrar FAQ">
                      ×
                    </button>
                    {faq.map((item, i) => (
                      <details key={i} className="faq__item">
                        <summary>
                          {item.q} <Icon name="chevron" className="faq__chevron" />
                        </summary>
                        <p>{item.a}</p>
                      </details>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </footer>
      </div>
    </section>
  )
}
