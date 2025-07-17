'use client'

import { GridColDef } from '@mui/x-data-grid'
import { FC } from 'react'

import ListPage from '@/shared/pages/ListPage'
import Chip from '@/shared/components/Chip'
import Button from '@/shared/components/Button'
import { stripTags } from '@/shared/utils'
import { useQuestionList } from '@/mta_questionbank/hooks'       // you already have the list hook
import { useImportQuestion } from '@/mta_evaluations/hooks'
import { successToast } from '@/shared/toasts'
import { handleServiceError } from '@/shared/service'
import { QUESTION_NAME } from '@/mta_evaluations/constants'
import { T_EvaluationPageId } from '@/mta_evaluations/types'
import { useSubjectLabel } from '@/mta_evaluations/components/SubjectOptions'

interface I_Props {
  evaluationPageId: T_EvaluationPageId          // close the modal
}

const ImportFromBankDialog: FC<I_Props> = ({ evaluationPageId }) => {
  const listHook          = useQuestionList
  const importQuestion    = useImportQuestion(evaluationPageId)()

  const columns: GridColDef[] = [
  {
    field: 'content',
    headerName: 'Pregunta',
    flex: 2,
  renderCell: ({ value }) => <span>{stripTags(value)}</span>
  },

  /*──── subject slug → nice chip ────────────────────────────────*/
  {
    field: 'subject_id',
    headerName: 'Materia',
    flex: 1,
    renderCell: ({ value }) => (
      <Chip variant="outlined" size="small" label={useSubjectLabel(value)} />
    ),
  },

  /*──── difficulty: 1-5 stars or plain number ───────────────────*/
  {
    field: 'difficulty',
    headerName: 'Dificultad',
    flex: 1,
    align: 'center',
    headerAlign: 'center',
    renderCell: ({ value }) => (value),
  },
  {
    field: 'answerType',
    headerName: 'Tipo de respuesta',
    flex: 1,
    align: 'center',
    headerAlign: 'center',
    renderCell: ({ row }) => (
      row.answer.resource_type === 'MultipleChoiceTemplate' ? 'Opción múltiple' :
      row.answer.resource_type === 'NumericTemplate' ? 'Numérica' :
      row.answer.resource_type === 'OpenEndedTemplate' ? 'Texto libre' :
      'Desconocido'
    ),
  },
  {
    field: 'answer',
    headerName: 'Respuesta',
    flex: 1,
    sortable: false,
    renderCell: ({ row }) =>{

      if (row.answer.resource_type === 'MultipleChoiceTemplate') {
        /* Print all of them for which "is_true" is True separated by a ; instead of just printing the first one */
        /* if there are no true options, print "No hay respuesta correcta" */
        const trueOptions = row.answer.options.filter((option) => option.is_true)
        if (trueOptions.length === 0) { 
          return 'No hay respuesta correcta'
        }
        return trueOptions.map((option) => stripTags(option.content)).join('; ')


      }

      /* Numeric template — just show the value */
      if (row.answer.resource_type === 'NumericTemplate') {
        return row.answer.value
      }
      


      if (row.answer.resource_type === 'OpenEndedTemplate') {
        return 'Pregunta de texto libre'
      }
      return 'Desconocido'  // Fallback for unknown types
    }
        
    },
    {
      field: 'actions',
      headerName: '',
      width: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <Button
          size="small"
          onClick={() =>
            importQuestion({ template_id: row.id })
              .then(() => {
                successToast('Pregunta importada')
              })
              .catch(handleServiceError)
          }
        >
          Importar
        </Button>
      ),
    },
  ]

  return (
    <ListPage
      columns={columns}
      useList={listHook}
      entityName={QUESTION_NAME}
    />
  )
}

export default ImportFromBankDialog
