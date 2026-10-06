import { useCallback, useEffect, useMemo, useState } from 'react'
import { deleteRegistration, listRegistrations, setRegistrationStatus } from '../lib/registrationsRepo'
import { downloadCsv } from '../lib/csv'

const STATUS = [
  { value: 'todas', label: 'Todas' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'aprobado', label: 'Aprobadas' },
  { value: 'rechazado', label: 'Rechazadas' },
  { value: 'cancelado', label: 'Canceladas' },
]

const dateFormat = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}

const waLink = (phone) => {
  const d = String(phone || '').replace(/\D/g, '')
  if (!d) return null
  const intl = d.length <= 10 ? `54${d.replace(/^0/, '')}` : d
  return `https://wa.me/${intl}`
}

function flat(item) {
  return {
    recibo: item.receipt,
    fecha: dateFormat(item.createdAt),
    nombre: `${item.persona?.nombre || ''} ${item.persona?.apellido || ''}`.trim(),
    dni: item.persona?.dni || '',
    email: item.persona?.email || '',
    whatsapp: item.persona?.whatsapp || '',
    localidad: item.persona?.localidad || '',
    experiencia: item.persona?.experiencia || '',
    como_se_integro: item.persona?.comoSeEntero || '',
    moto: `${item.moto?.marca || ''} ${item.moto?.modelo || ''}`.trim(),
    anio: item.moto?.anio || '',
    cilindrada_rango: item.moto?.cilindradaRango || '',
    cilindrada: item.moto?.cilindrada || '',
    tipo: item.moto?.tipo || '',
    apta_tierra: item.moto?.aptaParaTierra || '',
    seguro: item.moto?.tieneSeguro || '',
    almuerzo: item.alimentacion?.almuerzo || '',
    opcion_almuerzo: item.alimentacion?.opcionAlmuerzo || '',
    restricciones: item.alimentacion?.restricciones || '',
    bebida: item.alimentacion?.bebida || '',
    grupo: item.final?.grupo || '',
    notas: item.final?.notas || '',
    estado: item.status,
    notas_admin: item.adminNotes || '',
  }
}

