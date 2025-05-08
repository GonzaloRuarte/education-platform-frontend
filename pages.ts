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
const evaluationsPreviewPath = '/dashboard/evaluaciones/{evaluationId:number}/preview'
const questionEditPath = '/dashboard/evaluaciones/{evaluationId:number}/pregunta/{questionId:number}'
const questionCreateMCPath = `/dashboard/evaluaciones/{evaluationId:number}/pregunta/crear?tipo=${answerTypesToUrlPaths.MultipleChoice}`
const questionCreateNumericPath = `/dashboard/evaluaciones/{evaluationId:number}/pregunta/crear?tipo=${answerTypesToUrlPaths.Numeric}`
const appointmentsProcessPath = '/dashboard/turnos/{appointmentId:number}/procesar'
const appointmentsEditStudentsPath = '/dashboard/turnos/{appointmentId:number}/editar-estudiantes'

const userChangePasswordPath = '/dashboard/usuarios/{userId:number}/cambiar-password'

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
      resolucionEntregada: {
        path: '/evaluacion-entregada',
        label: 'Evaluación entregada',
      },
    },
  },
  D: {
    path: '/dashboard',
    label: 'Dashboard',
    _: {
      devPanel: {
        path: '/dashboard/----------dev----------',
        label: '<Dev Panel>',
      },
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
          solicitar: {
            path: '/dashboard/turnos/solicitar',
            label: 'Solicitar turno',
          },
          procesar: {
            path: appointmentsProcessPath,
            label: 'Procesar Turno',
          },
          editarEstudiantes: {
            path: appointmentsEditStudentsPath,
            label: 'Editar estudiantes',
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
              preview: {
                path: evaluationsPreviewPath,
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
      procesosDeEvaluacion: {
        path: '/dashboard/procesos-de-evaluacion',
        label: 'Procesos de evaluación',
      },
      estudiantes: {
        path: '/dashboard/estudiantes',
        label: 'Estudiantes',
        _: {
          agregar: {
            path: '/dashboard/estudiantes/agregar',
            label: 'Agregar estudiante',
          },
          cargaMasiva: {
            path: '/dashboard/estudiantes/carga-masiva',
            label: 'Carga masiva de estudiantes',
          },
        },
      },
      reportes: {
        path: '/dashboard/reportes',
        label: 'Reportes',
        _: {
          agregar: {
            path: '/dashboard/reportes/agregar',
            label: 'Agregar estudiante',
          },
        },
      },
      comisiones: {
        path: '/dashboard/comisiones',
        label: 'Comisiones',
      },
      usuarios: {
        path: '/dashboard/usuarios',
        label: 'Usuarios',
        _: {
          cambiarPassword: {
            path: userChangePasswordPath,
            label: 'Usuarios',
          },
          responsableInstitucional: {
            path: '/dashboard/usuarios/responsables-institucionales',
            label: 'Responsable Institucional',
            _: {
              agregar: {
                path: '/dashboard/usuarios/responsables-institucionales/agregar',
                label: 'Agregar estudiante',
              },
            },
          },
          itemista: {
            path: '/dashboard/usuarios/itemistas',
            label: 'Itemistas',
            _: {
              agregar: {
                path: '/dashboard/usuarios/itemistas/agregar',
                label: 'Agregar Itemista',
              },
            },
          },
          admins: {
            path: '/dashboard/usuarios/administradores',
            label: 'Administradores',
          },
        },
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
  appointmentsProcessPath,
  appointmentsEditStudentsPath,
  userChangePasswordPath,
  evaluationsPreviewPath,
}

export default pages
