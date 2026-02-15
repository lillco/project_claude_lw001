import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'
import AuthenticatedApp from './components/auth/AuthenticatedApp'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AuthenticatedApp>
        <App />
      </AuthenticatedApp>
    </AuthProvider>
  </React.StrictMode>,
)
