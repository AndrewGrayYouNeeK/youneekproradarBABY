import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import '@/lib/platform' // applies platform-* class to <body>

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)