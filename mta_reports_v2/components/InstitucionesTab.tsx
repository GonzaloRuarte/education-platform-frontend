'use client'

import { Box } from '@mui/material'
import { EditableTab } from '@/mta_reports_v2/components/EditableTab'
import { FONT_SIZES } from '@/mta_reports_v2/constants'

interface InstitucionesTabProps {
  schoolId: number
  initialEditing?: boolean
}

const fields = {
  title: { defaultHtml: '<p>Instituciones participantes</p>', variant: 'title' as const },
  bodyLeft: {
    defaultHtml:
      '<p>Ameghino - Buenos Aires</p>' +
      '<p>Amundsen - Buenos Aires</p>' +
      '<p>Betania - CABA</p>' +
      '<p>Biró - Santa Fe</p>' +
      '<p>Buen Ayre - Buenos Aires</p>' +
      '<p>Cartoneros y sus chicos - Buenos Aires</p>' +
      '<p>Chesterton - Buenos Aires</p>' +
      '<p>Colegio Bilingüe de Neuquén - Neuquén</p>' +
      '<p>Dickens - Buenos Aires</p>' +
      '<p>Eben Ezer - Chaco</p>' +
      '<p>Escuela Técnica Roberto Rocca - Buenos Aires</p>' +
      '<p>Euskal Echea - CABA</p>' +
      '<p>Gaudi - Buenos Aires</p>' +
      '<p>Goethe Schule - Buenos Aires</p>' +
      '<p>Godspell - Buenos Aires</p>' +
      '<p>Holy Cross (mujeres) - Buenos Aires</p>' +
      '<p>Holy Cross (varones) - Buenos Aires</p>' +
      '<p>ICEI - Mendoza</p>' +
      '<p>Ikastola - Buenos Aires</p>' +
      '<p>Instituto Humanista Santísima de la Trinidad - Salta</p>' +
      '<p>Instituto Ntra. Sra. del Carmen - Buenos Aires</p>' +
      '<p>Instituto Técnico Superior Renault - Córdoba</p>' +
      '<p>Jacarandá - CABA</p>',
    variant: 'body' as const,
  },
  bodyRight: {
    defaultHtml:
      '<p>Los Molinos - Buenos Aires</p>' +
      '<p>Lucero Norte - Buenos Aires</p>' +
      '<p>María Guadalupe - Buenos Aires</p>' +
      '<p>Marie Curie - Buenos Aires</p>' +
      '<p>MaTer Admirábilis - CABA</p>' +
      '<p>Michael Ham Nordelta - Buenos Aires</p>' +
      '<p>Michael Ham Vicente López - Buenos Aires</p>' +
      '<p>Molisano - Buenos Aires</p>' +
      '<p>Northlands Nordelta - Buenos Aires</p>' +
      '<p>Northlands Olivos - Buenos Aires</p>' +
      '<p>Ntra. Sra. del Huerto - Buenos Aires</p>' +
      '<p>Oakhill CABA - CABA</p>' +
      '<p>Oakhill Pilar - Buenos Aires</p>' +
      '<p>Qmark - Río Negro</p>' +
      '<p>Sagrada Familia - Buenos Aires</p>' +
      '<p>San Ignacio - Córdoba</p>' +
      '<p>San Martin de Tours - CABA</p>' +
      '<p>San Patricio - Río Negro</p>' +
      '<p>Santa Ethnea - Buenos Aires</p>' +
      '<p>Santos Unidos - Buenos Aires</p>' +
      '<p>Stevenson - Santa Fe</p>' +
      '<p>TESLA - Santa Fe</p>' +
      '<p>Tolkien - Buenos Aires</p>',
    variant: 'body' as const,
  },
}

const columnSx = {
  '& .ql-editor p': {
    fontSize: FONT_SIZES.bodyLarge,
    lineHeight: 1.3,
    margin: 0,
  },
}

const InstitucionesTab = ({ schoolId, initialEditing }: InstitucionesTabProps) => (
  <EditableTab
    schoolId={schoolId}
    initialEditing={initialEditing}
    diapositivaId="instituciones"
    successMessage='Sección "Instituciones participantes" actualizada correctamente'
    fields={fields}
  >
    {({ renderField }) => (
      <Box sx={{ width: '100%', mb: 'auto' }}>
        {renderField('title', { mb: 4, width: '100%' })}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 6 }}>
          {renderField('bodyLeft', columnSx)}
          {renderField('bodyRight', columnSx)}
        </Box>
      </Box>
    )}
  </EditableTab>
)

export { InstitucionesTab }
