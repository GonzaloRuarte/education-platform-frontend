'use client'

import {
  EvaluationStatus,
  I_EvaluationPageDetail,
  T_EvaluationStatusCode,
} from '@/mta_evaluations/types'
import {
  useEvaluationPageDelete,
  useEvaluationPageUpdate,   // ← NEW
} from '@/mta_evaluations/hooks'
import QuestionCreateDialog from '@/mta_evaluations/components/QuestionCreateDialog'
import ImportFromBankDialog from '@/mta_evaluations/components/ImportFromBankDialog'
import CreatedQuestions from '@/mta_evaluations/components/CreatedQuestions'
import { evaluationPageLabels } from '@/mta_evaluations/labels'
import { EVALUATION_PAGE_NAME } from '@/mta_evaluations/constants'

import { useConfirm } from '@/shared/confirm'
import { useHandleDelete } from '@/shared/hooks'
import { useDialog } from '@/shared/dialogs'
import { sharedLabels } from '@/shared/labels'
import { T_VoidFn } from '@/shared/types'
import {stripTags, truncateString} from '@/shared/utils'

import Pastilla from '@/shared/components/Pastilla'
import MagicGrid from '@/shared/components/MagicGrid'
import Button from '@/shared/components/Button'
import { DeleteButton } from '@/shared/components/buttons'
import Spacer from '@/shared/components/Spacer'
import { H4} from '@/shared/components/Typography'

import Grid from '@mui/material/Grid'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import QuizIcon from '@mui/icons-material/Quiz'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import EditIcon from '@mui/icons-material/Edit'
import { useForm, SubmitHandler } from 'react-hook-form'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import { rules } from '@/shared/forms/messages'

/*─────────────────────────────────────────────────────────
  Small form shown in a dialog to edit pinned_text
──────────────────────────────────────────────────────────*/
interface IPinnedTextFormProps {
  pageId: number
  initial: string
  onSuccess: () => void
  onCancel: () => void
}

const PinnedTextForm = ({
  pageId,
  initial,
  onSuccess,
  onCancel,
}: IPinnedTextFormProps) => {
  const { handleSubmit, control } = useForm<{ pinned_text: string }>({
    defaultValues: { pinned_text: initial },
  })
  const updatePage = useEvaluationPageUpdate()

  const submit: SubmitHandler<{ pinned_text: string }> = (data) => {
    updatePage(pageId, { pinned_text: data.pinned_text || '' })
      .then(onSuccess)
      .catch(console.error)             // keep your own error util if you have one
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      {/* You already use this editor for questions */}
      <WysiwygEditorControlled
        {...{ control }}
        name="pinned_text"
        label="Texto fijo"
        rules={{ ...rules.required() }}
      />

      <Spacer />

      <MagicGrid itemSize="auto">
        <Button type="submit">{sharedLabels.edit}</Button>
        <Button variant="text" onClick={onCancel}>
          {sharedLabels.cancel}
        </Button>
      </MagicGrid>
    </form>
  )
}

/*─────────────────────────────────────────────────────────
  MAIN TOOLBAR COMPONENT
──────────────────────────────────────────────────────────*/
interface Props {
  status: T_EvaluationStatusCode
  data: I_EvaluationPageDetail
  reload: T_VoidFn
}

