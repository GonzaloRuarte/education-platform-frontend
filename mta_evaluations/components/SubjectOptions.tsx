import { useEvaluationSubjects } from '@/mta_evaluations/hooks'
import { evaluationLabels } from '@/mta_evaluations/labels'
import Spinner from '@/shared/components/Spinner'
import Chip from '@/shared/components/Chip'
import { rules } from '@/shared/forms/messages'
import RadioGroupControlled from '@/shared/forms/RadioGroupControlled'
import { Control, FieldValues, Path } from 'react-hook-form'
import { useStore } from '@/shared/state'

interface I_Props<T_FormFields extends FieldValues> {
  control: Control<T_FormFields> | undefined
  name: Path<T_FormFields>
}

export const useSubjectLabel = (id?: string | null) =>
  useStore((s) => (id ? s.evaluations_subjectLabels[id] ?? id : ''))

export const SubjectChip = ({ id }: { id?: string | null }) => {
  const label = useSubjectLabel(id)
  return <Chip variant="outlined" size="small" label={label} />
}

function SubjectOptions<T_FormFields extends FieldValues>({ control, name }: I_Props<T_FormFields>) {
  const subjects = useEvaluationSubjects()

  if (subjects === undefined) return <Spinner />

  return (
    <RadioGroupControlled
      label={evaluationLabels.subject}
      row
      options={subjects.map((s) => ({ label: s.name, value: s.id }))}
      rules={{ ...rules.required() }}
      {...{ name, control }}
    />
  )
}

export default SubjectOptions
