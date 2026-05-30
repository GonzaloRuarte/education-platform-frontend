'use client'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import { Box, FormHelperText, Grid2 } from '@mui/material'
import { grey, red } from '@mui/material/colors'
import { GridColDef, GridToolbarContainer } from '@mui/x-data-grid'
import React, { useMemo, useState } from 'react'

import { useHasCapabilities } from '@/mta_auth/hooks'
import { APPOINTMENT_MAX_STUDENTS } from '@/mta_schedule/constants'
import { useStudentProfileListBySchool } from '@/mta_schools/hooks'
import {
  I_StudentProfileScopedListItem,
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
import { sharedLabels } from '@/shared/labels'
import { paginationModelAsFetchPaginationOptions } from '@/shared/pages/utils'

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

const studentLabel = (personalId: T_StudentProfilePersonalId, cohort: string, fallbackId?: number | string) =>
  personalId ? `${personalId} (${cohort})` : `Estudiante ${fallbackId ?? ''} (${cohort})`

const columns = (
  addedStudents: T_AddedStudents,
  onAddedStudentsChange: T_OnAddedStudentsChange,
  canViewStudentDni: boolean,
): Array<GridColDef<I_StudentProfileScopedListItem>> => {
  const baseColumns: Array<GridColDef<I_StudentProfileScopedListItem>> = [
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

        return [
          <Button
            variant="text"
            size="small"
            onClick={alreadyIncluded ? () => handleRemoveStudent(Number(params.row.id), addedStudents, onAddedStudentsChange) : handleInclude}
          >
            {alreadyIncluded ? 'Quitar' : 'Agregar'}
          </Button>,
        ]
      },
    },
  ]

  if (canViewStudentDni) {
    baseColumns.unshift({ field: 'personal_id', headerName: 'DNI o Pasaporte', flex: 1 })
  }

  return baseColumns
}

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
  const canViewStudentDni = useHasCapabilities(['view_student_dni'])
  const [searchCriteria, setSearchCriteria] = useState<string>('')
  const [addedStudentsFilterCriteria, setAddedStudentsFilterCriteria] = useState<string>('')
  const { paginationModel, setPaginationModel } = Table.usePaginationModel({ page: 0, pageSize: 10 })
  const { rowSelectionModel, setRowSelectionModel } = Table.useRowSelectionModel()

  const addedStudentsEntries = Object.entries(addedStudents)
  const studentsCountMaximumExceeded = addedStudentsEntries.length > APPOINTMENT_MAX_STUDENTS
  const filteredAddedStudents = addedStudentsEntries.filter(([studentId, { personal_id, cohort }]) => {
    const normalizedTerm = addedStudentsFilterCriteria.trim()
    if (!normalizedTerm) return true
    return (
      cohort.includes(normalizedTerm) ||
      (canViewStudentDni && String(personal_id ?? '').includes(normalizedTerm)) ||
      (!canViewStudentDni && String(studentId).includes(normalizedTerm))
    )
  })

  const hasSelection = rowSelectionModel.length > 0
  const searchHelperText = canViewStudentDni ? 'Por DNI o Pasaporte, o división' : 'Por ID o división'

  const { data: students, isLoading, reload } = useStudentProfileListBySchool(
    {
      ...paginationModelAsFetchPaginationOptions(paginationModel),
      filters: {
        items: [],
        quickFilterValues: searchCriteria ? [searchCriteria] : [],
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
    const newStudents: T_AddedStudents = {}
    rowSelectionModel.forEach((i) => {
      newStudents[Number(i)] = studentsAsObject[Number(i)]
    })

    onAddedStudentsChange({ ...addedStudents, ...newStudents })
    setRowSelectionModel([])
  }

  return (
    <>
      <Grid2 container spacing={5}>
        <Grid2 size={6}>
          <H4>Listado de todos los estudiantes de la escuela</H4>
          <Spacer />
          <Input label="Buscar" helperText={searchHelperText} value={searchCriteria} onChange={(e) => setSearchCriteria(e.target.value)} />
          <Spacer size="s" />
          <Box>
            <Table
              checkboxSelection
              columns={columns(addedStudents, onAddedStudentsChange, canViewStudentDni)}
              data={students?.results}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              onRowSelectionModelChange={setRowSelectionModel}
              rowSelectionModel={rowSelectionModel}
              count={students?.count}
              isLoading={isLoading}
              density="compact"
              slots={{
                toolbar: () => (
                  <GridToolbarContainer sx={{ padding: 1, justifyContent: 'flex-end', display: 'flex' }}>
                    {hasSelection && (
                      <Button size="small" variant="text" onClick={handleBatchAdd} startIcon={<AddCircleIcon />}>
                        {sharedLabels.addAll}
                      </Button>
                    )}
                    <ReloadButton size="small" variant="text" onClick={reload} />
                  </GridToolbarContainer>
                ),
              }}
            />
          </Box>
        </Grid2>
        <Grid2 size={6}>
          <Box bgcolor={hasError ? red[50] : grey[300]} p={4} borderRadius={2} border={hasError ? '1px solid red' : undefined}>
            <H4>Estudiantes agregados al turno</H4>
            {helperText !== undefined && <FormHelperText error={hasError}>{helperText}</FormHelperText>}
            <Spacer />
            <Input label="Buscar" helperText={searchHelperText} value={addedStudentsFilterCriteria} onChange={(e) => setAddedStudentsFilterCriteria(e.target.value)} />
            <Spacer />
            <Body1>
              <Bold>Hay {addedStudentsEntries.length} estudiantes agregados</Bold>{' '}
              {addedStudentsEntries.length > filteredAddedStudents.length ? `(mostrando ${filteredAddedStudents.length})` : ''}
            </Body1>
            <Body2 color={studentsCountMaximumExceeded ? red[500] : undefined}>
              El máximo de estudiantes por turno es {APPOINTMENT_MAX_STUDENTS}.{' '}
              {studentsCountMaximumExceeded && `Debes quitar ${addedStudentsEntries.length - APPOINTMENT_MAX_STUDENTS} estudiantes para continuar.`}
              {addedStudentsEntries.length < APPOINTMENT_MAX_STUDENTS && `Todavía podés agregar ${APPOINTMENT_MAX_STUDENTS - addedStudentsEntries.length} estudiantes.`}
            </Body2>
            <Spacer />
            <MagicGrid itemSize="auto">
              {filteredAddedStudents.map(([studentId, { personal_id, cohort }]) => (
                <Chip
                  key={`${studentId}-${personal_id ?? 'anon'}`}
                  label={studentLabel(personal_id, cohort, studentId)}
                  onDelete={() => handleRemoveStudent(Number(studentId), addedStudents, onAddedStudentsChange)}
                />
              ))}
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
