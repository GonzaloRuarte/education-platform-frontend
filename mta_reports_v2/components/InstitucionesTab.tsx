'use client'

import { useEffect, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { useAuthResources } from '@/mta_auth/hooks'
import { axiosGet } from '@/shared/data/axios'
import { apiUrl } from '@/config'
import { COLORS } from '@/mta_reports_v2/constants'
import Logo from '@/shared/components/Logo'

const C = COLORS

interface School {
  id: number
  name: string
}

interface InstitucionesTabProps {
  schoolId: number
}

const InstitucionesTab = ({ schoolId }: InstitucionesTabProps) => {
  const auth = useAuthResources()
  const [schools, setSchools] = useState<School[] | null>(null)

  useEffect(() => {
    let alive = true
    axiosGet<School[]>({
      url: apiUrl(`/reportes-aurora/escuela/${schoolId}/instituciones-participantes/`),
      requestSetup: auth,
      options: {},
    })
      .then(res => {
        if (alive) setSchools(res)
      })
      .catch(() => {
        if (alive) setSchools([])
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.accessToken, schoolId])

  const half = Math.ceil((schools?.length ?? 0) / 2)
  const left = schools?.slice(0, half) ?? []
  const right = schools?.slice(half) ?? []

  return (
    <Box sx={{ p: { xs: 3, md: 8 }, bgcolor: C.bgGrey, minHeight: 'calc(100vh - 220px)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Typography sx={{ color: C.navy, fontWeight: 800, fontSize: 'clamp(36px, 5vw, 52px)' }}>
          Instituciones participantes
        </Typography>
        <Logo width={190} height={54} />
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mt: 4 }}>
        {[left, right].map((col, ci) => (
          <Box key={ci}>
            {col.map(s => (
              <Typography key={s.id} sx={{ color: C.navy, fontSize: 18, lineHeight: 1.6 }}>
                {s.name}
              </Typography>
            ))}
          </Box>
        ))}
      </Box>
      {schools !== null && schools.length === 0 && (
        <Typography sx={{ color: C.tm, mt: 4 }}>Sin instituciones para mostrar.</Typography>
      )}
    </Box>
  )
}

export { InstitucionesTab }
