'use client'

import { createTheme } from '@mui/material/styles'
import { red } from '@mui/material/colors'
import { esES } from '@mui/material/locale';


// Create a theme instance.
const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-roboto)',
    h1: {
      fontSize: 42,
      fontWeight: 'normal'
    },
    h2: {
      fontSize: 38
    },
    h3: {
      fontSize: 34
    },
    h4: {
      fontSize: 30
    },
    h5: {
      fontSize: 26
    },
    h6: {
      fontSize: 22
    },
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