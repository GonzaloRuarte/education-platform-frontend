'use client'

import SchoolEditForm from '@/mta_schools/components/SchoolEditForm'
import { useSchoolDelete, useSchoolDetail, useNavigateToSchoolList } from '@/mta_schools/hooks'
import EditionPage from '@/shared/pages/EditionPage'

const SchoolEditPage = () => (
  <EditionPage EditionForm={SchoolEditForm} entityName="Escuela" useDelete={useSchoolDelete} useDetail={useSchoolDetail} onExit={useNavigateToSchoolList()} />
)

export default SchoolEditPage
