import React from 'react'
import Grid, { Grid2Props as GridProps } from '@mui/material/Grid2'

type T_MagicGridProps = GridProps & {
  children: React.ReactNode
}

const MagicGrid: React.FC<T_MagicGridProps> = ({ children, ...props }) => {
  return (
    <Grid container spacing={2} {...props}>
      {React.Children.map(children, (child, index) => (
        <Grid size={12} key={index}>
          {child}
        </Grid>
      ))}
    </Grid>
  )
}

export default MagicGrid