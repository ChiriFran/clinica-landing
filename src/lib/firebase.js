import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const missingEnvVars = Object.entries(cfg)
  .filter(([, v]) => !v)
  .map(([k]) => k)

export const configError = missingEnvVars.length
  ? `Faltan variables de entorno: ${missingEnvVars.join(', ')}`
  : null

// Emails con acceso al panel. Opcional: si lo=dejas vacio, el acceso depende
// solo de las reglas de Firestore/Storage (que son la verdadera seguridad).
export const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export function isAdminUser(email) {
  if (!adminEmails.length) return true
  return adminEmails.includes(String(email || '').toLowerCase())
}

const app = configError ? null : initializeApp(cfg)

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const storage = app ? getStorage(app) : null