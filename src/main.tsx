import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Initialisation d'i18next avant le rendu de l'application
import './i18n'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
