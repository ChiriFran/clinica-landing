import { lazy, Suspense } from 'react'
import { Landing } from './components/Landing'
import './styles.css'

const Admin = lazy(() => import('./admin/Admin').then((m) => ({ default: m.Admin })))

function Router() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path.startsWith('/admin')) {
    return (
      <Suspense fallback={<div className="admin"><div className="admin__card muted">Cargando panel…</div></div>}>
        <Admin />
      </Suspense>
    )
  }
  return <Landing />
}

export default function App() {
  return <Router />
}