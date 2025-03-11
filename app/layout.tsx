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

const monstserrat = Montserrat({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'Meta',
  description: 'Sistema de evaluaciones.',
}

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={monstserrat.variable} style={{ background: '#f1f1f1 !important' }}>
        <AppRouterCacheProvider>
          <CssBaseline>
            <ThemeProvider theme={theme}>
              <ToastContainer />
              <GlobalBackdrop />
              <ApplicationServices version={'0.1.0'} services={[RecoverEvaluationSubjects]} d={{}} />
              {children}
            </ThemeProvider>
          </CssBaseline>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
