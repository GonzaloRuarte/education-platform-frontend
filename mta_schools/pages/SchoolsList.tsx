"use client"

import { schoolsList, T_GetSchoolsListResponse } from '@/mta_schools/services'
import Page from '@/shared/components/Page'
import { alpha, styled } from '@mui/material'
import { DataGrid, gridClasses, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import React, { useEffect } from 'react'

const columns: Array<GridColDef> = [
  { field: 'id', headerName: '#' },
  { field: 'name', headerName: 'Nombre', flex: 2 },
  { field: 'district', headerName: 'Distrito', flex: 1 },
  { field: 'contact_email', headerName: 'Contacto', flex: 1 },
]

const ODD_OPACITY = 0.2;

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: theme.palette.grey[100],
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    '&.Mui-selected': {
      backgroundColor: alpha(
        theme.palette.primary.main,
        ODD_OPACITY + theme.palette.action.selectedOpacity,
      ),
      '&:hover': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY +
          theme.palette.action.selectedOpacity +
          theme.palette.action.hoverOpacity,
        ),
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: alpha(
            theme.palette.primary.main,
            ODD_OPACITY + theme.palette.action.selectedOpacity,
          ),
        },
      },
    },
  },
}));

const SchoolsList = () => {
  const [pm, setPm] = React.useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });

  const [data, setData] = React.useState<T_GetSchoolsListResponse | undefined>(undefined)

  useEffect(() => {
    schoolsList({ page: pm.page + 1, page_size: pm.pageSize })
      .then(res => {
        setData(res);
      })
  }, [pm])

  return <Page>
    <Page.Title>Escuelas</Page.Title>
    <Page.Content>
      <StripedDataGrid
        rows={data?.results} columns={columns}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
        }
        paginationModel={pm}
        pageSizeOptions={[2, 5, 10]}
        onPaginationModelChange={setPm}
        paginationMode='server'
        loading={data === undefined}
        rowCount={data?.count || 0}
      />
    </Page.Content>
  </Page>
}

export default SchoolsList
