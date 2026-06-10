import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { EnvelopeProvider } from './context/EnvelopeContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <EnvelopeProvider>
        <App />
      </EnvelopeProvider>
    </BrowserRouter>
  </StrictMode>,
)
