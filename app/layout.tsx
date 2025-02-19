import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { Metadata } from "next";
import { Roboto } from "next/font/google";

import Head from 'next/head';

import theme from '@/shared/theme';
import { ToastContainer } from 'react-toastify';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});


export const metadata: Metadata = {
  title: "Meta",
  description: "Sistema de evaluaciones.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <body className={roboto.variable}>
        <AppRouterCacheProvider>
          <CssBaseline>
            <ThemeProvider theme={theme}>
              {/* <ToastContainer /> */}
              {children}
            </ThemeProvider>
          </CssBaseline>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
