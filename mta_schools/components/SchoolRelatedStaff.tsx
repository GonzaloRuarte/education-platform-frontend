'use client'

import { useSchoolStaffProfileList } from '@/mta_schools/hooks'
import { T_SchoolId } from '@/mta_schools/types'
import pages, { pathWithId } from '@/pages'
import Chip from '@/shared/components/Chip'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import { Body2, H4 } from '@/shared/components/Typography'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import Link from 'next/link'

interface I_Props {
  schoolId: T_SchoolId
}

const displayName = (staff: { first_name: string | null; last_name: string | null; username: string }) => {
  const fullName = [staff.first_name, staff.last_name].filter(Boolean).join(' ').trim()
  return fullName || staff.username
}

export default function SchoolRelatedStaff({ schoolId }: I_Props) {
  const staff = useSchoolStaffProfileList({
    page_size: 100,
    externalFilters: { school_id: schoolId },
  })

  return (
    <>
      <Spacer />
      <H4>Responsables institucionales</H4>
      <Spacer size="s" />
      {staff.isLoading && staff.data === undefined ? (
        <Spinner />
      ) : staff.data === undefined || staff.data.results.length === 0 ? (
        <Body2>No hay responsables institucionales asociados.</Body2>
      ) : (
        <MagicGrid itemSize="auto">
          {staff.data.results.map((member) => (
            <Link key={member.id} href={pathWithId(pages.D._.usuarios._.responsableInstitucional.path, member.id)}>
              <Chip
                icon={<AccountCircleIcon />}
                label={`${displayName(member)} <${member.email}>`}
              />
            </Link>
          ))}
        </MagicGrid>
      )}
    </>
  )
}
