'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import SchoolEditForm from '@/mta_schools/components/SchoolEditForm'
import { SCHOOL_NAME } from '@/mta_schools/constants'
import { useSchoolDelete, useSchoolDetail, useNavigateToSchoolList } from '@/mta_schools/hooks'
import EditionPage from '@/shared/pages/EditionPage'

const SchoolEditPage = () => (
  <EditionPage
    EditionForm={SchoolEditForm}
    entityName={SCHOOL_NAME}
    useDelete={useSchoolDelete}
    useDetail={useSchoolDetail}
    onExit={useNavigateToSchoolList()}
  />
)

export default withAuth(SchoolEditPage, {
  allowedCapabilities: ['manage_schools'],
  logoutDestination: 'dashboard',
})
