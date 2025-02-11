'use client'

import { createTheme } from '@mui/material/styles'
import { red } from '@mui/material/colors'
import { esES } from '@mui/material/locale';


// Create a theme instance.
const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-roboto)',
  },
  palette: {
    primary: {
      main: '#0071CE',
    },
    secondary: {
      main: '#0071CE',
    },
    error: {
      main: red.A400,
    },
  },
}, esES);

export default theme;