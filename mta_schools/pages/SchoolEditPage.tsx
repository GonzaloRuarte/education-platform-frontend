'use client'

import SchoolEditForm from '@/mta_schools/components/SchoolEditForm'
import { useSchoolDetail } from '@/mta_schools/hooks'
import { I_SchoolDetail } from '@/mta_schools/types'
import Page from '@/shared/components/Page'
import Spinner from '@/shared/components/Spinner'
import { CircularProgress } from '@mui/material'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const SchoolEditPage = () => {
  const { id } = useParams<{ id: string }>()
  const schoolDetail = useSchoolDetail()
  const [data, setData] = useState<I_SchoolDetail | undefined>(undefined)
  useEffect(() => {
    schoolDetail(Number(id)).then(setData)
  }, [id])
  return (
    <Page>
      <Page.Title>Editar Escuela</Page.Title>
      <Page.Content>{data === undefined ? <Spinner /> : <SchoolEditForm data={data} />}</Page.Content>
    </Page>
  )
}

export default SchoolEditPage
