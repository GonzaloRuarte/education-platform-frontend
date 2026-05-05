'use client'

import { EditableTab } from '@/mta_reports_v2/components/EditableTab'

interface InstitucionesTabProps {
  schoolId: number
  initialEditing?: boolean
}

const fields = {
  title: { defaultHtml: '<p>Instituciones participantes</p>', variant: 'title' as const },
  body: {
    defaultHtml:
      '<ul>' +
      '<li>Ameghino - Buenos Aires</li>' +
      '<li>Amundsen - Buenos Aires</li>' +
      '<li>Betania - CABA</li>' +
      '<li>Biró - Santa Fe</li>' +
      '<li>Buen Ayre - Buenos Aires</li>' +
      '<li>Cartoneros y sus chicos - Buenos Aires</li>' +
      '<li>Chesterton - Buenos Aires</li>' +
      '<li>Colegio Bilingüe de Neuquén - Neuquén</li>' +
      '<li>Dickens - Buenos Aires</li>' +
      '<li>Eben Ezer - Chaco</li>' +
      '<li>Escuela Técnica Roberto Rocca - Buenos Aires</li>' +
      '<li>Euskal Echea - CABA</li>' +
      '<li>Gaudi - Buenos Aires</li>' +
      '<li>Goethe Schule - Buenos Aires</li>' +
      '<li>Godspell - Buenos Aires</li>' +
      '<li>Holy Cross (mujeres) - Buenos Aires</li>' +
      '<li>Holy Cross (varones) - Buenos Aires</li>' +
      '<li>ICEI - Mendoza</li>' +
      '<li>Ikastola - Buenos Aires</li>' +
      '<li>Instituto Humanista Santísima de la Trinidad - Salta</li>' +
      '<li>Instituto Ntra. Sra. del Carmen - Buenos Aires</li>' +
      '<li>Instituto Técnico Superior Renault - Córdoba</li>' +
      '<li>Jacarandá - CABA</li>' +
      '<li>Los Molinos - Buenos Aires</li>' +
      '<li>Lucero Norte - Buenos Aires</li>' +
      '<li>María Guadalupe - Buenos Aires</li>' +
      '<li>Marie Curie - Buenos Aires</li>' +
      '<li>MaTer Admirábilis - CABA</li>' +
      '<li>Michael Ham Nordelta - Buenos Aires</li>' +
      '<li>Michael Ham Vicente López - Buenos Aires</li>' +
      '<li>Molisano - Buenos Aires</li>' +
      '<li>Northlands Nordelta - Buenos Aires</li>' +
      '<li>Northlands Olivos - Buenos Aires</li>' +
      '<li>Ntra. Sra. del Huerto - Buenos Aires</li>' +
      '<li>Oakhill CABA - CABA</li>' +
      '<li>Oakhill Pilar - Buenos Aires</li>' +
      '<li>Qmark - Río Negro</li>' +
      '<li>Sagrada Familia - Buenos Aires</li>' +
      '<li>San Ignacio - Córdoba</li>' +
      '<li>San Martin de Tours - CABA</li>' +
      '<li>San Patricio - Río Negro</li>' +
      '<li>Santa Ethnea - Buenos Aires</li>' +
      '<li>Santos Unidos - Buenos Aires</li>' +
      '<li>Stevenson - Santa Fe</li>' +
      '<li>TESLA - Santa Fe</li>' +
      '<li>Tolkien - Buenos Aires</li>' +
      '</ul>',
    variant: 'body' as const,
  },
}

const InstitucionesTab = ({ schoolId, initialEditing }: InstitucionesTabProps) => (
  <EditableTab
    schoolId={schoolId}
    initialEditing={initialEditing}
    diapositivaId="instituciones"
    successMessage='Sección "Instituciones participantes" actualizada correctamente'
    fields={fields}
  />
)

export { InstitucionesTab }
