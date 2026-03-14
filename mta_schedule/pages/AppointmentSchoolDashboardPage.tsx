'use client'

import { DEFAULT_PAGE_SIZE } from '@/config'
import AppointmentSchoolCard from '@/mta_schedule/components/AppointmentSchoolCard'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import { useAppointmentListByUserSchool, useNavigateToAppointmentRequest } from '@/mta_schedule/hooks'
import { useSchoolScopeResources } from '@/mta_schools/hooks/state'
import Button from '@/shared/components/Button'
import { ReloadButton } from '@/shared/components/buttons'
import Page from '@/shared/components/Page'
import Spinner from '@/shared/components/Spinner'
import EditCalendarIcon from '@mui/icons-material/EditCalendar'
import { Box, Grid2, Pagination } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

const pageCount = (itemsCount: number) => Math.ceil(itemsCount / DEFAULT_PAGE_SIZE)

interface I_Props {
  canViewDetail: boolean
  canEditStudents: boolean
  canReschedule: boolean
}

const AppointmentSchoolDashboardPage = ({ canViewDetail, canEditStudents, canReschedule }: I_Props) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const navToAppointmentRequest = useNavigateToAppointmentRequest()
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const { selectedSchool, isLoading: isSchoolScopeLoading } = useSchoolScopeResources()
  const previousSchoolId = useRef<number | null | undefined>(selectedSchool?.id)

  useEffect(() => {
    const nextSchoolId = selectedSchool?.id
    if (previousSchoolId.current !== nextSchoolId) {
      previousSchoolId.current = nextSchoolId
      if (currentPage !== 1) {
        router.replace('?page=1')
      }
    }
  }, [selectedSchool?.id, currentPage, router])

  const { data, reload } = useAppointmentListByUserSchool({
    page: currentPage,
    page_size: DEFAULT_PAGE_SIZE,
    externalFilters: selectedSchool !== undefined && selectedSchool !== null ? { school_id: selectedSchool.id } : undefined,
  })

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    router.push(`?page=${newPage}`)
  }

  return (
    <Page>
      <Page.Title>Listado de {APPOINTMENT_NAME.plural}</Page.Title>
      <Page.Toolbar>
        <ReloadButton onClick={reload} />
        <Button color="warning" startIcon={<EditCalendarIcon />} onClick={navToAppointmentRequest}>
          Solicitar {APPOINTMENT_NAME.singular}
        </Button>
      </Page.Toolbar>
      {data === undefined || isSchoolScopeLoading ? (
        <Spinner />
      ) : (
        <Page.Content>
          <Box>
            <Grid2 container spacing={5}>
              {data.results.map((appointment) => (
                <Grid2
                  key={appointment.id}
                  size={{
                    xs: 12,
                    sm: 12,
                    md: 12,
                    lg: 6,
                    xl: 4,
                  }}
                >
                  <AppointmentSchoolCard
                    data={appointment}
                    onRescheduled={reload}
                    canViewDetail={canViewDetail}
                    canEditStudents={canEditStudents}
                    canReschedule={canReschedule}
                  />
                </Grid2>
              ))}
            </Grid2>
          </Box>
          {pageCount(data.count) > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination count={pageCount(data.count)} page={currentPage} onChange={handlePageChange} color="primary" />
            </Box>
          )}
        </Page.Content>
      )}
    </Page>
  )
}

export default AppointmentSchoolDashboardPage
