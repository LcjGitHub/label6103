import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { EnvelopeProvider } from './context/EnvelopeContext'
import { LanguageProvider } from './context/LanguageContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <EnvelopeProvider>
          <App />
        </EnvelopeProvider>
      </BrowserRouter>
    </LanguageProvider>
  </StrictMode>,
)
