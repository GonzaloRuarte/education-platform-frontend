import {
  I_UserListItem,
  I_UserListItemWithProfiles,
  T_UserList,
  T_UserListWithProfiles,
  T_UserProfiles,
} from '@/mta_users/types'

/**
 * Translates user profiles to Spanish labels.
 * @param profile - The user profile to translate.
 * @returns The Spanish label for the given profile.
 */
const userProfileLabel = (profile: T_UserProfiles): string => {
  const profileTranslations: Record<T_UserProfiles, string> = {
    admin: 'Admin',
    school_staff: 'R. Institucional',
    evaluator: 'Itemista',
    student: 'Estudiante',
    superuser: 'Superusuario',
    executive: 'Ejecutivo',
  }

  return profileTranslations[profile]
}

const userListItemWithProfiles = (dirtyUser: I_UserListItem): I_UserListItemWithProfiles => {
  const { has_evaluator_profile, has_school_staff_profile, has_student_profile, is_admin, has_executive_profile, ...rest } = dirtyUser
  const profiles: Array<T_UserProfiles> = []

  if (has_evaluator_profile) profiles.push('evaluator')
  if (has_school_staff_profile) profiles.push('school_staff')
  if (has_student_profile) profiles.push('student')
  if (is_admin) profiles.push('admin')
  if (has_executive_profile) profiles.push('executive')
  // if (is_superuser) profiles.push('superuser')

  return { ...rest, profiles }
}

const userListWithProfiles = ({ results, ...rest }: T_UserList): T_UserListWithProfiles => {
  return {
    ...rest,
    results: results.map(userListItemWithProfiles),
  }
}

export { userProfileLabel, userListWithProfiles }
