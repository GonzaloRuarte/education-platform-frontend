'use client'

import StudentProfileFormFields, { I_FormFields } from '@/mta_schools/components/StudentProfileFormFields'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import { useNavigateToStudentProfileList, useStudentProfileUpdate } from '@/mta_schools/hooks'
import { useSchoolOwnSchool } from '@/mta_schools/hooks/state'
import { I_SchoolName, I_StudentProfileDetail } from '@/mta_schools/types'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import Submit from '@/shared/components/Submit'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { sentence } from '@/shared/utils'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_Props {
  studentProfileData: I_StudentProfileDetail
  ownSchoolData: I_SchoolName | null
}

const StudentProfileUpdateForm = ({ studentProfileData, ownSchoolData }: I_Props) => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      cohort: studentProfileData.cohort,
      personal_id: studentProfileData.personal_id,
      school_id: studentProfileData.school_id,
    },
  })

  const { setInProgressStatus } = useInProgress()
  const navigateToSchoolList = useNavigateToStudentProfileList()
  const studentProfileUpdate = useStudentProfileUpdate()

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    studentProfileUpdate(studentProfileData.id, { ...data, personal_id: Number(data.personal_id) })
      .then(() => {
        successToast(sentence(`${STUDENT_PROFILE_NAME.singular} actualizado correctamente`))
        navigateToSchoolList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }
  if (ownSchoolData === undefined) return <Spinner />
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StudentProfileFormFields control={control} ownSchoolData={ownSchoolData !== null} />
      <Spacer />
      <Submit>Actualizar</Submit>
    </form>
  )
}

export default StudentProfileUpdateForm
