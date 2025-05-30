'use client'

import { FC } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { withAuth } from '@/mta_auth/hocs/withAuth'

import MultipleChoiceCreateForm from '@/mta_questionbank/components/MultipleChoiceCreateForm'
import NumericCreateForm        from '@/mta_questionbank/components/NumericCreateForm'

import {
  MULTIPLE_CHOICE_NAME,
  NUMERIC_NAME,
  urlPathsToAnswerTypes,
  answerTypesToUrlPaths,
} from '@/mta_questionbank/constants'

import { T_AnswerType } from '@/mta_questionbank/types'
import CreationPage               from '@/shared/pages/CreationPage'
import { useNavigateToQuestionBankList } from '@/mta_questionbank/hooks'
import  Button                 from '@/shared/components/Button'
import { Stack, Typography }      from '@mui/material'

/* ------------------------------------------------------------------ */
/*  Creation stubs (unchanged)                                        */
/* ------------------------------------------------------------------ */
const MultipleChoiceCreatePage: FC = () => {
  const back = useNavigateToQuestionBankList()
  return (
    <CreationPage
      CreationForm={MultipleChoiceCreateForm}
      entityName={MULTIPLE_CHOICE_NAME}
      onCancel={back}
    />
  )
}

const NumericCreatePage: FC = () => {
  const back = useNavigateToQuestionBankList()
  return (
    <CreationPage
      CreationForm={NumericCreateForm}
      entityName={NUMERIC_NAME}
      onCancel={back}
    />
  )
}

const pagesByType: Record<T_AnswerType, FC> = {
  MultipleChoiceTemplate: MultipleChoiceCreatePage,
  NumericTemplate:        NumericCreatePage,
}

/* ------------------------------------------------------------------ */
/*  Type–selector component                                           */
/* ------------------------------------------------------------------ */
const TypeSelector: FC = () => {
  const router = useRouter()

  return (
    <Stack spacing={3} alignItems="start">
      <Typography variant="h5">¿Qué tipo de pregunta desea crear?</Typography>

      <Button
        variant="contained"
        onClick={() =>
          router.push(
            `?tipo=${answerTypesToUrlPaths.MultipleChoiceTemplate}`,
            { scroll: false }
          )
        }
      >
        Opción múltiple
      </Button>

      <Button
        variant="contained"
        onClick={() =>
          router.push(`?tipo=${answerTypesToUrlPaths.NumericTemplate}`, { scroll: false })
        }
      >
        Numérica
      </Button>
      <Typography variant="body2" color="text.secondary">
        Seleccione el tipo de pregunta que desea crear. Luego podrá completar los
        detalles específicos del tipo elegido.
      </Typography>


      <Button
        variant="outlined"
        onClick={() => router.push('/dashboard/banco-de-preguntas')}
      >
        Volver al banco de preguntas
      </Button>
    </Stack>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
const TemplateCreatePage = () => {
  const searchParams = useSearchParams()
  const tipo = searchParams.get('tipo')

  /* step 1: no param → show selector */
  if (!tipo) {
    return <TypeSelector />
  }

  /* step 2: invalid param → error */
  if (!(tipo in urlPathsToAnswerTypes)) {
    return <>El tipo de pregunta indicado no existe.</>
  }

  /* step 3: valid param → render form */
  const answerType  = urlPathsToAnswerTypes[tipo]
  const PageContent = pagesByType[answerType]

  return <PageContent />
}

export default withAuth(TemplateCreatePage, {
  allowedUserProfiles: ['admin', 'evaluator'],
  logoutDestination: 'dashboard',
})
