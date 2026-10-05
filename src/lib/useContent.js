import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, configError } from './firebase'
import { DEFAULT_CONTENT } from './defaultContent'

export function useContent() {
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [state, setState] = useState(configError ? 'fallback' : 'loading')

  useEffect(() => {
    if (!db) return
    return onSnapshot(
      doc(db, 'content', 'main'),
      (snap) => {
        if (snap.exists()) {
          setContent({ ...DEFAULT_CONTENT, ...snap.data() })
          setState('ready')
        } else {
          setContent(DEFAULT_CONTENT)
          setState('fallback')
        }
      },
      (err) => {
        console.error('[content]', err.message)
        setContent(DEFAULT_CONTENT)
        setState('fallback')
      },
    )
  }, [])

  return { content, state }
}