import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { RenovationProvider } from './store'
import { AuthProvider } from './auth'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RenovationProvider>
          <App />
        </RenovationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

