import React, { useMemo, useState, useEffect } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'

function getDarkModePreference() {
  switch(localStorage.getItem('darkMode')) {
    case 'dark':
      return true
    case 'light':
      return false
    default:
      return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
}

const prefersDarkMode = getDarkModePreference()
export const DarkModeContext = React.createContext({darkMode: prefersDarkMode})

export default function Themer({ children }) {
  const [ darkMode, setDarkMode ] = useState(prefersDarkMode)

  // initialize .dark on body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark')
    }
    setDarkMode(prefersDarkMode)
  }, [prefersDarkMode, setDarkMode])

  const toggleDarkMode = () => {
    if (darkMode) {
      document.body.classList.remove('dark')
    } else {
      document.body.classList.add('dark')
    }
    setDarkMode(!darkMode)
    localStorage.setItem('darkMode', !darkMode ? 'dark' : 'light')
  }

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode]
  )

  return (
    <DarkModeContext.Provider value={{darkMode, toggleDarkMode}}>
      <ThemeProvider theme={theme}>
        { children }
      </ThemeProvider>
    </DarkModeContext.Provider>
  )
}
