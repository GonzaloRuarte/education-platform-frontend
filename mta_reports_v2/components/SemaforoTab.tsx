'use client'

import { Box, Tabs, Tab, Typography } from '@mui/material'
import { useState } from 'react'
import { COLORS, ANIO_ORDER, FONT_SIZES } from '@/mta_reports_v2/constants'
import { SEMAFORO_NIVELES, NIVEL_COLORS, NIVEL_KEYS, ANIO_LABELS } from '@/mta_reports_v2/semaforo_data'
import type { SemaforoNivel } from '@/mta_reports_v2/semaforo_data'
import type { I_SemaforoBandas } from '@/mta_reports_v2/types'

const C = COLORS
const F = FONT_SIZES

function GruposList({ grupos }: { grupos: SemaforoNivel['col1'] }) {
  return (
    <Box>
      {grupos.map((g, gi) => (
        <Box key={gi} sx={{ mb: g.titulo ? 1 : 0 }}>
          {g.titulo && (
            <Typography sx={{ color: C.navy, fontWeight: 700, fontSize: F.md, mb: 0.25 }}>
              {g.titulo}
            </Typography>
          )}
          {g.items.map((item, ii) => (
            <Typography key={ii} sx={{ color: C.navy, fontSize: F.md, lineHeight: 1.5 }}>
              -{item}
            </Typography>
          ))}
        </Box>
      ))}
    </Box>
  )
}

function NivelRow({ nivel, bandas, nivelKey, isLast }: { nivel: SemaforoNivel; bandas: I_SemaforoBandas | undefined; nivelKey: string; isLast?: boolean }) {
  const color = NIVEL_COLORS[nivelKey] ?? C.mutedGrey
  const count = bandas ? bandas[nivelKey as keyof I_SemaforoBandas] as number : 0
  const pct = bandas && bandas.total > 0 ? Math.round((count / bandas.total) * 100) : 0
  const pctLabel = bandas && bandas.total > 0 ? `${pct}%` : '-%'

  return (
    <Box
      component="article"
      sx={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr',
        gap: 3,
        alignItems: 'stretch',
        py: 2,
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: C.lightBlue,
      }}
    >
      <Box
        sx={{
          bgcolor: color,
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 2.5,
          px: 1,
          minHeight: 130,
        }}
      >
        <Typography sx={{ color: C.white, fontWeight: 800, fontSize: F.xxl, lineHeight: 1 }}>
          {pctLabel}
        </Typography>
        <Typography sx={{ color: C.white, fontSize: F.md, mt: 1.5 }}>
          {nivel.rango}
        </Typography>
        {bandas && (
          <Typography sx={{ color: C.whiteAlpha85, fontSize: F.sm, mt: 0.5 }}>
            {count} alumno{count !== 1 ? 's' : ''}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {nivel.col2 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, width: '100%' }}>
            <GruposList grupos={nivel.col1} />
            <GruposList grupos={nivel.col2} />
          </Box>
        ) : (
          <GruposList grupos={nivel.col1} />
        )}
      </Box>
    </Box>
  )
}

interface SemaforoTabProps {
  materia: string
  bandasMap: Record<string, I_SemaforoBandas>
  anio?: string
  onAnioChange?: (anio: string) => void
}

function SemaforoTab({ materia, bandasMap, anio: anioProp, onAnioChange }: SemaforoTabProps) {
  const [internalAnio, setInternalAnio] = useState('3ro')
  const anio = anioProp ?? internalAnio
  const setAnio = (v: string) => {
    if (onAnioChange) onAnioChange(v)
    else setInternalAnio(v)
  }
  const niveles = SEMAFORO_NIVELES[anio]?.[materia] ?? []

  return (
    <Box>
      <Tabs
        value={anio}
        onChange={(_, v) => setAnio(v)}
        sx={{ mb: 2, bgcolor: C.white, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
      >
        {ANIO_ORDER.map(a => (
          <Tab key={a} value={a} label={ANIO_LABELS[a]} />
        ))}
      </Tabs>
      {niveles.length === 0 ? (
        <Typography sx={{ color: C.navy, mt: 2 }}>Sin descriptores para {ANIO_LABELS[anio]} — {materia}</Typography>
      ) : (
        NIVEL_KEYS.map((key, i) => (
          <NivelRow key={key} nivel={niveles[i]} bandas={bandasMap[anio]} nivelKey={key} isLast={i === NIVEL_KEYS.length - 1} />
        ))
      )}
    </Box>
  )
}

export { GruposList, NivelRow, SemaforoTab }
