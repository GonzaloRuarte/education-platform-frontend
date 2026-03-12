import { T_UserProfiles } from '@/mta_users/types'

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
    grouping_staff: 'Responsable de agrupamiento',
    grouping_staff_anonymized: 'Resp. agrupamiento (anon)',
  }

  return profileTranslations[profile]
}

export { userProfileLabel }
