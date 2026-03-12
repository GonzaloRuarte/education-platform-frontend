'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'


import ListPage from '@/shared/pages/ListPage'
                                  // your route map
import { QUESTION_NAME } from '@/mta_questionbank/constants'
import { useQuestionList, useQuestionBatchDelete, useNavigateToQuestionEdit, useNavigateToQuestionCreate } from '@/mta_questionbank/hooks'

import { GridColDef } from '@mui/x-data-grid'
import { idExposeColumn } from '@/shared/pages/utils'
import Chip from '@/shared/components/Chip'
import { stripTags } from '@/shared/utils'

export const columns: Array<GridColDef> = [
  /*──── main text ────────────────────────────────────────────────*/
  idExposeColumn({
    field: 'content',
    headerName: 'Pregunta',
    flex: 2,
  renderCell: ({ value }) => <span>{stripTags(value)}</span>
  }),

  /*──── subject slug → nice chip ────────────────────────────────*/
  {
    field: 'subject_id',
    headerName: 'Materia',
    flex: 1,
    renderCell: ({ value }) => (
      <Chip variant="outlined" size="small" label={value} />
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
  {field: 'tags',
    headerName: 'Etiquetas',
    flex: 1,
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
        return 'Pregunta con texto libre'
      }
      return 'Tipo de respuesta desconocido'
    },
  },

]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
const TemplateListPage = () => {
  const navigateCreate = useNavigateToQuestionCreate()
  const navigateEdit   = useNavigateToQuestionEdit()

  return (
    <ListPage
      columns={columns}
      useList={useQuestionList}
      entityName={QUESTION_NAME}          /* “pregunta(s)” */
      useBatchDelete={useQuestionBatchDelete}
      onCreate={navigateCreate}
      onRowClick={(params) => navigateEdit({questionId:params.id})}
    />
  )
}

export default withAuth(TemplateListPage, {
  allowedCapabilities: ['manage_evaluation_content'],
  logoutDestination: 'dashboard',
})