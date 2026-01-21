import React from 'react'
import dayjs from 'dayjs'
import TextField from '@mui/material/TextField'
import type { GridColDef, GridFilterOperator, GridFilterInputValueProps } from '@mui/x-data-grid'

function DateISOInput(props: GridFilterInputValueProps) {
    const { item, applyValue, focusElementRef } = props
    return (
        <TextField
            variant="standard"
            type="date"
            inputRef={focusElementRef}
            value={item.value ?? ''}
            onChange={(e) => applyValue({ ...item, value: e.target.value })}
        />
    )
}

function TimeHHmmInput(props: GridFilterInputValueProps) {
    const { item, applyValue, focusElementRef } = props
    return (
        <TextField
            variant="standard"
            type="time"
            inputRef={focusElementRef}
            value={item.value ?? ''}
            onChange={(e) => applyValue({ ...item, value: e.target.value })}
            inputProps={{ step: 60 }} // 1-minute steps
        />
    )
}

// Server mode: getApplyFilterFn can be null.
const dateOps: GridFilterOperator[] = [
    { label: 'Es', value: 'dateEquals', getApplyFilterFn: () => null, InputComponent: DateISOInput },
    { label: 'Después de', value: 'dateAfter', getApplyFilterFn: () => null, InputComponent: DateISOInput },
    { label: 'Desde', value: 'dateOnOrAfter', getApplyFilterFn: () => null, InputComponent: DateISOInput },
    { label: 'Antes de', value: 'dateBefore', getApplyFilterFn: () => null, InputComponent: DateISOInput },
    { label: 'Hasta', value: 'dateOnOrBefore', getApplyFilterFn: () => null, InputComponent: DateISOInput },
]

const timeOps: GridFilterOperator[] = [
    { label: 'Es', value: 'timeEquals', getApplyFilterFn: () => null, InputComponent: TimeHHmmInput },
    { label: 'Después de', value: 'timeAfter', getApplyFilterFn: () => null, InputComponent: TimeHHmmInput },
    { label: 'Desde', value: 'timeOnOrAfter', getApplyFilterFn: () => null, InputComponent: TimeHHmmInput },
    { label: 'Antes de', value: 'timeBefore', getApplyFilterFn: () => null, InputComponent: TimeHHmmInput },
    { label: 'Hasta', value: 'timeOnOrBefore', getApplyFilterFn: () => null, InputComponent: TimeHHmmInput },
]

export const dateFromDatetimeColumn = (opts: {
    field: string                 // e.g. "begins_at_date"
    datetimeField: string         // e.g. "begins_at"
    headerName: string
}): GridColDef => ({
    field: opts.field,
    headerName: opts.headerName,
    filterable: true,
    sortable: true,
    filterOperators: dateOps,
    valueGetter: (_v, row) => dayjs(row?.[opts.datetimeField]).format('DD/MM/YYYY'),
    renderCell: ({ value }) => <>{value}</>,
})

export const timeFromDatetimeColumn = (opts: {
    field: string                 // e.g. "begins_at_time"
    datetimeField: string         // e.g. "begins_at"
    headerName: string
}): GridColDef => ({
    field: opts.field,
    headerName: opts.headerName,
    filterable: true,
    sortable: true,
    filterOperators: timeOps,
    valueGetter: (_v, row) => dayjs(row?.[opts.datetimeField]).format('HH:mm'),
    renderCell: ({ value }) => <>{value}</>,
})
