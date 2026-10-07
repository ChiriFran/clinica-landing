import { useEffect } from 'react'
import { useContent } from '../lib/useContent'
import { Hero } from './Hero'
import { RegistrationSection } from './RegistrationSection'
import { Footer } from './Footer'

export function Landing() {
  const { content, state } = useContent()

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', content.theme?.accent || '#f94316')
    document.documentElement.style.setProperty('--accent-alt', content.theme?.accentAlt || '#facc15')
    document.title = `${content.brand?.name || 'Clinica Off Road'} | ${content.hero?.badge || ''}`.trim()
  }, [content.brand?.name, content.hero?.badge, content.theme?.accent, content.theme?.accentAlt])

  return (
    <main className="page">
      <Hero content={content} state={state} />
      <RegistrationSection content={content} />
      <Footer content={content} />
    </main>
  )
}