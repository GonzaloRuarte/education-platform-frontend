import { T_FCwChildren } from '@/shared/types'
import List from '@mui/material/List'


const MenuBlock: T_FCwChildren<{ isSubMenu?: boolean }> = ({ children, isSubMenu = false }) => (
  <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', pl: !isSubMenu ? 0 : 4 }} component="nav"
  >{children}</List>
)

export default MenuBlock