import { Box, useTheme, Typography} from '@mui/material'

import React, { useLayoutEffect, useRef, useState } from 'react';



interface StickyPinnedProps {
  text: string | null;
}

export const StickyPinned: React.FC<StickyPinnedProps> = ({ text }) => {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  // start with the theme’s body1 size
  const [fontSize, setFontSize] = useState<number | string>(theme.typography.body1.fontSize ?? 16);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const fits = () => el.scrollHeight <= el.clientHeight;

    // Try down-scaling until it fits or we reach 0.75 rem
    if (!fits()) {
      let size = parseFloat(fontSize as string);
      while (!fits() && size > 12) { // 12px ≈ 0.75rem
        size -= 1;
        el.style.fontSize = `${size}px`;
      }
      setFontSize(`${size}px`);
    }
  }, [text]); // re-run when page changes

  if (!text) return null;

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        maxHeight: '50vh',
        overflow: 'visible',
        p: 2,
      }}
    >
      <Typography
        ref={ref}
        component="div"
        sx={{ fontSize, lineHeight: 1.35 }}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </Box>
  );
};
