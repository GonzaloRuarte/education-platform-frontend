'use client'

import { RRCC } from '@/mta_auth/components/RestrictedContent'
import P from '@/pages'
import MagicGrid from '@/shared/components/MagicGrid'
import MenuBlock from '@/shared/layout/MenuBlock'
import MenuItem from '@/shared/layout/MenuItem'
import { range } from '@/shared/utils'
import BadgeIcon from '@mui/icons-material/Badge'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import HistoryIcon from '@mui/icons-material/History'
import PersonIcon from '@mui/icons-material/Person'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import SchoolIcon from '@mui/icons-material/School'
import { ListItem, Skeleton } from '@mui/material'
import { useIsClient } from '@uidotdev/usehooks'

const SkeletonMenu = () => {
  return (
    <MenuBlock>
      {range(0, 5).map((n) => (
        <ListItem key={n}>
          <MagicGrid itemSize="auto">
            <Skeleton animation="wave" variant="circular" width={30} height={30} />
            <Skeleton animation="wave" variant="rectangular" width={170} height={20} />
          </MagicGrid>
        </ListItem>
      ))}
    </MenuBlock>
  )
}

const Menu = () => {
  const isClient = useIsClient()

  if (!isClient) return <SkeletonMenu />
  return (
    <>
      <MenuBlock>
        <RRCC allowedProfiles={['admin']}>
          <MenuItem Icon={SchoolIcon} label={P.D._.escuelas.label} href={P.D._.escuelas.path} />
        </RRCC>
        <RRCC allowedProfiles={['admin', 'school_staff']}>
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
        </RRCC>
        <RRCC allowedProfiles={['admin', 'evaluator']}>
          <MenuItem Icon={FactCheckIcon} label={P.D._.evaluaciones.label} href={P.D._.evaluaciones.path} />
        </RRCC>
        <RRCC allowedProfiles={['admin', 'school_staff']}>
          <MenuItem
            Icon={HistoryIcon}
            label={P.D._.procesosDeEvaluacion.label}
            href={P.D._.procesosDeEvaluacion.path}
          />
        </RRCC>
        <RRCC allowedProfiles={['admin', 'school_staff']}>
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
        </RRCC>
        <RRCC allowedProfiles={['admin']}>
          <MenuItem
            Icon={BadgeIcon}
            label={P.D._.usuarios.label}
            href={P.D._.usuarios.path}
            subMenu={
              <MenuBlock isSubMenu>
                <MenuItem
                  label={P.D._.usuarios._.responsableInstitucional.label}
                  href={P.D._.usuarios._.responsableInstitucional.path}
                />
                <MenuItem label={P.D._.usuarios._.itemista.label} href={P.D._.usuarios._.itemista.path} />
              </MenuBlock>
            }
          />
        </RRCC>
        <RRCC allowedProfiles={['admin', 'school_staff']}>
          <MenuItem Icon={QueryStatsIcon} label={P.D._.reportes.label} href={P.D._.reportes.path} />
        </RRCC>
        <RRCC allowedProfiles={['superuser']}>
          <MenuItem Icon={DeveloperBoardIcon} label={P.D._.devPanel.label} href={P.D._.devPanel.path} />
        </RRCC>
      </MenuBlock>
    </>
  )
}

export default Menu
