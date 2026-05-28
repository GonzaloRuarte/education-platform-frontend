'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import {
  useNavigateToStudentProfileBatchCreate,
  useNavigateToStudentProfileCreate,
  useNavigateToStudentProfileDetail,
  useStudentProfileList,
} from '@/mta_schools/hooks'
import { useSchoolScopeResources } from '@/mta_schools/hooks/state'
import { useHasCapabilities } from '@/mta_auth/hooks'
import Button from '@/shared/components/Button'
import Spinner from '@/shared/components/Spinner'
import ResourceListPage from '@/shared/resources/ResourceListPage'

const StudentProfileListPage = () => {
  const navigateToDetail = useNavigateToStudentProfileDetail()
  const navigateToCreate = useNavigateToStudentProfileCreate()
  const navigateToBatchCreate = useNavigateToStudentProfileBatchCreate()
  const canManageSchools = useHasCapabilities(['manage_schools'])
  const { isLoading, selectedSchool } = useSchoolScopeResources()

  if (isLoading || selectedSchool === undefined) return <Spinner />

  const filtersData = !canManageSchools && selectedSchool !== null ? { school: selectedSchool.id } : undefined

  return (
    <ResourceListPage
      resourceKey="student_profile"
      useList={useStudentProfileList}
      entityName={STUDENT_PROFILE_NAME}
      onCreate={navigateToCreate}
      onRowClickId={navigateToDetail}
      filtersData={filtersData}
      customButtons={<Button onClick={navigateToBatchCreate}>Carga masiva</Button>}
    />
  )
}

export default withAuth(StudentProfileListPage, {
  allowedCapabilities: ['manage_students'],
  logoutDestination: 'dashboard',
})
