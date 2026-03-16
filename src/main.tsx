import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { seedDefaultDecks } from './lib/seed'
import './index.css'

seedDefaultDecks()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
