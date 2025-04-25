import { T_UserProfiles } from '@/mta_users/types'

/**
 * Translates user profiles to Spanish labels.
 * @param profile - The user profile to translate.
 * @returns The Spanish label for the given profile.
 */
const userProfileLabel = (profile: T_UserProfiles): string => {
  const profileTranslations: Record<T_UserProfiles, string> = {
    admin: 'Administrador',
    school_staff: 'Staff de escuelas',
    evaluator: 'Itemista',
    student: 'Estudiante',
  }

  return profileTranslations[profile]
}

export { userProfileLabel }
