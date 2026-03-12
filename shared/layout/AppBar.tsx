'use client'

import LogoutButton from '@/mta_auth/components/LogoutButton'
import { useHasCapabilities } from '@/mta_auth/hooks'
import { useSchoolScopeResources, useSchoolSetSelectedSchool } from '@/mta_schools/hooks/state'
import { useUserWhoIAmData } from '@/mta_users/hooks'
import Bold from '@/shared/components/Bold'
import MagicGrid from '@/shared/components/MagicGrid'
import { Avatar, FormControl, MenuItem, Select } from '@mui/material'
import MUI_AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'

import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

const AppBar = () => {
  const whoIAm = useUserWhoIAmData()
  const { accessibleSchools, selectedSchool, shouldSelectSchool, isLoading } = useSchoolScopeResources()
  const setSelectedSchool = useSchoolSetSelectedSchool()
  const isAdminManager = useHasCapabilities(['manage_admin_users'])
  const nameAndSurname =
    whoIAm?.first_name !== null ? `${whoIAm?.first_name} ${whoIAm?.last_name} (${whoIAm?.username})` : null

  return (
    <>
      <MUI_AppBar elevation={0} sx={{ position: 'relative', borderBottom: `1px solid #CCC` }}>
        <Toolbar>
          {whoIAm !== undefined && (
            <Typography noWrap>
              Buenos días, <Bold>{nameAndSurname !== null ? nameAndSurname : whoIAm.username}</Bold>
            </Typography>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {!isLoading && !isAdminManager && shouldSelectSchool && accessibleSchools !== undefined && (
            <FormControl size="small" sx={{ minWidth: 220, mr: 2 }}>
              <Select
                value={selectedSchool?.id ?? ''}
                displayEmpty
                onChange={(event) => {
                  const nextSchool = accessibleSchools.find((school) => school.id === Number(event.target.value)) ?? null
                  setSelectedSchool(nextSchool)
                }}
              >
                {accessibleSchools.map((school) => (
                  <MenuItem key={school.id} value={school.id}>
                    {school.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {!isLoading && !isAdminManager && !shouldSelectSchool && selectedSchool !== null && selectedSchool !== undefined && (
            <Typography noWrap sx={{ mr: 2 }}>
              {selectedSchool.name}
            </Typography>
          )}
          <MagicGrid itemSize="auto">
            <LogoutButton />
            <Avatar alt="Admin">{whoIAm !== undefined && whoIAm.username.slice(0, 1).toUpperCase()}</Avatar>
          </MagicGrid>
        </Toolbar>
      </MUI_AppBar>
    </>
  )
}

export default AppBar
