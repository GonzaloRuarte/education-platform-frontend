'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import SchoolRelatedStaff from '@/mta_schools/components/SchoolRelatedStaff'
import { SCHOOL_NAME } from '@/mta_schools/constants'
import { useSchoolDelete, useSchoolDetail, useSchoolUpdate, useNavigateToSchoolList } from '@/mta_schools/hooks'
import ResourceEditionPage from '@/shared/resources/ResourceEditionPage'

const SchoolEditPage = () => (
  <ResourceEditionPage
    resourceKey="school"
    entityName={SCHOOL_NAME}
    useDelete={useSchoolDelete}
    useDetail={useSchoolDetail}
    useUpdate={useSchoolUpdate}
    onExit={useNavigateToSchoolList()}
    renderAfterForm={({ id }) => <SchoolRelatedStaff schoolId={Number(id)} />}
  />
)

export default withAuth(SchoolEditPage, {
  allowedCapabilities: ['manage_schools'],
  logoutDestination: 'dashboard',
})
