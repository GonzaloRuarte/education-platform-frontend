"use client"

import MenuDivider from '@/shared/layout/MenuDivider'
import { ExpandLess, ExpandMore, SvgIconComponent } from '@mui/icons-material'
import { Box, Collapse, IconButton } from '@mui/material'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Link from 'next/link'
import React from 'react'

interface I_Props {
  Icon?: SvgIconComponent
  label: string
  subMenu?: React.JSX.Element
  href?: React.ComponentProps<typeof Link>["href"]
}


const MenuItem = ({ Icon = undefined, label, subMenu = undefined, href = undefined }: I_Props) => {
  const [open, setOpen] = React.useState(false);
  const handleClick = () => {
    setOpen(!open);
  };
  const hasSubmenu = subMenu !== undefined
  return <>
    <ListItem disablePadding>
      {/* @ts-expect-error */}
      <ListItemButton LinkComponent={Link} href={href} >
        {Icon !== undefined && <ListItemIcon>
          <Icon />
        </ListItemIcon>}
        <ListItemText primary={label} />
      </ListItemButton>
      {hasSubmenu && <Box mr={1}>
        <IconButton onClick={handleClick}>
          {open ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>}
    </ListItem>
    {hasSubmenu && <>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {subMenu}
      </Collapse>
      {open && <MenuDivider />}
    </>}
  </>
}

export default MenuItem