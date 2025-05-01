'use client'

import { DEFAULT_PAGE_SIZE } from '@/config'
import AppointmentSchoolCard from '@/mta_schedule/components/AppointmentSchoolCard'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import { useAppointmentListByUserSchool } from '@/mta_schedule/hooks'
import Page from '@/shared/components/Page'
import Spinner from '@/shared/components/Spinner'
import { Box, Grid2, Pagination } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'

import React from 'react'
const pageCount = (itemsCount: number) => itemsCount / DEFAULT_PAGE_SIZE
const AppointmentSchoolDashboardPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get the current page from query params or default to 1
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  // Fetch data based on the current page
  const { data } = useAppointmentListByUserSchool({ page: currentPage, page_size: DEFAULT_PAGE_SIZE })

  // Handle page change
  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    router.push(`?page=${newPage}`)
  }

  return (
    <Page>
      <Page.Title>Listado de {APPOINTMENT_NAME.plural}</Page.Title>
      {data === undefined ? (
        <Spinner />
      ) : (
        <Page.Content>
          <Box>
            <Grid2 container spacing={5} size={12}>
              {data.results.map((appointment) => (
                <AppointmentSchoolCard key={appointment.id} data={appointment} />
              ))}
            </Grid2>
          </Box>
          {pageCount(data?.count) > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pageCount(data?.count)} // Total number of pages from the API
                page={currentPage} // Current page
                onChange={handlePageChange} // Handle page change
                color="primary"
              />
            </Box>
          )}
        </Page.Content>
      )}
    </Page>
  )
}

export default AppointmentSchoolDashboardPage
