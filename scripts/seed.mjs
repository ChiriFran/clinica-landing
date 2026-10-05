import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { DEFAULT_CONTENT } from '../src/lib/defaultContent.js'

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')

if (!projectId || !clientEmail || !privateKey) {
  console.error('Faltan FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY en .env')
  process.exit(1)
}

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId })
const db = getFirestore(app)

const ref = db.collection('content').doc('main')
const snap = await ref.get()

if (snap.exists) {
  console.log('El contenido ya existe en content/main. Nada que hacer (borralo desde el panel si queres reiniciar).')
  process.exit(0)
}

await ref.set({ ...DEFAULT_CONTENT, updatedAt: new Date().toISOString(), updatedBy: 'seed' })
console.log('Listo: content/main creado con el contenido de ejemplo.')
process.exit(0)