'use client'

import { useNavigateToStudentProfileList, useStudentProfileCreate } from '@/mta_schools/hooks'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import { I_SchoolName, T_SchoolId } from '@/mta_schools/types'
import { useForm, SubmitHandler } from 'react-hook-form'
import { successToast } from '@/shared/toasts'
import { handleServiceError } from '@/shared/service'
import { useInProgress } from '@/shared/hooks'
import { sentence } from '@/shared/utils'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import StudentProfileFormFields, { I_FormFields } from '@/mta_schools/components/StudentProfileFormFields'

interface I_Props {
  ownSchoolData: I_SchoolName | null
}

const StudentProfileCreateForm = ({ ownSchoolData }: I_Props) => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      cohort: '',
      personal_id: '',
      school_id: ownSchoolData !== null ? ownSchoolData.id : undefined,
    },
  })

  const { setInProgressStatus } = useInProgress()
  const navigateToSchoolList = useNavigateToStudentProfileList()
  const studentProfileCreate = useStudentProfileCreate()

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    studentProfileCreate({ ...data, personal_id: Number(data.personal_id) })
      .then(() => {
        successToast(sentence(`${STUDENT_PROFILE_NAME.singular} agregado correctamente`))
        navigateToSchoolList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StudentProfileFormFields control={control} ownSchoolData={ownSchoolData !== null} />
      <Spacer />
      <Submit>Agregar</Submit>
    </form>
  )
}

export default StudentProfileCreateForm
