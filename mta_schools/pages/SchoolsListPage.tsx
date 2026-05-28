'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { SCHOOL_NAME } from '@/mta_schools/constants'
import {
  useNavigateToSchoolCreate,
  useNavigateToSchoolDetail,
  useSchoolBatchDelete,
  useSchoolList,
} from '@/mta_schools/hooks'
import ResourceListPage from '@/shared/resources/ResourceListPage'

const SchoolsListPage = () => {
  const navigateToSchoolDetail = useNavigateToSchoolDetail()
  const navigateToSchoolCreate = useNavigateToSchoolCreate()

  return (
    <ResourceListPage
      resourceKey="school"
      useList={useSchoolList}
      entityName={SCHOOL_NAME}
      onRowClickId={navigateToSchoolDetail}
      onCreate={navigateToSchoolCreate}
      useBatchDelete={useSchoolBatchDelete}
    />
  )
}

export default withAuth(SchoolsListPage, {
  allowedCapabilities: ['manage_schools'],
  logoutDestination: 'dashboard',
})
