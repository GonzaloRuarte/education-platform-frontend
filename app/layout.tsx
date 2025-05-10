import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'

import { ApplicationServices } from '@/shared/appServices/ApplicationServices'
import GlobalBackdrop from '@/shared/components/GlobalBackdrop'
import theme from '@/shared/theme'

import { ToastContainer } from 'react-toastify'

import RecoverEvaluationSubjects from '@/mta_evaluations/appServices/RecoverEvaluationSubjects'
import LoadFormulasResources from '@/shared/formulas/appServices/LoadFormulasResources'
import LocalizationProvider from '@/shared/datetime/LocalizationProvider'
import { MAIN_BG_COLOR } from '@/config'
import '@/shared/globals.css'

const monstserrat = Montserrat({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

const APP_NAME = 'Meta Evaluaciones'
const APP_DEFAULT_TITLE = 'Meta Evaluaciones'
const APP_TITLE_TEMPLATE = '%s - Meta Evaluaciones'
const APP_DESCRIPTION = 'Sistema de evaluaciones para escuelas.'

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
}

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
  themeColor: '#FFFFFF',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr">
      <body
        className={monstserrat.variable}
        style={{ background: `${MAIN_BG_COLOR} !important` }}
        suppressContentEditableWarning={true}
      >
        <AppRouterCacheProvider>
          <CssBaseline>
            <ThemeProvider theme={theme}>
              <LocalizationProvider>
                <ToastContainer />
                <GlobalBackdrop />
                <ApplicationServices
                  version={'0.2.0'}
                  services={[RecoverEvaluationSubjects, LoadFormulasResources]}
                  d={{}}
                />
                {children}
              </LocalizationProvider>
            </ThemeProvider>
          </CssBaseline>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
