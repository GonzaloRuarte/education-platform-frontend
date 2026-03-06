type T_PageConfig = {
  path: string
  label: string
  _?: { [key: string]: T_PageConfig }
  // bcTK: string // aka. breadcrumb translation key
}
type T_PagesConfig = { [key: string]: T_PageConfig }

// const pages: T_PagesConfig = {
const evaluationsEditContentPath = '/dashboard/evaluaciones/{evaluationId:number}/editar-contenido'
const evaluationsPreviewPath = '/preview/{evaluationId:number}'
const appointmentsProcessPath = '/dashboard/turnos/{appointmentId:number}/procesar'
const appointmentsEditStudentsPath = '/dashboard/turnos/{appointmentId:number}/editar-estudiantes'
const questionBankCreatePath = '/dashboard/banco-de-preguntas/crear'
const questionBankEditPath = '/dashboard/banco-de-preguntas/{questionId:number}'
const reportEditPath = '/dashboard/reportes/{reportId:number}'
const dashboardForgotAccessPath = '/dashboard/login/recuperar-acceso'
const dashboardResetPasswordPath = '/dashboard/login/restablecer-password/{uid:string}/{token:string}'
// META report bundles (computed artifacts)
const metaReportsListPath = '/dashboard/reportes/meta'
const metaReportsDetailPath = '/dashboard/reportes/meta/{bundleId:number}'

const userChangePasswordPath = '/dashboard/usuarios/{userId:number}/cambiar-password'

const pages = {
  R: {
    path: '/',
    label: 'Bienvenida',
    _: {
      login: {
        path: '/dashboard/login',
        label: 'Login',

      },
      resolverEvaluacion: {
        path: '/resolver-evaluacion',
        label: 'Resolver evaluación',
      },
      resolucionEntregada: {
        path: '/evaluacion-entregada',
        label: 'Evaluación entregada',
      },
    },
  },
  preview: {
  path: evaluationsPreviewPath,
  label: 'Editar Contenido de Evaluación',
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
        _: {
          forgotAccess: {
            path: dashboardForgotAccessPath,
            label: 'Recuperar acceso',
          },
          resetPassword: {
            path: dashboardResetPasswordPath,
            label: 'Restablecer contraseña',
          },
        },
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
            label: 'Procesar turno',
          },
          editarEstudiantes: {
            path: appointmentsEditStudentsPath,
            label: 'Editar estudiantes',
          },
          cargarResolucionesOffline: {
            path: '/dashboard/turnos/cargar-resoluciones-offline',
            label: 'Cargar resoluciones offline',
          },
        },
      },
      evaluaciones: {
        path: '/dashboard/evaluaciones',
        label: 'Evaluaciones',
        _: {
          editar: {
            path: '/dashboard/evaluaciones/{id:number}',
            label: 'Editar evaluación',
            _: {
              editarContenido: {
                path: evaluationsEditContentPath,
                label: 'Editar contenido de evaluación',
              },

            },
          },
          agregar: {
            path: '/dashboard/evaluaciones/agregar',
            label: 'Agregar evaluación',
          },
        },
      },
      bancoDePreguntas: {
        path: '/dashboard/banco-de-preguntas',
        label: 'Banco de preguntas',
        _: {
          agregar: {
            path: '/dashboard/banco-de-preguntas/crear',
            label: 'Agregar pregunta',
          },
          editar: {
            path: questionBankEditPath,
            label: 'Editar Pregunta',
          },
        },
      },
      procesosDeEvaluacion: {
        path: '/dashboard/procesos-de-evaluacion',
        label: 'Evaluaciones procesadas',
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
            label: 'Agregar reporte',
          },
          editar: {
            path: reportEditPath,
            label: 'Editar reporte',
          },
          meta: {
            path: metaReportsListPath,
            label: 'Reportes META',
            _: {
              detalle: {
                path: metaReportsDetailPath,
                label: 'Detalle Reporte META',
              },
            },
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
          responsableEjecutivo: {
            path: '/dashboard/usuarios/responsables-ejecutivos',
            label: 'Responsables ejecutivos',
            _: {
              agregar: {
                path: '/dashboard/usuarios/responsables-ejecutivos/agregar',
                label: 'Agregar responsable ejecutivo',
              },
            },
          },
          responsableInstitucional: {
            path: '/dashboard/usuarios/responsables-institucionales',
            label: 'Responsables institucionales',
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
                label: 'Agregar itemista',
              },
            },
          },
          admins: {
            path: '/dashboard/usuarios/administradores',
            label: 'Administradores',
            _: {
              agregar: {
                path: '/dashboard/usuarios/administradores/agregar',
                label: 'Agregar administrador',
              },
            },
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
  appointmentsProcessPath,
  appointmentsEditStudentsPath,
  userChangePasswordPath,
  evaluationsPreviewPath,
  questionBankCreatePath,
  questionBankEditPath,
  reportEditPath,
  metaReportsListPath,
  metaReportsDetailPath,
}

export default pages