export function Registrations() {
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [status, setStatus] = useState('todas')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listRegistrations()
      setItems(res.items)
      setStats(res.stats)
      setError(null)
    } catch (err) {
      setError(
        err.code === 'permission-denied'
          ? 'No pudiste leer las inscripciones: Firebase no autoriza a tu usuario. Deployá firestore.rules y revisá el email en VITE_ADMIN_EMAILS.'
          : `No pudimos cargar las inscripciones: ${err.message}`,
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return items
      .filter((i) => (status === 'todas' ? true : i.status === status))
      .filter((i) => {
        if (!term) return true
        const hay = [
          i.receipt,
          i.persona?.nombre,
          i.persona?.apellido,
          i.persona?.email,
          i.persona?.whatsapp,
          i.moto?.marca,
          i.moto?.modelo,
          i.moto?.cilindradaRango,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return hay.includes(term)
      })
  }, [items, status, q])

  const changeStatus = async (id, value) => {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, status: value } : i)))
    try {
      await setRegistrationStatus(id, value)
    } catch (err) {
      setError(`No pudimos actualizar el estado: ${err.message}`)
      load()
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Borrar esta inscripción definitivamente?')) return
    try {
      await deleteRegistration(id)
      setItems((list) => list.filter((i) => i.id !== id))
    } catch (err) {
      setError(`No pudimos borrar: ${err.message}`)
    }
  }

  const exportCsv = () => {
    downloadCsv(`inscripciones-${new Date().toISOString().slice(0, 10)}.csv`, filtered.map(flat))
  }

  const waGroup = filtered.filter((i) => i.final?.grupo?.startsWith('Si'))

  return (
    <>
      <div className="admin__stats">
        {[
          ['Total', stats?.total],
          ['Pendientes', stats?.pendientes],
          ['Aprobadas', stats?.aprobados],
          ['Rechazadas', stats?.rechazados],
          ['Canceladas', stats?.cancelados],
          ['Almuerzo', stats?.almuerzo],
          ['Con bebida', stats?.conBebida],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value ?? '-'}</strong>
          </div>
        ))}
      </div>

      <div className="admin__bar">
        <div className="admin__bar-info">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <input placeholder="Buscar por nombre, email, DNI o moto" value={q} onChange={(e) => setQ(e.target.value)} />
          <span className="muted">
            {filtered.length} de {items.length}
          </span>
        </div>
        <div className="admin__bar-actions">
          <a
            className={`btn btn--ghost btn--sm ${waGroup.length ? '' : 'is-disabled'}`}
            href={waGroup.length ? `https://wa.me/?send=false&text=${encodeURIComponent(waGroup.map((i) => `${i.persona.nombre} ${i.persona.apellido}`).join(', '))}` : undefined}
            target="_blank"
            rel="noreferrer"
          >
            Copiar para WhatsApp ({waGroup.length})
          </a>
          <button className="btn btn--ghost btn--sm" onClick={load} disabled={loading}>
            Actualizar
          </button>
          <button className="btn btn--primary btn--sm" onClick={exportCsv} disabled={!filtered.length}>
            Exportar CSV
          </button>
        </div>
      </div>

      {error ? <p className="alert alert--error">{error}</p> : null}
      {loading ? <div className="admin__card muted">Cargando inscripciones…</div> : null}

      {!loading && !filtered.length ? (
        <div className="admin__card muted">Todavia no hay inscripciones para este filtro.</div>
      ) : null}

      {filtered.length ? (
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>Recibo</th>
                <th>Fecha</th>
                <th>Persona</th>
                <th>Contacto</th>
                <th>Moto</th>
                <th>Almuerzo</th>
                <th>Llegada</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => {
                const wa = waLink(i.persona?.whatsapp)
                return (
                  <tr key={i.id}>
                    <td className="mono">{i.receipt}</td>
                    <td className="muted nowrap">{dateFormat(i.createdAt)}</td>
                    <td>
                      <strong>{`${i.persona?.nombre || ''} ${i.persona?.apellido || ''}`.trim()}</strong>
                      <br />
                      <span className="muted small">
                        DNI {i.persona?.dni || '-'} · {i.persona?.localidad || 'sin localidad'}
                      </span>
                      {i.persona?.experiencia ? <br /> : null}
                      {i.persona?.experiencia ? <span className="muted small">{i.persona.experiencia}</span> : null}
                    </td>
                    <td className="small">
                      {i.persona?.email ? (
                        <a className="link" href={`mailto:${i.persona.email}`}>
                          {i.persona.email}
                        </a>
                      ) : (
                        '-'
                      )}
                      <br />
                      {wa ? (
                        <a className="link" href={wa} target="_blank" rel="noreferrer">
                          {i.persona?.whatsapp}
                        </a>
                      ) : (
                        <span className="muted">sin WhatsApp</span>
                      )}
                    </td>
                    <td className="small">
                      <strong>
                        {`${i.moto?.marca || ''} ${i.moto?.modelo || ''}`.trim() ||
                          (i.moto?.cilindradaRango ? `Cilindrada: ${i.moto.cilindradaRango}` : 'Sin datos de moto')}
                      </strong>
                      <br />
                      <span className="muted">
                        {[i.moto?.anio, i.moto?.cilindradaRango, i.moto?.cilindrada ? `${i.moto.cilindrada}cc` : '', i.moto?.tipo]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                      {i.final?.notas ? (
                        <>
                          <br />
                          <span className="muted">Nota: {i.final.notas}</span>
                        </>
                      ) : null}
                    </td>
                    <td className="small">
                      {i.alimentacion?.almuerzo === 'si' ? (
                        <>
                          <strong>{i.alimentacion.opcionAlmuerzo || 'si'}</strong>
                          {i.alimentacion.bebida === 'si' ? <br /> : null}
                          {i.alimentacion.bebida === 'si' ? <span className="muted">con bebida</span> : null}
                          {i.alimentacion.restricciones ? (
                            <>
                              <br />
                              <span className="muted">{i.alimentacion.restricciones}</span>
                            </>
                          ) : null}
                        </>
                      ) : (
                        <span className="muted">sin almuerzo</span>
                      )}
                    </td>
                    <td className="small">{i.final?.grupo?.startsWith('Si') ? 'Grupo' : <span className="muted">Directo</span>}</td>
                    <td>
                      <select className="status-select" value={i.status} onChange={(e) => changeStatus(i.id, e.target.value)}>
                        <option value="pendiente">pendiente</option>
                        <option value="aprobado">aprobado</option>
                        <option value="rechazado">rechazado</option>
                        <option value="cancelado">cancelado</option>
                      </select>
                    </td>
                    <td>
                      <button className="btn btn--danger btn--sm" onClick={() => remove(i.id)}>
                        Borrar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  )
}