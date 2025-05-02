import { useStore } from '@/shared/state'

// State
const useSchoolOwnSchool = () => useStore((state) => state.school_ownSchool)
const useSchoolStoreOwnSchool = () => useStore((state) => state.school_storeOwnSchool)

export { useSchoolOwnSchool, useSchoolStoreOwnSchool }
