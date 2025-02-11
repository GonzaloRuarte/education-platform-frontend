
import MenuBlock from '@/shared/layout/MenuBlock'
import MenuDivider from '@/shared/layout/MenuDivider'
import MenuItem from '@/shared/layout/MenuItem'
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PersonIcon from '@mui/icons-material/Person';
import Groups2Icon from '@mui/icons-material/Groups2';
import BadgeIcon from '@mui/icons-material/Badge';
import P from '@/pages'


const Menu = () => {
  return <>
    <MenuBlock>
      <MenuItem Icon={SchoolIcon} label={P.escuelas.label} href={P.escuelas.path} subMenu={
        <MenuBlock isSubMenu>
          <MenuItem label={P.escuelas.subpages.agregarEscuela.label} href={P.escuelas.subpages.agregarEscuela.path} />
        </MenuBlock>
      } />
      <MenuItem Icon={CalendarMonthIcon} label={P.turnos.label} href={P.turnos.path} />
      <MenuItem Icon={FactCheckIcon} label={P.evaluaciones.label} href={P.evaluaciones.path} />
      <MenuItem Icon={PersonIcon} label={P.alumnos.label} href={P.alumnos.path} />
      <MenuItem Icon={Groups2Icon} label={P.comisiones.label} href={P.comisiones.path} />
      <MenuItem Icon={BadgeIcon} label={P.roles.label} href={P.roles.path} />
    </MenuBlock>

    <MenuDivider />
  </>

}

export default Menu