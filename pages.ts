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
const pages = {
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

export { pages, pathWithId, evaluationsEditContentPath, questionEditPath }

export default pages
