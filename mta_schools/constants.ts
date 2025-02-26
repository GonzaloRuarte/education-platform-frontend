import type { T_CohortLevelCode } from '@/mta_schools/types'

const PRIMARIA = 'Primaria'
const SECUNDARIA = 'Secundaria'

const cohortLevelCodeToLabel = (code: T_CohortLevelCode): string =>
  ({
    P: PRIMARIA,
    S: SECUNDARIA,
  })[code]

export { cohortLevelCodeToLabel, PRIMARIA, SECUNDARIA }
