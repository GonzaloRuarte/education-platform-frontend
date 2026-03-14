'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import GroupingUpdateForm from '@/mta_schools/components/GroupingUpdateForm'
import { GROUPING_NAME } from '@/mta_schools/constants'
import { useGroupingDelete, useGroupingDetail, useNavigateToGroupingList } from '@/mta_schools/hooks'
import EditionPage from '@/shared/pages/EditionPage'

const GroupingEditPage = () => (
  <EditionPage
    EditionForm={GroupingUpdateForm}
    entityName={GROUPING_NAME}
    useDelete={useGroupingDelete}
    useDetail={useGroupingDetail}
    onExit={useNavigateToGroupingList()}
  />
)

export default withAuth(GroupingEditPage, {
  allowedCapabilities: ['manage_groupings'],
  logoutDestination: 'dashboard',
})
