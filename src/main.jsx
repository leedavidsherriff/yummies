import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BIZ } from './config.js'
import './index.css'

// Push BIZ colours into CSS custom properties so a reskin is config-only.
const root = document.documentElement
root.style.setProperty('--charcoal', BIZ.colors.charcoal)
root.style.setProperty('--ember', BIZ.colors.ember)
root.style.setProperty('--amber', BIZ.colors.amber)
root.style.setProperty('--cream', BIZ.colors.cream)
root.style.setProperty('--smoke', BIZ.colors.smoke)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
