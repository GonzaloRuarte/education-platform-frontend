import Button from '@/shared/components/Button'
import { Body1 } from '@/shared/components/Typography'
import { useDialog } from '@/shared/dialogs'
import { sharedLabels } from '@/shared/labels'

const SubmitEvaluationButton = () => {
  const { DialogComponent, componentProps, showDialog, closeDialog } = useDialog()

  const manageSubmit = () => {
    showDialog({
      title: 'Entregar evaluación',
      content: (
        <>
          <Body1>¿Estás seguro/a que querés entregar tu evaluación?</Body1>
          <Body1>Una vez realizada la entrega no podés volver a editar tus respuestas.</Body1>
        </>
      ),
      actions: [
        {
          key: 'cancel',
          buttonLabel: sharedLabels.cancel,
          onPress: closeDialog,
        },
      ],
    })
  }
  return (
    <>
      <Button onClick={manageSubmit}>Entregar evaluación</Button>
      <DialogComponent {...componentProps} />
    </>
  )
}

export default SubmitEvaluationButton
