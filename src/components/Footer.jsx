export function Footer({ content }) {
  const { brand, event, contact, social, pricing } = content
  return (
    <footer className="footer">
      <div className="footer__row">
        <strong>{brand?.name}</strong>
        <span>
          {event?.date} · {event?.time} · {event?.venue}
        </span>
        <a href={contact?.whatsapp} target="_blank" rel="noreferrer">
          {contact?.phone}
        </a>
        <span className="footer__tags">{(social?.hashtags || []).join('  ')}</span>
      </div>
      <div className="footer__row footer__row--small">
        <span>{pricing?.baseNote}</span>
        <a className="footer__admin" href="/admin">Panel admin</a>
      </div>
    </footer>
  )
}