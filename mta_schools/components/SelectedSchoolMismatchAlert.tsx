'use client'

import { useUserProfilesResources } from '@/mta_auth/hooks'
import { useSchoolScopeResources, useSchoolSetSelectedSchool } from '@/mta_schools/hooks/state'
import Button from '@/shared/components/Button'
import { Alert } from '@mui/material'

type I_Props = {
  entitySchool?: { id: number; name: string } | null
  entityLabel?: string
}

const SelectedSchoolMismatchAlert = ({ entitySchool, entityLabel = 'registro' }: I_Props) => {
  const { accessibleSchools, selectedSchool, isLoading } = useSchoolScopeResources()
  const { isSuperuser } = useUserProfilesResources()
  const setSelectedSchool = useSchoolSetSelectedSchool()

  if (isSuperuser) return null
  if (isLoading || selectedSchool === undefined || !entitySchool || selectedSchool === null) return null
  if (selectedSchool.id === entitySchool.id) return null

  const accessibleMatch = accessibleSchools?.find((school) => school.id === entitySchool.id) ?? null

  return (
    <Alert
      severity="info"
      sx={{ mb: 2 }}
      action={
        accessibleMatch ? (
          <Button size="small" onClick={() => setSelectedSchool(accessibleMatch)}>
            Cambiar a {entitySchool.name}
          </Button>
        ) : undefined
      }
    >
      La escuela seleccionada es <strong>{selectedSchool.name}</strong>, pero este {entityLabel} pertenece a{' '}
      <strong>{entitySchool.name}</strong>.
    </Alert>
  )
}

export default SelectedSchoolMismatchAlert