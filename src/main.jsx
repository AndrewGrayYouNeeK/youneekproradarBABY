import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import AppErrorBoundary from '@/components/AppErrorBoundary.jsx'
import '@/index.css'
import '@/lib/platform' // applies platform-* class to <body>

// Ensure page title displays correctly in browser tab
document.title = 'YouNeeK Pro Radar'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
)
