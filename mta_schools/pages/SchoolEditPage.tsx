'use client'

import SchoolEditForm from '@/mta_schools/components/SchoolEditForm'
import { useNavigateToSchoolList, useSchoolDelete, useSchoolDetail } from '@/mta_schools/hooks'
import { I_SchoolDetail } from '@/mta_schools/types'
import Page from '@/shared/components/Page'
import Spinner from '@/shared/components/Spinner'
import { useConfirm } from '@/shared/confirm'
import { successToast } from '@/shared/toasts'
import DeleteIcon from '@mui/icons-material/Delete'
import { Button } from '@mui/material'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ClearIcon from '@mui/icons-material/Clear'

const SchoolEditPage = () => {
  const schoolDetail = useSchoolDetail()
  const schoolDelete = useSchoolDelete()
  const navigateToSchoolList = useNavigateToSchoolList()
  const { ConfirmDialogComponent, showConfirm } = useConfirm()

  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<I_SchoolDetail | undefined>(undefined)

  const handleDelete = () => {
    showConfirm(`Eliminar escuela #${id}`, '¿Estás seguro/a que querés eliminar esta Escuela?').then(() => {
      schoolDelete(Number(id)).then(() => {
        successToast('Escuela eliminada correctamente.')
        navigateToSchoolList()
      })
    })
  }

  useEffect(() => {
    schoolDetail(Number(id)).then(setData)
  }, [id])

  return (
    <>
      <Page>
        <Page.Title>Editar Escuela</Page.Title>
        <Page.Toolbar>
          <Button onClick={navigateToSchoolList} startIcon={<ClearIcon />}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} startIcon={<DeleteIcon />}>
            Eliminar
          </Button>
        </Page.Toolbar>
        <Page.Content>{data === undefined ? <Spinner /> : <SchoolEditForm data={data} />}</Page.Content>
      </Page>
      <ConfirmDialogComponent />
    </>
  )
}

export default SchoolEditPage
