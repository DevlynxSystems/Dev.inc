import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import './index.css'

const THEME_VALUES = ['light', 'dark', 'readable']

const storedTheme = localStorage.getItem('theme')
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
const initialTheme = THEME_VALUES.includes(storedTheme)
  ? storedTheme
  : (prefersDark ? 'dark' : 'light')

document.documentElement.setAttribute('data-theme', initialTheme)
localStorage.setItem('theme', initialTheme)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  </React.StrictMode>,
)
