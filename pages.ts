import RouteBuilder from '@/shared/routeBuider'
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
      alumnos: {
        path: '/dashboard/alumnos',
        label: 'Alumnos'
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


const rb = new RouteBuilder()
const dashboardPages = rb.root({
  basepath: '/dashboard',
  nodes: [
    rb.node('Escuelas', '/escuelas'),
    rb.node('Divisiones', '/divisiones'),
    rb.node('Comisiones de evaluación', '/comisiones'),

    rb.node('Turnos', '/turnos'),
    rb.node('Evaluaciones', '/evaluaciones'),
    rb.node('Alumnos', '/alumnos'),
    rb.node('Comisiones', '/comisiones'),
    rb.node('Roles', '/roles'),
  ]
}).buildRoute()

// const resolutionPages = rb.root({
//   nodes: [
//     rb.node('Escuelas', '/escuelas', {
//       subnodes: [
//         rb.node('Agregar escuela', '/agregar'),
//         rb.node('Quitar escuela', '/quitar'),
//       ],
//     }),
//     rb.node('Turnos', '/turnos'),
//     rb.node('Evaluaciones', '/evaluaciones'),
//     rb.node('Alumnos', '/alumnos'),
//     rb.node('Comisiones', '/comisiones'),
//     rb.node('Roles', '/roles'),
//   ]
// }).buildRoute();

export {
  dashboardPages,
  // resolutionPages,
}

export default dashboardPages