const QuestionCreationToolbar = ({ status, data, reload }: Props) => {
  /* 1️⃣ create-question dialog */
  const {
    open: openCreateDialog,
    DialogComponent: CreateDialog,
    componentProps: createDialogProps,
  } = QuestionCreateDialog()

  /* 2️⃣ import-from-bank dialog */
  const {
    DialogComponent: ImportDialog,
    componentProps: importDialogProps,
    showDialog: showImportDialog,
    closeDialog: closeImportDialog,
  } = useDialog()

  /* 3️⃣ pinned-text edit dialog */
  const {
    DialogComponent: PinnedDialog,
    componentProps: pinnedDialogProps,
    showDialog: showPinnedDialog,
    closeDialog: closePinnedDialog,
  } = useDialog()

  /* confirm-delete dialog */
  const { ConfirmDialogComponent, showConfirm } = useConfirm()

  /*──────────────────────────────────────────────────────*/
  /* handlers */
  const handleCreateQuestion = () => openCreateDialog(data.id, reload)

  const handleDeletePage = useHandleDelete(data.id, {
    showConfirm,
    deleteInstance: useEvaluationPageDelete(),
    callback: reload,
    entityName: EVALUATION_PAGE_NAME,
  })

  const handleImportFromBank = () => {
    const closeAndReload = () => {
      closeImportDialog()
      reload()
    }

    showImportDialog({
      title: 'Importar desde Banco de Preguntas',
      content: <ImportFromBankDialog evaluationPageId={data.id} />,
      actions: [
        {
          key: 'close',
          buttonLabel: sharedLabels.close,
          onPress: closeAndReload,
        },
      ],
      dialogProps: { fullWidth: true, maxWidth: 'xl', onClose: closeAndReload },
    })
  }

  /* edit pinned text */
  const handleEditPinnedText = () => {
    const onSuccess = () => {
      closePinnedDialog()
      reload()
    }

    showPinnedDialog({
      title: 'Editar texto fijo',
      content: (
        <PinnedTextForm
          pageId={data.id}
          initial={data.pinned_text ?? ''}
          onSuccess={onSuccess}
          onCancel={closePinnedDialog}
        />
      ),
      actions: [],
    })
  }

  /*──────────────────────────────────────────────────────*/
  /* rendering helpers */
  const plainPinned = truncateString(stripTags(data.pinned_text ?? ''), 40)

  /*──────────────────────────────────────────────────────*/
  return (
    <>
      <Pastilla>
        {/* pinned text subtitle */}
        <Grid container justifyContent="center" alignItems="center">
          <MagicGrid itemSize="auto">
            <H4 component="div">
              Texto fijo:&nbsp;
              {plainPinned || <em>(sin texto)</em>}
            </H4>
          </MagicGrid>
        </Grid>
        <Spacer />

        {/* pinned text edit button */}
        <Grid container justifyContent="center" alignItems="center">
          <MagicGrid itemSize="auto">
            <Button
              disabled={status === EvaluationStatus.Published}
              onClick={handleEditPinnedText}
              startIcon={<EditIcon fontSize="small" />}
            >
              Editar
            </Button>
          <DeleteButton
              disabled={status === EvaluationStatus.Published}
              color="error"
              onClick={handleDeletePage}
            />

          </MagicGrid>


        </Grid>
        <Spacer />
        {/* create / import / delete buttons */}
        <Grid container justifyContent="center" alignItems="center">
          <MagicGrid itemSize="auto">
            <Button
              disabled={status === EvaluationStatus.Published}
              onClick={handleCreateQuestion}
              startIcon={<QuizIcon />}
            >
              {evaluationPageLabels.newQuestion}
            </Button>

            <Button
              disabled={status === EvaluationStatus.Published}
              onClick={handleImportFromBank}
              startIcon={<LibraryAddIcon />}
            >
              Importar Pregunta
            </Button>


          </MagicGrid>
        </Grid>

        <Spacer />

        {/* questions list inside accordion */}
        <Accordion defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <H4>{evaluationPageLabels.createdQuestions}</H4>
          </AccordionSummary>

          <AccordionDetails>
            <CreatedQuestions
              evaluationStatus={status}
              data={data}
              reload={reload}
            />
          </AccordionDetails>
        </Accordion>
      </Pastilla>

      {/* dialogs */}
      <ConfirmDialogComponent />
      <CreateDialog {...createDialogProps} />
      <ImportDialog {...importDialogProps} />
      <PinnedDialog {...pinnedDialogProps} />
    </>
  )
}

export default QuestionCreationToolbar
