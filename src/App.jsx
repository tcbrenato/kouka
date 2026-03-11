import { useState } from 'react'
import './index.css'
import Home from './pages/Home'
import DocumentForm from './pages/DocumentForm'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [docType, setDocType] = useState(null)

  const goHome = () => { setCurrentPage('home'); setDocType(null) }
  const openDoc = (type) => { setDocType(type); setCurrentPage('form') }

  return (
    <div className="app-wrapper">
      {/* HEADER */}
      <header className="header no-print">
        <div className="logo" onClick={goHome}>
          <div className="logo-icon">K</div>
          <div>
            <div className="logo-text">KOUKA</div>
            <div className="logo-sub">Gestion documentaire</div>
          </div>
        </div>
        <div className="header-actions">
          {currentPage === 'form' && (
            <button className="btn btn-ghost btn-sm" onClick={goHome}>
              ← <span>Accueil</span>
            </button>
          )}
        </div>
      </header>

      {/* PAGE */}
      <main className="main-content">
        {currentPage === 'home' && <Home onSelect={openDoc} />}
        {currentPage === 'form' && docType && (
          <DocumentForm docType={docType} onBack={goHome} />
        )}
      </main>
    </div>
  )
}
