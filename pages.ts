import { answerTypesToUrlPaths } from '@/mta_evaluations/constants'

type T_PageConfig = {
  path: string
  label: string
  _?: { [key: string]: T_PageConfig }
  // bcTK: string // aka. breadcrumb translation key
}
type T_PagesConfig = { [key: string]: T_PageConfig }

// const pages: T_PagesConfig = {
const evaluationsEditContentPath = '/dashboard/evaluaciones/{evaluationId:number}/editar-contenido'
const questionEditPath = '/dashboard/evaluaciones/{evaluationId:number}/pregunta/{questionId:number}'
const questionCreateMCPath = `/dashboard/evaluaciones/{evaluationId:number}/pregunta/crear?tipo=${answerTypesToUrlPaths.MultipleChoice}`
const questionCreateNumericPath = `/dashboard/evaluaciones/{evaluationId:number}/pregunta/crear?tipo=${answerTypesToUrlPaths.Numeric}`
const pages = {
  R: {
    path: '/',
    label: 'Bienvenida',
    _: {
      login: {
        path: '/login',
        label: 'Login Estudiante',
      },
      resolverEvaluacion: {
        path: '/resolver-evaluacion',
        label: 'Resolver Evaluación',
      },
    },
  },
  D: {
    path: '/dashboard',
    label: 'Dashboard',
    _: {
      login: {
        path: '/dashboard/login',
        label: 'Login',
      },
      escuelas: {
        path: '/dashboard/escuelas',
        label: 'Escuelas',
        _: {
          agregar: {
            path: '/dashboard/escuelas/agregar',
            label: 'Agregar escuela',
          },
        },
      },
      turnos: {
        path: '/dashboard/turnos',
        label: 'Turnos',
        _: {
          agregar: {
            path: '/dashboard/turnos/agregar',
            label: 'Agregar turno',
          },
        },
      },
      evaluaciones: {
        path: '/dashboard/evaluaciones',
        label: 'Evaluaciones',
        _: {
          editar: {
            path: '/dashboard/evaluaciones/{id:number}',
            label: 'Editar Evaluación',
            _: {
              editarContenido: {
                path: evaluationsEditContentPath,
                label: 'Editar Contenido de Evaluación',
              },
              editarPregunta: {
                path: questionEditPath,
                label: 'Editar Pregunta',
              },
              crearMultipleChoice: {
                path: questionCreateMCPath,
                label: 'Crear Multiple Choice',
              },
              crearNumerica: {
                path: questionCreateNumericPath,
                label: 'Crear Numérica',
              },
            },
          },
          agregar: {
            path: '/dashboard/evaluaciones/agregar',
            label: 'Agregar evaluación',
          },
        },
      },
      estudiantes: {
        path: '/dashboard/estudiantes',
        label: 'Estudiantes',
      },
      comisiones: {
        path: '/dashboard/comisiones',
        label: 'Comisiones',
      },
      roles: {
        path: '/dashboard/roles',
        label: 'Roles',
      },
    },
  },
}

const pathWithId = (path: string, id: string | number) => {
  return `${path}/${id}`
}

export {
  pages,
  pathWithId,
  evaluationsEditContentPath,
  questionEditPath,
  questionCreateMCPath,
  questionCreateNumericPath,
}

export default pages
