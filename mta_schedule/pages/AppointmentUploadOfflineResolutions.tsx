'use client'

import { LIGHT_BG_COLOR } from '@/config'
import { APPOINTMENT_RESOLUTION_PROCESS_NAME } from '@/mta_resolutions/constants'
import { useResolutionUploadOfflineState } from '@/mta_resolutions/hooks/data'
import { useNavigateToAppointmentHome, useNavigateToAppointmentList } from '@/mta_schedule/hooks'
import Button from '@/shared/components/Button'
import { BackButton, DeleteButton } from '@/shared/components/buttons'
import Chip from '@/shared/components/Chip'
import MagicGrid from '@/shared/components/MagicGrid'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import { H3, H4 } from '@/shared/components/Typography'
import ApiError from '@/shared/data/errors'
import { useTheme } from '@/shared/hooks'
import { errorCodeLabels } from '@/shared/labels'
import { handleServiceError } from '@/shared/service'
import { errorToast, successToast, warningToast } from '@/shared/toasts'
import { Box, Grid2, LinearProgress } from '@mui/material'
import { AxiosError } from 'axios'
import React, { useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'

const AppointmentUploadOfflineResolutions = () => {
  const [files, setFiles] = React.useState<File[]>([])
  const [lastProcessedFileIndex, setLastProcessedFileIndex] = React.useState<number | null>(null)
  const [withErrorFiles, setWithErrorFiles] = React.useState<File[]>([])
  const [isUploading, setIsUploading] = React.useState(false)
  const progress = lastProcessedFileIndex !== null ? ((lastProcessedFileIndex + 1) / files.length) * 100 : 0

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles)
    setWithErrorFiles([])
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
  const t = useTheme()

  const navToAppointmentHome = useNavigateToAppointmentHome()
  const uploadOfflineState = useResolutionUploadOfflineState()

  const handleUpload = useCallback(() => {
    if (files.length === 0) {
      warningToast('No hay archivos para cargar')
      return
    }
    setWithErrorFiles([])
    setIsUploading(true)
  }, [files, lastProcessedFileIndex])

  useEffect(() => {
    if (!isUploading) return
    if (lastProcessedFileIndex === files.length - 1) {
      setIsUploading(false)
      setFiles([])
      setLastProcessedFileIndex(null)
      return
    }

    const formData = new FormData()
    const currentIndex = lastProcessedFileIndex === null ? 0 : lastProcessedFileIndex + 1
    formData.append('file', files[currentIndex])
    uploadOfflineState(formData)
      .then(() => {
        successToast('Archivo cargado correctamente')
        setLastProcessedFileIndex(currentIndex)
      })
      .catch((err: ApiError<AxiosError<any>>) => {
        if (
          err.rawError.response?.data?.error_code !== undefined &&
          err.rawError.response?.data?.error_code in errorCodeLabels
        ) {
          errorToast(errorCodeLabels[err.rawError.response?.data?.error_code])
        } else {
          handleServiceError(err)
        }
        setLastProcessedFileIndex(currentIndex)
        setWithErrorFiles((prev) => [...prev, files[currentIndex]])
      })
      .finally(() => {
        if (currentIndex === files.length - 1) {
          setIsUploading(false)
          setFiles([])
          setLastProcessedFileIndex(null)
          successToast('Todos los archivos han sido cargados')
        }
      })
  }, [isUploading, lastProcessedFileIndex])

  return (
    <Page>
      <Page.Title>Cargar {APPOINTMENT_RESOLUTION_PROCESS_NAME.plural} offline</Page.Title>
      <Page.Toolbar>
        <BackButton onClick={navToAppointmentHome} />
      </Page.Toolbar>
      <Page.Content>
        <Box>
          {!isUploading ? (
            <>
              <div
                style={{
                  background: LIGHT_BG_COLOR,
                  padding: 20,
                  borderRadius: 5,
                  border: '4px dashed',
                  borderColor: t.palette.primary.main,
                }}
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <H4>Arroje los archivos aquí</H4>
                ) : (
                  <H4>Arrastre y suelte algunos archivos aquí, o haga clic para seleccionar archivos</H4>
                )}
              </div>
              <Spacer size="l" />
              <Spacer size="l" />
            </>
          ) : (
            <>
              <H3>Subiendo archivos...</H3>
              <Spacer size="xs" />
              <LinearProgress value={progress} variant="determinate" sx={{ height: 15, borderRadius: 5 }} />
              <Spacer size="l" />
            </>
          )}
          <Grid2 container spacing={2} size={12}>
            <Grid2 size={6}>
              <H4>Archivos seleccionados:</H4>
              <Spacer />
              {!isUploading && <DeleteButton onClick={() => setFiles([])} color="error" />}
              <Spacer size="s" />
              <MagicGrid spacing={0}>
                {files.map((file) => (
                  <Chip key={file.name} label={file.name} color="primary" variant="outlined" sx={{ margin: 1 }} />
                ))}
              </MagicGrid>
            </Grid2>
            <Grid2 size={6}>
              {withErrorFiles.length > 0 && (
                <>
                  <H4>Archivos con error:</H4>
                  <Spacer />
                  <MagicGrid spacing={0}>
                    {withErrorFiles.map((file) => (
                      <Chip key={file.name} label={file.name} color="error" variant="outlined" sx={{ margin: 1 }} />
                    ))}
                  </MagicGrid>
                </>
              )}
            </Grid2>
          </Grid2>
        </Box>
        <Spacer size="l" />
        <Button onClick={handleUpload} color="primary">
          Cargar Archivos
        </Button>
        <Spacer size="xxl" />
      </Page.Content>
    </Page>
  )
}

export default AppointmentUploadOfflineResolutions
