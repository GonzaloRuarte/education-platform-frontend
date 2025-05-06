'use client'

import React from 'react'
import { Chip, ChipProps } from '@mui/material'
import { blue, green, orange, red } from '@mui/material/colors'
import { T_UserProfiles } from '@/mta_users/types'
import { userProfileLabel } from '@/mta_users/utils'

interface I_UserProfileChipProps extends ChipProps {
  profile: T_UserProfiles
}

const profileColors: Record<T_UserProfiles, string> = {
  admin: red[500],
  evaluator: blue[500],
  student: green[500],
  school_staff: orange[500],
}

const UserProfileChip: React.FC<I_UserProfileChipProps> = ({ profile, ...props }) => {
  return (
    <Chip
      label={userProfileLabel(profile)} // Capitalize the profile name
      sx={{
        backgroundColor: props.variant === 'outlined' ? undefined : profileColors[profile],
        color: props.variant === 'outlined' ? profileColors[profile] : 'white',
        borderColor: profileColors[profile],
        // fontWeight: 'bold',
      }}
      {...props}
    />
  )
}

export default UserProfileChip
