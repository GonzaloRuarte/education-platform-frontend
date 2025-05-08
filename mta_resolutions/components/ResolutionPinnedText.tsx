import { LIGHT_BG_COLOR } from '@/config'
import { Box, Button, Grid2, IconButton } from '@mui/material'
import React, { useState } from 'react'
import parse from 'html-react-parser'
import { Body1, H3, H4 } from '@/shared/components/Typography'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import HTMLParser from '@/shared/components/HTMLParser'
const ResolutionPinnedText = ({ pinnedText }) => {
  const [isOpen, setIsOpen] = useState(false)
  const closedSize = '70px'
  return (
    <>
      <Box
        style={{
          transform: 'translateY(-50%)',
          width: isOpen ? '30%' : closedSize,
          height: isOpen ? 'auto' : closedSize,
          minWidth: isOpen ? '400px' : closedSize,
          minHeight: isOpen ? '30%' : undefined,
          maxHeight: isOpen ? '40%' : undefined,
          right: 20,
          top: '50%',
          position: 'fixed',
          borderRadius: 20,
          padding: isOpen ? '30px' : '10px',
          display: 'flex',
        }}
        bgcolor={LIGHT_BG_COLOR}
        boxShadow={'3px 3px 15px rgba(0,0,0,.1)'}
      >
        {isOpen && (
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box>
              <MagicGrid itemSize="auto">
                <H4>Texto Fijo</H4>
                <Button onClick={() => setIsOpen(false)}>Cerrar</Button>
              </MagicGrid>
              <Spacer />
            </Box>
            <Box
              sx={{
                background: '#FFFFFF55',
                overflowY: 'scroll',
                // boxShadow: 'inset 0px 0px 20px rgba(0,0,0,.1)',
                padding: '5px 30px',
              }}
              flex={1}
            >
              <HTMLParser htmlContent={pinnedText} />
            </Box>
          </Box>
        )}

        {!isOpen && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <Body1 position={'absolute'} textAlign={'right'} right={90} width={200}>
              Desplegar texto
              <br />
              de trabajo
            </Body1>
            <IconButton onClick={() => setIsOpen(true)}>
              <ArrowBackIosIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </>
  )
}

export default ResolutionPinnedText
