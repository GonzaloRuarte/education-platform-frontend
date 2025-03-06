import { useEvaluationSubjects } from '@/mta_evaluations/hooks'
import { evaluationLabels } from '@/mta_evaluations/labels'
import Spinner from '@/shared/components/Spinner'
import { rules } from '@/shared/forms/messages'
import RadioGroup from '@/shared/forms/RadioGroup'
import { Control, FieldValues, Path } from 'react-hook-form'

interface I_Props<T_FormFields extends FieldValues> {
  control: Control<T_FormFields> | undefined
  name: Path<T_FormFields>
}

function SubjectOptions<T_FormFields extends FieldValues>({ control, name }: I_Props<T_FormFields>) {
  const subjects = useEvaluationSubjects()

  if (subjects === undefined) return <Spinner />

  return (
    <RadioGroup
      label={evaluationLabels.subject}
      row
      options={subjects.map((s) => ({ label: s.name, value: s.id }))}
      rules={{ ...rules.required() }}
      {...{ name, control }}
    />
  )
}

export default SubjectOptions
