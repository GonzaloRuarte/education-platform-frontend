'use client'

import { useNavigateToStudentProfileList, useStudentProfileCreate } from '@/mta_schools/hooks'
import StudentProfileFormFields, { I_FormFields } from '@/mta_schools/components/StudentProfileFormFields'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import { I_SchoolName, T_SchoolNames } from '@/mta_schools/types'
import { useForm, SubmitHandler } from 'react-hook-form'
import { successToast } from '@/shared/toasts'
import { handleServiceError } from '@/shared/service'
import { useInProgress } from '@/shared/hooks'
import { sentence } from '@/shared/utils'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'

const normalizePersonalId = (value: number | string | '' | null) => Number(String(value ?? '').replace(/\D/g, ''))

interface I_Props {
  selectedSchool: I_SchoolName | null
  availableSchools: T_SchoolNames
  lockSchool: boolean
}

const StudentProfileCreateForm = ({ selectedSchool, availableSchools, lockSchool }: I_Props) => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      cohort: '',
      personal_id: '',
      school_id: selectedSchool !== null ? selectedSchool.id : undefined,
    },
  })

  const { setInProgressStatus } = useInProgress()
  const navigateToSchoolList = useNavigateToStudentProfileList()
  const studentProfileCreate = useStudentProfileCreate()

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    studentProfileCreate({ ...data, personal_id: normalizePersonalId(data.personal_id) })
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
      <StudentProfileFormFields control={control} schoolOptions={availableSchools} lockSchool={lockSchool} />
      <Spacer />
      <Submit>Agregar</Submit>
    </form>
  )
}

export default StudentProfileCreateForm
