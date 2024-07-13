import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from '@mui/material/styles'
import Theme from './themes/theme.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={Theme}>
    <BrowserRouter>
        <App />
    </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)
