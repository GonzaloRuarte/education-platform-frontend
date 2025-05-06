'use client'

import UserProfileChip from '@/mta_users/components/UserProfileChip'
import { T_UserProfiles } from '@/mta_users/types'
import MagicGrid from '@/shared/components/MagicGrid'
import { Dispatch, SetStateAction, useState } from 'react'

export interface I_UserListFilterData {
  is_admin: boolean | null
  has_student_profile: boolean | null
  has_school_staff_profile: boolean | null
  has_evaluator_profile: boolean | null
}

const profileNameAsUserFilter: Record<T_UserProfiles, keyof I_UserListFilterData> = {
  admin: 'is_admin',
  school_staff: 'has_school_staff_profile',
  evaluator: 'has_evaluator_profile',
  student: 'has_student_profile',
}

const UsersListFiltersControl = ({
  setFilters,
  filters,
}: {
  setFilters: Dispatch<SetStateAction<I_UserListFilterData>>
  filters: I_UserListFilterData
}) => {
  const buttons: Record<T_UserProfiles, { label: string }> = {
    admin: { label: 'Admin' },
    school_staff: { label: 'Personal de escuela' },
    evaluator: { label: 'Evaluador' },
    student: { label: 'Estudiante' },
  }

  return (
    <MagicGrid itemSize={'auto'}>
      {Object.entries(buttons).map(([profile, { label }]) => {
        return (
          <UserProfileChip
            variant={filters[profileNameAsUserFilter[profile]] === null ? 'filled' : 'outlined'}
            key={profile}
            profile={profile as T_UserProfiles}
            onClick={
              filters[profileNameAsUserFilter[profile]] === null
                ? () => {
                    setFilters((prev) => ({
                      ...prev,
                      [profileNameAsUserFilter[profile]]: false,
                    }))
                  }
                : () => {
                    setFilters((prev) => ({
                      ...prev,
                      [profileNameAsUserFilter[profile]]: null,
                    }))
                  }
            }
          />
        )
      })}
    </MagicGrid>
  )
}

export default UsersListFiltersControl

export const useUserListFilters = () => {
  const [filters, setFilters] = useState<I_UserListFilterData>({
    is_admin: null,
    has_student_profile: false,
    has_school_staff_profile: null,
    has_evaluator_profile: null,
  })

  return { filters, setFilters, UsersListFiltersControl }
}
