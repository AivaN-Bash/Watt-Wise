import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { Hero } from './Hero'
import { Demo } from './Shell'

function Site() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
  const appPath = `${basePath}/app`
  const homePath = `${basePath}/` || '/'
  const [page, setPage] = useState(() => location.pathname === appPath ? 'app' : 'home')
  useEffect(() => {
    const sync = () => setPage(location.pathname === appPath ? 'app' : 'home')
    addEventListener('popstate', sync)
    return () => removeEventListener('popstate', sync)
  }, [])
  const navigate = (next: 'home' | 'app') => {
    history.pushState({}, '', next === 'app' ? appPath : homePath)
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return page === 'app'
    ? <Demo onBack={() => navigate('home')} />
    : <Hero onStart={() => navigate('app')} />
}

createRoot(document.getElementById('root')!).render(<StrictMode><Site /></StrictMode>)
