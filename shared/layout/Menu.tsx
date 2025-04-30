import P from '@/pages'
import MenuBlock from '@/shared/layout/MenuBlock'
import MenuDivider from '@/shared/layout/MenuDivider'
import MenuItem from '@/shared/layout/MenuItem'
import BadgeIcon from '@mui/icons-material/Badge'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import PersonIcon from '@mui/icons-material/Person'
import SchoolIcon from '@mui/icons-material/School'

const Menu = () => {
  return (
    <>
      <MenuBlock>
        <MenuItem
          Icon={SchoolIcon}
          label={P.D._.escuelas.label}
          href={P.D._.escuelas.path}
          subMenu={
            <MenuBlock isSubMenu>
              <MenuItem label={P.D._.escuelas._.agregar.label} href={P.D._.escuelas._.agregar.path} />
            </MenuBlock>
          }
        />
        <MenuItem
          Icon={CalendarMonthIcon}
          label={P.D._.turnos.label}
          href={P.D._.turnos.path}
          subMenu={
            <MenuBlock isSubMenu>
              <MenuItem label={P.D._.turnos._.solicitar.label} href={P.D._.turnos._.solicitar.path} />
            </MenuBlock>
          }
        />
        <MenuItem Icon={FactCheckIcon} label={P.D._.evaluaciones.label} href={P.D._.evaluaciones.path} />
        <MenuItem
          Icon={PersonIcon}
          label={P.D._.estudiantes.label}
          href={P.D._.estudiantes.path}
          subMenu={
            <MenuBlock isSubMenu>
              <MenuItem label={P.D._.estudiantes._.cargaMasiva.label} href={P.D._.estudiantes._.cargaMasiva.path} />
            </MenuBlock>
          }
        />
        <MenuItem
          Icon={BadgeIcon}
          label={P.D._.usuarios.label}
          href={P.D._.usuarios.path}
          subMenu={
            <MenuBlock isSubMenu>
              <MenuItem label={P.D._.usuarios._.staffEscuela.label} href={P.D._.usuarios._.staffEscuela.path} />
            </MenuBlock>
          }
        />
      </MenuBlock>

      {/* <MenuDivider /> */}
    </>
  )
}

export default Menu
