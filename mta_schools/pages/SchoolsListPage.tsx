"use client"


import { useSchoolList } from '@/mta_schools/hooks'
import ListPage from '@/shared/components/ListPage'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef> = [
  { field: 'id', headerName: '#' },
  { field: 'name', headerName: 'Nombre', flex: 2 },
  { field: 'district', headerName: 'Distrito', flex: 1 },
  { field: 'contact_email', headerName: 'Contacto', flex: 1 },
]

const SchoolsListPage = () => <ListPage columns={columns} useService={useSchoolList} title='Escuelas' />


export default SchoolsListPage
