import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Override stale cached HTML titles from the old Base44 deployment.
document.title = 'YouNeeK Pro Radar'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
