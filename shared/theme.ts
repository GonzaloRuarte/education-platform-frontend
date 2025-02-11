'use client'

import { createTheme } from '@mui/material/styles'
import { red } from '@mui/material/colors'
import { esES } from '@mui/material/locale';


// Create a theme instance.
const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-roboto)',
    fontSize: 14,
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
  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: 'h2',
          h2: 'h2',
          h3: 'h2',
          h4: 'h2',
          h5: 'h2',
          h6: 'h2',
          subtitle1: 'h2',
          subtitle2: 'h2',
          body1: 'span',
          body2: 'span',
        },
      },
    },
  },
}, esES);

export default theme;