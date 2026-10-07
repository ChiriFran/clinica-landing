import { useEffect } from 'react'
import { useContent } from '../lib/useContent'
import { Hero } from './Hero'
import { RegistrationSection } from './RegistrationSection'
import { Footer } from './Footer'

function updateMetaTag(property, content) {
  if (!content) return
  
  let tag = document.head.querySelector(`meta[property="${property}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function updateNameTag(name, content) {
  if (!content) return
  
  let tag = document.head.querySelector(`meta[name="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function upsertJsonLd(schema) {
  let script = document.head.querySelector('script[data-seo-schema]')
  if (!script) {
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.seoSchema = 'true'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(schema)
}

export function Landing() {
  const { content, state } = useContent()

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', content.theme?.accent || '#f94316')
    document.documentElement.style.setProperty('--accent-alt', content.theme?.accentAlt || '#facc15')

    const brandName = content.brand?.name || 'Clinica Off Road'
    const edition = content.brand?.edition || 'Edición 2026'
    const badge = content.hero?.badge || ''
    const title = badge ? `${brandName} | ${badge}` : brandName
    
    const heroTitle = content.hero?.title || brandName
    const heroSubtitle = content.hero?.subtitle || ''
    const aboutBody = content.about?.body || ''
    const instructors = content.about?.instructors || 'Instructores profesionales AMT'
    
    const formTitle = content.form?.title || 'Inscripción'
    const formSubtitle = content.form?.subtitle || ''
    const thanksTitle = content.form?.thanksTitle || 'Inscripción registrada'
    const thanksBody = content.form?.thanksBody || ''
    
    const description = aboutBody || heroSubtitle || 'Clínica de manejo en tierra guiada por instructores profesionales AMT. Cupos limitados. Inscripción online.'
    const fullDescription = `${heroTitle}. ${heroSubtitle}. ${aboutBody}`.trim()
    
    const imageUrl = content.hero?.image || '/og-image.svg'
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://clinica-landing-alpha.vercel.app'
    
    const eventDate = content.event?.date || '4 de octubre 2026'
    const eventVenue = content.event?.venue || 'PANDA TROUPE Off Road'
    const eventAddress = content.event?.address || 'RN5 KM 71, Olivera, Buenos Aires'
    const eventTime = content.event?.time || '10:30 hs'
    const eventBadge = content.event?.badge || 'Cupos limitados'
    const eventNotes = (content.event?.notes || []).join('. ')
    
    const price = content.pricing?.basePrice || '$120.000,-'
    const priceNumber = (price.replace(/[^\d]/g, '') || '120000').slice(0, 6)
    const baseNote = content.pricing?.baseNote || 'Incluye entrada, seguro e hidratación'
    const callout = content.pricing?.callout || 'Motos de cualquier marca y modelo'
    
    const lunchTitle = content.pricing?.lunchTitle || 'Almuerzo'
    const lunchPrice = content.pricing?.lunchPrice || '$40.000,-'
    const lunchDescription = content.pricing?.lunchDescription || ''
    const lunchEnabled = content.pricing?.lunchEnabled || false
    
    const contactName = content.contact?.name || 'Clinica Off Road'
    const contactPhone = content.contact?.phone || '1150443330'
    const contactWhatsapp = content.contact?.whatsapp || 'https://wa.me/541150443330'
    
    const hashtags = (content.social?.hashtags || ['#clinicaoffroad', '#offroad']).join(', ')
    const faqItems = content.faq || []

    // Actualizar título
    document.title = title

    // Meta tags básicos
    updateNameTag('description', fullDescription)
    updateNameTag('keywords', `clinica off road, manejo en tierra, motos, ${instructors}, off-road, capacitacion, circuito, ${eventVenue}, ${hashtags}`)
    updateNameTag('author', contactName)
    updateNameTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1')
    updateNameTag('language', 'es')
    updateNameTag('viewport', 'width=device-width, initial-scale=1.0')
    updateNameTag('theme-color', '#0b0d10')

    // Open Graph
    updateMetaTag('og:type', 'website')
    updateMetaTag('og:title', title)
    updateMetaTag('og:description', fullDescription)
    updateMetaTag('og:image', imageUrl)
    updateMetaTag('og:image:alt', `${brandName} - ${eventDate}`)
    updateMetaTag('og:image:width', '1200')
    updateMetaTag('og:image:height', '630')
    updateMetaTag('og:image:type', 'image/svg+xml')
    updateMetaTag('og:url', currentUrl)
    updateMetaTag('og:site_name', brandName)
    updateMetaTag('og:locale', 'es_AR')

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', fullDescription)
    updateMetaTag('twitter:image', imageUrl)
    updateMetaTag('twitter:image:alt', `${brandName} - ${eventDate}`)

    // Schema.org - Event
    upsertJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: heroTitle,
      description: fullDescription,
      image: imageUrl,
      url: currentUrl,
      startDate: '2026-10-04T10:30:00-03:00',
      endDate: '2026-10-04T17:00:00-03:00',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: eventVenue,
        address: {
          '@type': 'PostalAddress',
          streetAddress: eventAddress,
          addressLocality: 'Olivera',
          addressRegion: 'Buenos Aires',
          postalCode: 'B1636',
          addressCountry: 'AR',
        },
      },
      organizer: {
        '@type': 'Organization',
        name: contactName,
        url: currentUrl,
        telephone: contactPhone,
        email: `mailto:${contactPhone}@wa.me`,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          telephone: contactPhone,
          url: contactWhatsapp,
        },
      },
      performer: {
        '@type': 'Organization',
        name: instructors,
        description: aboutBody,
      },
      offers: [
        {
          '@type': 'Offer',
          name: formTitle,
          description: baseNote,
          price: priceNumber,
          priceCurrency: 'ARS',
          availability: 'https://schema.org/PreOrder',
          url: `${currentUrl}#inscripcion`,
          validFrom: '2026-10-04',
        },
        ...(lunchEnabled ? [{
          '@type': 'Offer',
          name: lunchTitle,
          description: lunchDescription,
          price: lunchPrice.replace(/[^\d]/g, ''),
          priceCurrency: 'ARS',
          url: `${currentUrl}#inscripcion`,
        }] : []),
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '24',
      },
    })

    // Schema.org - Organization
    upsertJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: brandName,
      alternateName: 'Clinica Off Road',
      description: `${aboutBody}. ${callout}`,
      url: 'https://clinica-landing-alpha.vercel.app',
      logo: imageUrl,
      image: imageUrl,
      sameAs: [contactWhatsapp],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        telephone: contactPhone,
        contactOption: 'TollFree',
        areaServed: 'AR',
        url: contactWhatsapp,
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: eventAddress,
        addressLocality: 'Olivera',
        addressRegion: 'Buenos Aires',
        postalCode: 'B1636',
        addressCountry: 'AR',
      },
    })

    // Schema.org - FAQPage
    if (faqItems.length > 0) {
      upsertJsonLd({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      })
    }

  }, [
    content.brand?.name,
    content.brand?.edition,
    content.hero?.title,
    content.hero?.subtitle,
    content.hero?.badge,
    content.hero?.image,
    content.about?.body,
    content.about?.instructors,
    content.form?.title,
    content.form?.subtitle,
    content.form?.thanksTitle,
    content.form?.thanksBody,
    content.event?.date,
    content.event?.venue,
    content.event?.address,
    content.event?.time,
    content.event?.badge,
    content.event?.notes,
    content.pricing?.basePrice,
    content.pricing?.baseNote,
    content.pricing?.callout,
    content.pricing?.lunchTitle,
    content.pricing?.lunchPrice,
    content.pricing?.lunchDescription,
    content.pricing?.lunchEnabled,
    content.contact?.name,
    content.contact?.phone,
    content.contact?.whatsapp,
    content.social?.hashtags,
    content.faq,
  ])

  return (
    <main className="page" role="main">
      <Hero content={content} state={state} />
      <RegistrationSection content={content} />
      <Footer content={content} />
    </main>
  )
}
