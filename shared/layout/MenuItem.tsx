"use client"

import MenuDivider from '@/shared/layout/MenuDivider'
import { ExpandLess, ExpandMore, SvgIconComponent } from '@mui/icons-material'
import { Collapse } from '@mui/material'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import React from 'react'

interface I_Props {
  Icon?: SvgIconComponent
  label: string
  subMenu?: React.JSX.Element
}

const MenuItem = ({ Icon = undefined, label, subMenu = undefined }: I_Props) => {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(!open);
  };
  const hasSubmenu = subMenu !== undefined

  return <>
    <ListItem disablePadding>
      <ListItemButton onClick={handleClick}>
        {Icon !== undefined && <ListItemIcon>
          <Icon />
        </ListItemIcon>}
        <ListItemText primary={label} />
        {hasSubmenu && (open ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>
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