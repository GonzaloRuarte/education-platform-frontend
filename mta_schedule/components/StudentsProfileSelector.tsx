'use client'

import { useStudentProfileListBySchool } from '@/mta_schools/hooks'
import { I_StudentProfileListItem, T_SchoolId, T_StudentProfilePersonalId } from '@/mta_schools/types'
import Table from '@/shared/components/Table'
import { paginationModelAsFetchPaginationOptions } from '@/shared/pages/utils'
import { Grid2, IconButton } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import { Dispatch, FC, SetStateAction, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import Button from '@/shared/components/Button'
import Chip from '@/shared/components/Chip'
import MagicGrid from '@/shared/components/MagicGrid'

type T_AddedStudents = Array<T_StudentProfilePersonalId>

const columns = (
  addedStudents: T_AddedStudents,
  setAddedStudents: Dispatch<SetStateAction<T_AddedStudents>>,
): Array<GridColDef<I_StudentProfileListItem>> => [
  { field: 'personal_id', headerName: 'DNI', flex: 1 },
  { field: 'cohort', headerName: 'División', flex: 1 },
  {
    field: 'actions',
    type: 'actions',
    flex: 1,
    headerName: 'Acciones',
    getActions: (params) => {
      const alreadyIncluded = addedStudents.includes(params.row.personal_id)
      const handleInclude = () => {
        setAddedStudents((currentList) => [...currentList, params.row.personal_id])
      }
      const handleRemove = () => {
        setAddedStudents((currentList) => currentList.filter((id) => id !== params.row.personal_id))
      }
      return [
        <IconButton onClick={alreadyIncluded ? handleRemove : handleInclude}>
          {alreadyIncluded ? <RemoveIcon /> : <AddIcon />}
        </IconButton>,
      ]
    },
  },
]

const StudentsProfileSelector: FC<{ schoolId: T_SchoolId }> = ({ schoolId }) => {
  const { paginationModel, setPaginationModel } = Table.usePaginationModel({ page: 0, pageSize: 10 })
  const { data: students } = useStudentProfileListBySchool(paginationModelAsFetchPaginationOptions(paginationModel), {
    schoolId,
  })
  const [addedStudents, setAddedStudents] = useState<T_AddedStudents>([])
  return (
    <>
      <Grid2 container spacing={2}>
        <Grid2 size={7}>
          <Table
            columns={columns(addedStudents, setAddedStudents)}
            data={students?.results}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            count={students?.count}
          />
        </Grid2>
        <Grid2 size={5}>
          <MagicGrid itemSize="auto">
            {addedStudents.map((personalId) => {
              return <Chip key={personalId} label={personalId} />
            })}
          </MagicGrid>
        </Grid2>
      </Grid2>
    </>
  )
}

export default StudentsProfileSelector
