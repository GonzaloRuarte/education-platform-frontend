type T_PageConfig = {
  path: string,
  label: string,
  _?: { [key: string]: T_PageConfig },
  // bcTK: string // aka. breadcrumb translation key
}
type T_PagesConfig = { [key: string]: T_PageConfig }

// const pages: T_PagesConfig = {
const pages = {
  D: {
    path: '/dashboard',
    label: 'Dashboard',
    _: {
      login: {
        path: '/dashboard/login',
        label: 'Login'
      },
      escuelas: {
        path: '/dashboard/escuelas',
        label: 'Escuelas',
        _: {
          agregarEscuela: {
            path: '/dashboard/escuelas/agregar',
            label: 'Agregar escuela',
          }
        }
      },
      turnos: {
        path: '/dashboard/turnos',
        label: 'Turnos'
      },
      evaluaciones: {
        path: '/dashboard/evaluaciones',
        label: 'Evaluaciones'
      },
      estudiantes: {
        path: '/dashboard/estudiantes',
        label: 'Estudiantes'
      },
      comisiones: {
        path: '/dashboard/comisiones',
        label: 'Comisiones'
      },
      roles: {
        path: '/dashboard/roles',
        label: 'Roles'
      }
    }
  }
}


export {
  pages,
  // resolutionPages,
}

export default pages