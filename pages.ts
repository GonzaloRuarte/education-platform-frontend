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
const appointmentAdminDashboardPath = '/dashboard/turnos/tablero'
const resolutionInspectionPath = '/dashboard/turnos/estado-resolucion'
const questionBankCreatePath = '/dashboard/banco-de-preguntas/crear'
const questionBankEditPath = '/dashboard/banco-de-preguntas/{questionId:number}'
const dashboardForgotAccessPath = '/dashboard/login/recuperar-acceso'
const dashboardResetPasswordPath = '/dashboard/login/restablecer-password/{uid:string}/{token:string}'
const reportesAuroraListPath = '/dashboard/reportes_aurora'
const reportesAuroraEscuelaPath = '/dashboard/reportes_aurora/escuela/{escuelaId:number}'

const userChangePasswordPath = '/dashboard/usuarios/{userId:number}/cambiar-password'

const pages = {
  R: {
    path: '/',
    label: 'Bienvenida',
    _: {
      login: {
        path: '/login',
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
          agrupamientos: {
            path: '/dashboard/escuelas/agrupamientos',
            label: 'Agrupamientos',
            _: {
              agregar: {
                path: '/dashboard/escuelas/agrupamientos/agregar',
                label: 'Agregar agrupamiento',
              },
            },
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
          tablero: {
            path: appointmentAdminDashboardPath,
            label: 'Tablero de control',
          },
          estadoResolucion: {
            path: resolutionInspectionPath,
            label: 'Estados de resolución',
          },
        },
      },
      evaluaciones: {
        path: '/dashboard/evaluaciones',
        label: 'Evaluaciones',
        _: {
          materias: {
            path: '/dashboard/evaluaciones/materias',
            label: 'Materias',
            _: {
              agregar: {
                path: '/dashboard/evaluaciones/materias/agregar',
                label: 'Agregar materia',
              },
            },
          },
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
      reportesAurora: {
        path: reportesAuroraListPath,
        label: 'Reportes Aurora',
        _: {
          escuela: {
            path: reportesAuroraEscuelaPath,
            label: 'Reporte por escuela',
          },
          agregar: {
            path: '/dashboard/reportes_aurora/agregar',
            label: 'Agregar reporte Aurora',
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
                label: 'Agregar responsable institucional',
              },
            },
          },
          responsableAgrupamiento: {
            path: '/dashboard/usuarios/responsables-agrupamiento',
            label: 'Responsables de agrupamiento',
            _: {
              agregar: {
                path: '/dashboard/usuarios/responsables-agrupamiento/agregar',
                label: 'Agregar responsable de agrupamiento',
              },
            },
          },
          responsableAgrupamientoAnon: {
            path: '/dashboard/usuarios/responsables-agrupamiento-anon',
            label: 'Responsables de agrupamiento (anon)',
            _: {
              agregar: {
                path: '/dashboard/usuarios/responsables-agrupamiento-anon/agregar',
                label: 'Agregar responsable de agrupamiento (anon)',
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
  appointmentAdminDashboardPath,
  resolutionInspectionPath,
  userChangePasswordPath,
  evaluationsPreviewPath,
  questionBankCreatePath,
  questionBankEditPath,
}

export default pages
