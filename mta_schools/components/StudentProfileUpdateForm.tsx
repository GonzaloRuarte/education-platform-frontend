'use client'

import StudentProfileFormFields, { I_FormFields } from '@/mta_schools/components/StudentProfileFormFields'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import { useNavigateToStudentProfileList, useStudentProfileUpdate } from '@/mta_schools/hooks'
import { I_SchoolName, I_StudentProfileDetail, T_SchoolNames } from '@/mta_schools/types'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'

const normalizePersonalId = (value: string | '' | null) => String(value ?? '').trim().toUpperCase()
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { sentence } from '@/shared/utils'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_Props {
  studentProfileData: I_StudentProfileDetail
  selectedSchool: I_SchoolName | null
  availableSchools: T_SchoolNames
  lockSchool: boolean
}

const StudentProfileUpdateForm = ({ studentProfileData, selectedSchool, availableSchools, lockSchool }: I_Props) => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      cohort: studentProfileData.cohort,
      personal_id: studentProfileData.personal_id,
      school_id: studentProfileData.school_id ?? selectedSchool?.id,
    },
  })

  const { setInProgressStatus } = useInProgress()
  const navigateToSchoolList = useNavigateToStudentProfileList()
  const studentProfileUpdate = useStudentProfileUpdate()

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    studentProfileUpdate(studentProfileData.id, { ...data, personal_id: normalizePersonalId(data.personal_id) })
      .then(() => {
        successToast(sentence(`${STUDENT_PROFILE_NAME.singular} actualizado correctamente`))
        navigateToSchoolList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StudentProfileFormFields control={control} schoolOptions={availableSchools} lockSchool={lockSchool} />
      <Spacer />
      <Submit>Actualizar</Submit>
    </form>
  )
}

export default StudentProfileUpdateForm
