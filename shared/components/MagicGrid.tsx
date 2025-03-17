import React from 'react'
import Grid, { GridBaseProps, Grid2Props as GridProps } from '@mui/material/Grid2'

type T_MagicGridProps = GridProps & {
  children: React.ReactNode
  itemSize?: GridBaseProps['size']
}

const MagicGrid: React.FC<T_MagicGridProps> = ({ children, itemSize = 12, ...props }) => {
  return (
    <Grid container spacing={2} {...props} alignItems={'center'}>
      {React.Children.map(children, (child, index) => (
        <Grid size={itemSize} key={index}>
          {child}
        </Grid>
      ))}
    </Grid>
  )
}

export default MagicGrid
