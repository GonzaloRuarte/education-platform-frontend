import { sharedLabels } from '@/shared/labels'

const questionBankLabels = {
  title: 'Título',
  code: 'Código',
  header: 'Encabezado',
  difficulty: 'Dificultad',
  subject: 'Materia',
  newQuestion: 'Creación pregunta'
}



const questionLabels = {
  title: sharedLabels.title,
  content: sharedLabels.content,
  create: 'Crear pregunta',
}

const multipleChoiceLabels = {
  option: {
    name: sharedLabels.name,
    content: sharedLabels.content,
  },
}
const numericLabels = {
  value: 'Valor',
}

export { questionBankLabels, multipleChoiceLabels, questionLabels, numericLabels }
