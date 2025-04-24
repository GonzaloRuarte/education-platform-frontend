'use client'

import { useStudentProfileListBySchool } from '@/mta_schools/hooks'
import {
  I_StudentProfileListItem,
  T_SchoolId,
  T_StudentProfileId,
  T_StudentProfilePersonalId,
} from '@/mta_schools/types'
import { AddButton } from '@/shared/components/buttons'
import Chip from '@/shared/components/Chip'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Table from '@/shared/components/Table'
import { Body1, H4 } from '@/shared/components/Typography'
import Input from '@/shared/forms/Input'
import { paginationModelAsFetchPaginationOptions } from '@/shared/pages/utils'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { Box, Grid2, IconButton } from '@mui/material'
import { GridColDef, GridToolbarContainer } from '@mui/x-data-grid'
import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from 'react'
import selStd from './selectedStudents.json'
import { LIGHT_BG_COLOR } from '@/config'
import { grey } from '@mui/material/colors'

type T_AddedStudents = Record<T_StudentProfileId, { personal_id: T_StudentProfilePersonalId; cohort: string }>

const handleRemoveStudent = (
  studentId: T_StudentProfileId,
  setAddedStudents: Dispatch<SetStateAction<T_AddedStudents>>,
) => {
  setAddedStudents((currentList) => {
    const newList = { ...currentList }
    delete newList[studentId]
    return newList
  })
}

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
      const alreadyIncluded = params.row.id in addedStudents
      const handleInclude = () => {
        setAddedStudents((currentList) => ({
          ...currentList,
          [params.row.id]: { personal_id: params.row.personal_id, cohort: params.row.cohort },
        }))
      }

      const actions = [
        <IconButton
          onClick={alreadyIncluded ? () => handleRemoveStudent(params.row.id, setAddedStudents) : handleInclude}
        >
          {alreadyIncluded ? <RemoveIcon /> : <AddIcon />}
        </IconButton>,
      ]

      return actions
    },
  },
]

const StudentsProfileSelector: FC<{ schoolId: T_SchoolId }> = ({ schoolId }) => {
  const [searchCriteria, setSearchCriteria] = useState<string>('')
  const [addedStudentsFilterCriteria, setAddedStudentsFilterCriteria] = useState<string>('')
  const { paginationModel, setPaginationModel } = Table.usePaginationModel({ page: 0, pageSize: 10 })
  const { rowSelectionModel, setRowSelectionModel } = Table.useRowSelectionModel()
  const [addedStudents, setAddedStudents] = useState<T_AddedStudents>({})
  const addedStudentsEntries = Object.entries(addedStudents)
  const filteredAddedStudents = addedStudentsEntries.filter(
    ([_, { personal_id, cohort }]) =>
      String(personal_id).includes(addedStudentsFilterCriteria) || cohort.includes(addedStudentsFilterCriteria),
  )
  console.log(JSON.stringify(addedStudents))

  const hasSelection = rowSelectionModel.length > 0

  const { data: students, isLoading } = useStudentProfileListBySchool(
    { ...paginationModelAsFetchPaginationOptions(paginationModel), filters: { search: searchCriteria } },
    {
      schoolId,
    },
  )
  const studentsAsObject = useMemo<T_AddedStudents>(() => {
    if (students === undefined) return {}
    const _studentsAsObject: T_AddedStudents = {}
    students.results.forEach((student) => {
      _studentsAsObject[student.id] = { personal_id: student.personal_id, cohort: student.cohort }
    })
    console.log({ _studentsAsObject })

    return _studentsAsObject
  }, [students])

  const handleBatchAdd = () => {
    if (students === undefined) return
    const newStudents = {}
    rowSelectionModel.forEach((i) => (newStudents[i] = studentsAsObject[i]))

    setAddedStudents((prevValue) => ({ ...prevValue, ...newStudents }))
    setRowSelectionModel([])
  }
  useEffect(() => {
    setAddedStudents(selStd as unknown as T_AddedStudents)
  }, [])
  return (
    <>
      <Grid2 container spacing={5}>
        <Grid2 size={7}>
          <H4>Listados de todos los estudiantes</H4>
          <Spacer />
          <Input
            label="Buscar"
            helperText="Por DNI o división"
            value={searchCriteria}
            onChange={(e) => setSearchCriteria(e.target.value)}
          />
          <Spacer size="s" />
          <Box>
            <Table
              checkboxSelection
              columns={columns(addedStudents, setAddedStudents)}
              data={students?.results}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              onRowSelectionModelChange={setRowSelectionModel}
              rowSelectionModel={rowSelectionModel}
              count={students?.count}
              isLoading={isLoading}
              density="compact"
              slots={{
                toolbar: hasSelection
                  ? () => {
                      return (
                        <GridToolbarContainer sx={{ padding: 1, justifyContent: 'flex-end', display: 'flex' }}>
                          <AddButton size="small" variant="text" onClick={handleBatchAdd} />
                        </GridToolbarContainer>
                      )
                    }
                  : undefined,
              }}
            />
          </Box>
        </Grid2>
        <Grid2 size={5}>
          <Box bgcolor={grey[300]} p={4} borderRadius={2}>
            <H4>Estudiantes agregados</H4>
            <Spacer />
            <Input
              label="Buscar"
              helperText="Por DNI o división"
              value={addedStudentsFilterCriteria}
              onChange={(e) => setAddedStudentsFilterCriteria(e.target.value)}
            />
            <Spacer />
            <Body1>
              Hay {addedStudentsEntries.length} estudiantes agregados{' '}
              {addedStudentsEntries.length > filteredAddedStudents.length
                ? `(mostrando ${filteredAddedStudents.length})`
                : ''}
            </Body1>
            <Spacer />
            <MagicGrid itemSize="auto">
              {filteredAddedStudents.map(([studentId, { personal_id, cohort }]) => {
                return (
                  <Chip
                    key={personal_id}
                    label={`${personal_id} (${cohort})`}
                    onDelete={() => handleRemoveStudent(Number(studentId), setAddedStudents)}
                  />
                )
              })}
            </MagicGrid>
          </Box>
        </Grid2>
      </Grid2>
    </>
  )
}

export default StudentsProfileSelector
