import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import './index.css'

const storedTheme = localStorage.getItem('theme')
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
const initialTheme = storedTheme === 'light' || storedTheme === 'dark'
  ? storedTheme
  : (prefersDark ? 'dark' : 'light')

document.documentElement.setAttribute('data-theme', initialTheme)
localStorage.setItem('theme', initialTheme)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
