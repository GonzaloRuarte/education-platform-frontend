'use client'

import { createTheme } from '@mui/material/styles'
import { red } from '@mui/material/colors'
import { esES } from '@mui/material/locale'

// Create a theme instance.
const colorsTheme = createTheme({
  palette: {
    primary: {
      main: '#004D8F',
    },
    secondary: {
      main: '#465F84',
    },
    error: {
      main: red.A400,
    },
  },
})
const theme = createTheme(
  {
    ...colorsTheme,
    typography: {
      fontFamily: 'var(--font-montserrat)',
      h1: {
        fontSize: 42,
        fontWeight: 'normal',
      },
      h2: {
        fontSize: 36,
      },
      h3: {
        fontSize: 30,
      },
      h4: {
        fontSize: 22,
      },
      h5: {
        fontSize: 14,
      },
      h6: {
        fontSize: 8,
      },
    },

    components: {
      MuiAppBar: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: 'transparent',
            color: colorsTheme.palette.primary.main,
          },
        },
      },
      MuiButton: { defaultProps: { style: { borderRadius: 20 }, disableElevation: true } },
      MuiTypography: {
        defaultProps: {
          variantMapping: {
            h1: 'h1',
            h2: 'h2',
            h3: 'h3',
            h4: 'h4',
            h5: 'h5',
            h6: 'h6',
            subtitle1: 'h2',
            subtitle2: 'h2',
            body1: 'p',
            body2: 'p',
          },
        },
      },
    },
  },
  esES,
)

export default theme
