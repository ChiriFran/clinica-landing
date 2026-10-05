import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'
import { DEFAULT_CONTENT } from './defaultContent'

const CONTENT_REF = () => doc(db, 'content', 'main')

export async function loadContent() {
  const snap = await getDoc(CONTENT_REF())
  return snap.exists() ? { ...structuredClone(DEFAULT_CONTENT), ...snap.data() } : structuredClone(DEFAULT_CONTENT)
}

export async function saveContent(content, user) {
  await setDoc(
    CONTENT_REF(),
    {
      ...content,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email || 'admin',
    },
    { merge: true },
  )
}

const EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
}

export async function uploadImage(file, name = 'hero') {
  if (!file) throw new Error('Elegi una imagen')
  const ext = EXTENSIONS[file.type]
  if (!ext) throw new Error(`Formato no permitido (${file.type || 'desconocido'}). Usá JPG, PNG, WEBP o AVIF.`)
  if (file.size > 6 * 1024 * 1024) throw new Error('La imagen supera los 6MB')

  const path = `site/${name}.${ext}`
  const fileRef = ref(storage, path)
  await uploadBytes(fileRef, file, { contentType: file.type })
  const url = await getDownloadURL(fileRef)
  return { url, path }
}