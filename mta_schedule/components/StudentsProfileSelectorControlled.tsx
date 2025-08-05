'use client'

import StudentsProfileSelector, { T_AddedStudents } from '@/mta_schedule/components/StudentsProfileSelector'
import { T_SchoolId, T_StudentProfileId } from '@/mta_schools/types'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

interface I_ControlledStudentsProfileSelectorProps<T_FormFields extends FieldValues>
  extends UseControllerProps<T_FormFields> {
  schoolId: T_SchoolId
}

export const ControlledStudentsProfileSelector = <T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  schoolId,
}: I_ControlledStudentsProfileSelectorProps<T_FormFields>) => {
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control })
  const hasError = fieldState.error !== undefined

  // const { addedStudents, setAddedStudents } = StudentsProfileSelector.useAddedStudents(field.value || {})

  const handleChange = (newAddedStudents: T_AddedStudents) => {
    field.onChange(newAddedStudents)
  }
  const handleDelete = (deletedStudentId: T_StudentProfileId) => {
    const newValue = { ...field.value }
    delete newValue[deletedStudentId]
    field.onChange()
  }

  return (
    <div>
      <StudentsProfileSelector
        schoolId={schoolId}
        addedStudents={field.value}
        onAddedStudentsChange={handleChange}
        // onAddedStudentDelete={handleDelete}
        hasError={hasError}
        helperText={fieldState.error?.message}
      />
    </div>
  )
}
