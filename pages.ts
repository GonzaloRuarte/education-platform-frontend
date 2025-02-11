type T_PageConfig = {
  path: string,
  label: string,
  subpages?: { [key: string]: T_PageConfig },
  // bcTK: string // aka. breadcrumb translation key
}
type T_PagesConfig = { [key: string]: T_PageConfig }

const pages /*: T_PagesConfig*/ = {
  escuelas: {
    path: '/escuelas',
    label: 'Escuelas',
    subpages: {
      agregarEscuela: {
        path: '/escuelas/agregar',
        label: 'Agregar escuela',
      }
    }
  },
  turnos: {
    path: '/turnos',
    label: 'Turnos'
  },
  evaluaciones: {
    path: '/evaluaciones',
    label: 'Evaluaciones'
  },
  alumnos: {
    path: '/alumnos',
    label: 'Alumnos'
  },
  comisiones: {
    path: '/comisiones',
    label: 'Comisiones'
  },
  roles: {
    path: '/roles',
    label: 'Roles'
  }
}

export default pages