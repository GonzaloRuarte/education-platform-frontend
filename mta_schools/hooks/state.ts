import { useStore } from '@/shared/state'

const useSchoolAccessibleSchools = () => useStore((state) => state.school_accessibleSchools)
const useSchoolSelectedSchool = () => useStore((state) => state.school_selectedSchool)
const useSchoolStoreSchoolScope = () => useStore((state) => state.school_storeSchoolScope)
const useSchoolSetSelectedSchool = () => useStore((state) => state.school_setSelectedSchool)

const useSchoolScopeResources = () => {
  const accessibleSchools = useSchoolAccessibleSchools()
  const selectedSchool = useSchoolSelectedSchool()

  return {
    accessibleSchools,
    selectedSchool,
    isLoading: accessibleSchools === undefined || selectedSchool === undefined,
    hasSingleSchool: accessibleSchools !== undefined && accessibleSchools.length === 1,
    shouldSelectSchool: accessibleSchools !== undefined && accessibleSchools.length > 1,
    lockedSchool: accessibleSchools !== undefined && accessibleSchools.length === 1 ? accessibleSchools[0] : null,
  }
}

export {
  useSchoolAccessibleSchools,
  useSchoolSelectedSchool,
  useSchoolStoreSchoolScope,
  useSchoolSetSelectedSchool,
  useSchoolScopeResources,
}
