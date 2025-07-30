import { ErrorCode } from '@/config'

const sharedLabels = {
  update: 'Actualizar',
  back: 'Atrás',
  reload: 'Recargar',
  add: 'Agregar',
  addAll: 'Agregar toda la selección',
  submit: 'Entregar',
  cancel: 'Cancelar',
  delete: 'Eliminar',
  edit: 'Editar',
  moveUp: 'Mover arriba',
  moveDown: 'Mover abajo',
  //
  title: 'Título',
  name: 'Nombre',
  content: 'Contenido',
  close: 'Cerrar',
}

const errorCodeLabels = {
  [ErrorCode.RESOLUTION_ALREADY_SUBMITTED]: 'La resolución ya fue enviada. No puedes reanudarla nuevamente.',
  [ErrorCode.SCHOOL_RESTRICTED_DATA]: 'No tienes permisos para manejar la escuela solicitada.',
  [ErrorCode.RESOLUTION_PREVIOUSLY_SUBMITTED_IS_EQUAL_OR_NEWER]:
    'Ya existe un estado de evaluación cargado que es igual o más reciente que el que se está enviando ahora.',
  [ErrorCode.APPOINTMENT_RESTRICTED_DATA]: 'Datos del turno restringidos.',
  [ErrorCode.STUDENT_RESTRICTED_DATA]: 'Datos del estudiante restringidos.',
  [ErrorCode.NO_FILE_WAS_PROVIDED]: 'No se proporcionó ningún archivo.',
  [ErrorCode.EVALUATION_RESTRICTED]: 'Evaluación restringida.',
  [ErrorCode.UNSUPPORTED_FILE_TYPE]: 'Tipo de archivo no soportado.',
}

export { sharedLabels, errorCodeLabels }
