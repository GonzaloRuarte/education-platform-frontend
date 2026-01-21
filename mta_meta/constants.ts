import { EntityName } from '@/shared/utils'

const META_REPORT_BUNDLE_NAME: EntityName = {
  singular: 'Reporte META',
  plural: 'Reportes META',
  gs: ({ m, f }: { m: string; f: string }) => m, // default masculine for Spanish UI strings
}

export { META_REPORT_BUNDLE_NAME }
