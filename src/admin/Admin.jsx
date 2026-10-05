import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, configError, isAdminUser } from '../lib/firebase'
import { ContentEditor } from './ContentEditor'
import { Registrations } from './Registrations'

const TABS = [
  { id: 'contenido', label: 'Contenido' },
  { id: 'formulario', label: 'Formulario' },
  { id: 'inscripciones', label: 'Inscripciones' },
]

const AUTH_ERRORS = {
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/user-not-found': 'Ese usuario no existe en Firebase Authentication.',
  'auth/wrong-password': 'La contraseña es incorrecta.',
  'auth/invalid-email': 'El email no es válido.',
  'auth/too-many-requests': 'Demasiados intentos. Esperá un momento.',
  'auth/user-disabled': 'Ese usuario está deshabilitado.',
  'auth/operation-not-allowed': 'Falta habilitar el proveedor Email/Password en Firebase → Authentication → Sign-in method.',
  'auth/network-request-failed': 'Problema de conexión con Firebase.',
  'auth/configuration-not-found': 'Firebase Auth no está configurado en este proyecto.',
}

export function Admin() {
  const [user, setUser] = useState(undefined)
  const [creds, setCreds] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState('contenido')

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  const login = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, creds.email.trim(), creds.password)
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || `No pudimos iniciar sesión (${err.code || err.message}).`)
    } finally {
      setBusy(false)
    }
  }

  if (configError) {
    return (
      <div className="admin">
        <div className="admin__card">
          <h2>Panel admin</h2>
          <p className="muted">
            {configError}. Copiá <code>.env.example</code> a <code>.env</code> y completá las variables{' '}
            <code>VITE_FIREBASE_*</code>. Reiniciá el server de Vite después de cambiarlas.
          </p>
          <a className="admin__back" href="/">
            ← Volver a la landing
          </a>
        </div>
      </div>
    )
  }

  if (user === undefined) {
    return <div className="admin"><div className="admin__card muted">Cargando…</div></div>
  }

  if (!user) {
    return (
      <div className="admin">
        <form className="admin__card admin__login" onSubmit={login}>
          <h2>Panel admin</h2>
          <p className="muted">
            Entrá con el usuario de Firebase Authentication. Si no existe, creálo en Authentication → Users.
          </p>
          <label className="field">
            <span className="field__label">Email</span>
            <input
              type="email"
              value={creds.email}
              onChange={(e) => setCreds({ ...creds, email: e.target.value })}
              autoComplete="username"
              required
            />
          </label>
          <label className="field">
            <span className="field__label">Contraseña</span>
            <input
              type="password"
              value={creds.password}
              onChange={(e) => setCreds({ ...creds, password: e.target.value })}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="alert alert--error">{error}</p> : null}
          <button className="btn btn--primary" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
          <a className="admin__back" href="/">
            ← Volver a la landing
          </a>
        </form>
      </div>
    )
  }

  if (!isAdminUser(user.email)) {
    return (
      <div className="admin">
        <div className="admin__card">
          <h2>Sin acceso</h2>
          <p className="muted">
            El usuario <strong>{user.email}</strong> no figura en <code>VITE_ADMIN_EMAILS</code>. Agregalo en{' '}
            <code>.env</code> y en las reglas de Firestore/Storage, o usá otro usuario.
          </p>
          <div className="admin__bar-actions">
            <button className="btn btn--ghost" onClick={() => signOut(auth)}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin">
      <header className="admin__top">
        <div className="admin__brand">
          <strong>Panel admin</strong>
          <span className="chip chip--ghost">{user.email}</span>
        </div>
        <div className="admin__top-actions">
          <a className="btn btn--ghost btn--sm" href="/" target="_blank" rel="noreferrer">
            Ver landing
          </a>
          <button className="btn btn--ghost btn--sm" onClick={() => signOut(auth)}>
            Salir
          </button>
        </div>
      </header>

      <nav className="admin__tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'is-active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'inscripciones' ? (
        <Registrations />
      ) : (
        <ContentEditor user={user} mode={tab} />
      )}
    </div>
  )
}