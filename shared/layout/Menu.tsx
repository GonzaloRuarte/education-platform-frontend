
import MenuBlock from '@/shared/layout/MenuBlock'
import MenuDivider from '@/shared/layout/MenuDivider'
import MenuItem from '@/shared/layout/MenuItem'
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PersonIcon from '@mui/icons-material/Person';
import Groups2Icon from '@mui/icons-material/Groups2';
import BadgeIcon from '@mui/icons-material/Badge';


const Menu = () => {
  return <>
    <MenuBlock>
      <MenuItem Icon={SchoolIcon} label='Escuelas' subMenu={
        <MenuBlock isSubMenu>
          <MenuItem label='Comisiones' />
          <MenuItem label='Roles' />
        </MenuBlock>
      } />
      <MenuItem Icon={CalendarMonthIcon} label='Turnos' />
      <MenuItem Icon={FactCheckIcon} label='Evaluaciones' />

      <MenuItem Icon={PersonIcon} label='Alumnos' />
      <MenuItem Icon={Groups2Icon} label='Comisiones' />
      <MenuItem Icon={BadgeIcon} label='Roles' />
    </MenuBlock>

    <MenuDivider />
  </>

}

export default Menu