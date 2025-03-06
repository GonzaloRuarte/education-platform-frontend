'use client'

import SchoolCreateForm from '@/mta_schools/components/SchoolCreateForm'
import { useNavigateToSchoolList } from '@/mta_schools/hooks'
import CreationPage from '@/shared/components/CreationPage'

const SchoolCreatePage = () => {
  const navigateToSchoolList = useNavigateToSchoolList()

  return <CreationPage CreationForm={SchoolCreateForm} entityName="Escuela" onCancel={navigateToSchoolList} />
}

export default SchoolCreatePage
