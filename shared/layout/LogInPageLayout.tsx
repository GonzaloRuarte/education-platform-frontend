import Box from '@mui/material/Box'

import Footer from '@/shared/layout/Footer'
import { T_FCwChildren } from '@/shared/types'
import Image from 'next/image'

const LogInPageLayout: T_FCwChildren<{ pic: 'boy' | 'girl' }> = ({ children, pic = 'boy' }) => {
  return (
    <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflowX: 'hidden', flexDirection: 'column' }}>
      <Box height="auto" flex={1} display={'flex'}>
        <Box flex={1} position="relative">
          <Box
            width={'70%'}
            height="70%"
            position="absolute"
            zIndex={1}
            sx={{ mixBlendMode: 'multiply' }}
            top={-20}
            left={-20}
          >
            <Image src="/triangle.png" alt="Chico estudiando" objectPosition="top left" fill objectFit="contain" />
          </Box>
          <Box width={'100%'} height="100%" position="relative" sx={{ mixBlendMode: 'multiply' }}>
            <Image src={`/${pic}.jpg`} alt="Chico estudiando" objectPosition="bottom right" fill objectFit="contain" />
          </Box>
        </Box>
        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
          {children}
        </Box>
      </Box>
      <Footer includePin={false} />
    </Box>
  )
}
export default LogInPageLayout

const LogInPageLayoutBoy: T_FCwChildren = (p) => <LogInPageLayout {...p} pic="boy" />

const LogInPageLayoutGirl: T_FCwChildren = (p) => <LogInPageLayout {...p} pic="girl" />

export { LogInPageLayoutBoy, LogInPageLayoutGirl }
