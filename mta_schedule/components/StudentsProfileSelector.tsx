'use client'

import { APPOINTMENT_MAX_STUDENTS } from '@/mta_schedule/constants'
import { useStudentProfileListBySchool } from '@/mta_schools/hooks'
import {
  I_StudentProfileListItem,
  T_SchoolId,
  T_StudentProfileId,
  T_StudentProfilePersonalId,
} from '@/mta_schools/types'
import Bold from '@/shared/components/Bold'
import Button from '@/shared/components/Button'
import { ReloadButton } from '@/shared/components/buttons'
import Chip from '@/shared/components/Chip'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Table from '@/shared/components/Table'
import { Body1, Body2, H4 } from '@/shared/components/Typography'
import Input from '@/shared/forms/Input'
import { paginationModelAsFetchPaginationOptions } from '@/shared/pages/utils'
import { Box, FormHelperText, Grid2 } from '@mui/material'
import { grey, red } from '@mui/material/colors'
import { GridColDef, GridToolbarContainer } from '@mui/x-data-grid'
import React, { useMemo, useState } from 'react'
import { sharedLabels } from '@/shared/labels'
import AddCircleIcon from '@mui/icons-material/AddCircle'

type T_AddedStudents = Record<T_StudentProfileId, { personal_id: T_StudentProfilePersonalId; cohort: string }>
type T_OnAddedStudentsChange = (newAddedStudents: T_AddedStudents) => void

const handleRemoveStudent = (
  studentId: T_StudentProfileId,
  addedStudents: T_AddedStudents,
  onAddedStudentsChange: T_OnAddedStudentsChange,
) => {
  const newAddedStudents = { ...addedStudents }
  delete newAddedStudents[studentId]
  onAddedStudentsChange(newAddedStudents)
}

const columns = (
  addedStudents: T_AddedStudents,
  onAddedStudentsChange: T_OnAddedStudentsChange,
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
        onAddedStudentsChange({
          ...addedStudents,
          [params.row.id]: { personal_id: params.row.personal_id, cohort: params.row.cohort },
        })
      }

      const actions = [
        <Button
          variant="text"
          size="small"
          onClick={
            alreadyIncluded
              ? () => {
                  handleRemoveStudent(Number(params.row.id), addedStudents, onAddedStudentsChange)
                }
              : handleInclude
          }
          // startIcon={alreadyIncluded ? <RemoveIcon /> : <AddIcon />}
        >
          {alreadyIncluded ? 'Quitar' : 'Agregar'}
        </Button>,
      ]

      return actions
    },
  },
]
const useAddedStudents = (initialValue: T_AddedStudents = {}) => {
  const [addedStudents, setAddedStudents] = useState<T_AddedStudents>(initialValue)
  return { addedStudents, setAddedStudents }
}

interface I_Props {
  schoolId: T_SchoolId
  addedStudents: T_AddedStudents
  onAddedStudentsChange: (newState: T_AddedStudents) => void

