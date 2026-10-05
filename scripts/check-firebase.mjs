import { adminApp, adminDb, adminStorage } from './_admin.mjs'

const projectId = process.env.FIREBASE_PROJECT_ID
const adminEmails = (process.env.VITE_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean)

const creds = projectId && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY

console.log('Project ID        :', projectId || '(vacio)')
console.log('Emails admin      :', adminEmails.length ? adminEmails.join(', ') : '(vacio)')
console.log('Service account   :', creds ? 'cargada' : 'FALTA (solo se usa para los scripts locales)')

if (creds) {
  let failed = false

  try {
    const snap = await adminDb().collection('content').doc('main').get()
    console.log('Firestore         : OK · content/main', snap.exists ? 'existe' : 'no existe (corre npm run seed)')
  } catch (err) {
    failed = true
    console.log('Firestore         : ERROR', err.code || '', err.message)
  }

  try {
    const candidates = [
      process.env.VITE_FIREBASE_STORAGE_BUCKET,
      projectId && `${projectId}.firebasestorage.app`,
      projectId && `${projectId}.appspot.com`,
    ].filter(Boolean)

    let found = null
    for (const name of candidates) {
      try {
        const [meta] = await adminStorage().bucket(name).getMetadata()
        found = meta.name
        break
      } catch {
        /* siguiente */
      }
    }

    if (found) console.log('Storage           : OK · bucket', found)
    else console.log('Storage           : sin bucket · habilitalo en Firebase console > Build > Storage')
  } catch (err) {
    console.log('Storage           : ERROR', err.code || '', err.message)
  }

  if (failed) process.exit(1)
}

console.log('\nRecordá deployar las reglas: firebase deploy --only firestore:rules,storage:rules')
process.exit(0)