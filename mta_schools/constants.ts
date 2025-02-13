import { T_CohortLevel } from '@/mta_schools/types'

const PRIMARIA = "Primaria"
const SECUNDARIA = "Secundaria"

const cohortLevelCodeToLabel = (code: T_CohortLevel): string => (
  {
    P: PRIMARIA,
    S: SECUNDARIA,
  }[code]
)

export {
  cohortLevelCodeToLabel,
  PRIMARIA,
  SECUNDARIA,
}