  hasError?: boolean
  helperText?: string | React.JSX.Element
}
const StudentsProfileSelector = ({ schoolId, addedStudents, onAddedStudentsChange, hasError, helperText }: I_Props) => {
  const [searchCriteria, setSearchCriteria] = useState<string>('')
  const [addedStudentsFilterCriteria, setAddedStudentsFilterCriteria] = useState<string>('')
  const { paginationModel, setPaginationModel } = Table.usePaginationModel({ page: 0, pageSize: 10 })
  const { rowSelectionModel, setRowSelectionModel } = Table.useRowSelectionModel()

  const addedStudentsEntries = Object.entries(addedStudents)
  const studentsCountMaximumExceeded = addedStudentsEntries.length > APPOINTMENT_MAX_STUDENTS
  const filteredAddedStudents = addedStudentsEntries.filter(
    ([_, { personal_id, cohort }]) =>
      String(personal_id).includes(addedStudentsFilterCriteria) || cohort.includes(addedStudentsFilterCriteria),
  )

  const hasSelection = rowSelectionModel.length > 0

  const {
    data: students,
    isLoading,
    reload,
  } = useStudentProfileListBySchool(
    {
      ...paginationModelAsFetchPaginationOptions(paginationModel),
      filters: {
        items: [],                                  // no column-specific items
        quickFilterValues: searchCriteria ? [searchCriteria] : [],
        // linkOperator: 'and' // optional; irrelevant if items is empty
      },
    },
    { schoolId },
  )
  const studentsAsObject = useMemo<T_AddedStudents>(() => {
    if (students === undefined) return {}
    const _studentsAsObject: T_AddedStudents = {}
    students.results.forEach((student) => {
      _studentsAsObject[student.id] = { personal_id: student.personal_id, cohort: student.cohort }
    })

    return _studentsAsObject
  }, [students])

  const handleBatchAdd = () => {
    if (students === undefined) return
    const newStudents = {}
    rowSelectionModel.forEach((i) => (newStudents[i] = studentsAsObject[i]))

    onAddedStudentsChange({ ...addedStudents, ...newStudents })
    setRowSelectionModel([])
  }
  return (
    <>
      <Grid2 container spacing={5}>
        <Grid2 size={6}>
          <H4>Listado de todos los estudiantes de la escuela</H4>
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
              columns={columns(addedStudents, onAddedStudentsChange)}
              data={students?.results}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              onRowSelectionModelChange={setRowSelectionModel}
              rowSelectionModel={rowSelectionModel}
              count={students?.count}
              isLoading={isLoading}
              density="compact"
              slots={{
                toolbar: () => {
                  return (
                    <GridToolbarContainer sx={{ padding: 1, justifyContent: 'flex-end', display: 'flex' }}>
                      {hasSelection && 
                      <Button size="small" variant="text" onClick={handleBatchAdd} startIcon={<AddCircleIcon />}>
                      {sharedLabels.addAll}
                      </Button>}
                      <ReloadButton size="small" variant="text" onClick={reload} />
                    </GridToolbarContainer>
                  )
                },
              }}
            />
          </Box>
        </Grid2>
        <Grid2 size={6}>
          <Box
            bgcolor={hasError ? red[50] : grey[300]}
            p={4}
            borderRadius={2}
            border={hasError ? '1px solid red' : undefined}
          >
            <H4>Estudiantes agregados al turno</H4>
            {helperText !== undefined && <FormHelperText error={hasError}>{helperText}</FormHelperText>}
            <Spacer />
            <Input
              label="Buscar"
              helperText="Por DNI o división"
              value={addedStudentsFilterCriteria}
              onChange={(e) => setAddedStudentsFilterCriteria(e.target.value)}
            />
            <Spacer />
            <Body1>
              <Bold>Hay {addedStudentsEntries.length} estudiantes agregados</Bold>{' '}
              {addedStudentsEntries.length > filteredAddedStudents.length
                ? `(mostrando ${filteredAddedStudents.length})`
                : ''}
            </Body1>
            <Body2 color={studentsCountMaximumExceeded ? red[500] : undefined}>
              El máximo de estudiantes por turno es {APPOINTMENT_MAX_STUDENTS}.{' '}
              {studentsCountMaximumExceeded &&
                `Debes quitar ${addedStudentsEntries.length - APPOINTMENT_MAX_STUDENTS} estudiantes para continuar.`}
              {addedStudentsEntries.length < APPOINTMENT_MAX_STUDENTS &&
                `Todavía podés agregar ${APPOINTMENT_MAX_STUDENTS - addedStudentsEntries.length} estudiantes.`}
            </Body2>
            <Spacer />
            <MagicGrid itemSize="auto">
              {filteredAddedStudents.map(([studentId, { personal_id, cohort }]) => {
                return (
                  <Chip
                    key={personal_id}
                    label={`${personal_id} (${cohort})`}
                    onDelete={() => handleRemoveStudent(Number(studentId), addedStudents, onAddedStudentsChange)}
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

StudentsProfileSelector.useAddedStudents = useAddedStudents
export default StudentsProfileSelector
export type { T_AddedStudents }
