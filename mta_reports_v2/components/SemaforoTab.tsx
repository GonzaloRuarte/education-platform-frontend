'use client'

import { Box, Tabs, Tab, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { COLORS, ANIO_ORDER, FONT_SIZES, FONT_WEIGHTS, RADIUS, Z_INDEX, SEMAFORO } from '@/mta_reports_v2/constants'
import { SEMAFORO_NIVELES, NIVEL_COLORS, NIVEL_KEYS, ANIO_LABELS } from '@/mta_reports_v2/semaforo_data'
import type { SemaforoNivel } from '@/mta_reports_v2/semaforo_data'
import type { I_SemaforoBandas } from '@/mta_reports_v2/types'
import type { SemaforoEstudianteBand } from './calc/SemaforoTab'

const C = COLORS
const F = FONT_SIZES
const W = FONT_WEIGHTS

function GruposList({ grupos }: { grupos: SemaforoNivel['col1'] }) {
  return (
    <Box>
      {grupos.map((g, gi) => (
        <Box key={gi} sx={{ mb: g.titulo ? 1 : 0 }}>
          {g.titulo && (
            <Typography sx={{ color: C.semaforoText, fontWeight: W.bold, fontSize: F.md, mb: 0.25 }}>
              {g.titulo}
            </Typography>
          )}
          {g.items.map((item, ii) => (
            <Typography key={ii} sx={{ color: C.semaforoText, fontSize: F.md, fontWeight: W.medium, lineHeight: 1.1 }}>
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
        gridTemplateColumns: `${SEMAFORO.colorColWidth}px 1fr`,
        gap: SEMAFORO.rowGap,
        alignItems: 'start',
        py: 1.25,
        minHeight: 180,
        position: 'relative',
        '&::after': isLast ? undefined : {
          content: '""',
          position: 'absolute',
          left: 0,
          right: 48,
          bottom: 0,
          height: '1px',
          bgcolor: C.semaforoText,
        },
      }}
    >
      <Box
        sx={{
          bgcolor: color,
          borderRadius: RADIUS.sm,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 2,
          px: 1,
          height: 140,
        }}
      >
        <Typography sx={{ color: C.black, fontWeight: 500, fontSize: 48, lineHeight: 1, letterSpacing: '-0.5px' }}>
          {pctLabel}
        </Typography>
        <Typography sx={{ color: C.black, fontSize: F.lg, fontWeight: W.semibold, mt: 1.5 }}>
          {nivel.rango}
        </Typography>
        {bandas && (
          <Typography sx={{ color: C.black, fontSize: F.md, mt: 0.5 }}>
            {count} alumno{count !== 1 ? 's' : ''}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        {nivel.col2 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, width: '100%' }}>
            <GruposList grupos={nivel.col1} />
            <Box sx={{ pl: 4 }}>
              <GruposList grupos={nivel.col2} />
            </Box>
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
  estudiantesMap?: Record<string, SemaforoEstudianteBand[]>
  anio?: string
  onAnioChange?: (anio: string) => void
  selectedStudentId?: string
}

function SemaforoTab({ materia, bandasMap, estudiantesMap, anio: anioProp, onAnioChange, selectedStudentId = 'all' }: SemaforoTabProps) {
  const [internalAnio, setInternalAnio] = useState('3ro')
  const anio = anioProp ?? internalAnio
  const setAnio = (v: string) => {
    if (onAnioChange) onAnioChange(v)
    else setInternalAnio(v)
  }
  const niveles = SEMAFORO_NIVELES[anio]?.[materia] ?? []

  const effectiveBandasMap = useMemo(() => {
    if (selectedStudentId === 'all' || !estudiantesMap) return bandasMap
    const out: Record<string, I_SemaforoBandas> = {}
    for (const a of Object.keys(bandasMap)) {
      const stud = (estudiantesMap[a] ?? []).find(s => s.id === selectedStudentId)
      const empty: I_SemaforoBandas = { verde: 0, amarillo: 0, naranja: 0, rojo: 0, total: 0 }
      out[a] = stud ? { ...empty, [stud.band]: 1, total: 1 } : empty
    }
    return out
  }, [selectedStudentId, bandasMap, estudiantesMap])

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
      <Tabs
        value={anio}
        onChange={(_, v) => setAnio(v)}
        sx={{ mb: 0.5, bgcolor: C.white, borderRadius: RADIUS.md, border: '1px solid', borderColor: 'divider', position: 'sticky', top: 0, zIndex: Z_INDEX.sticky }}
      >
        {ANIO_ORDER.map(a => (
          <Tab key={a} value={a} label={ANIO_LABELS[a]} />
        ))}
      </Tabs>
      {niveles.length === 0 ? (
        <Typography sx={{ color: C.navy, mt: 2 }}>Sin descriptores para {ANIO_LABELS[anio]} - {materia}</Typography>
      ) : (
        NIVEL_KEYS.map((key, i) => (
          <NivelRow key={key} nivel={niveles[i]} bandas={effectiveBandasMap[anio]} nivelKey={key} isLast={i === NIVEL_KEYS.length - 1} />
        ))
      )}
    </Box>
  )
}

export { GruposList, NivelRow, SemaforoTab }
