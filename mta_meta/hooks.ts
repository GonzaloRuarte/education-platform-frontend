import { useAuthResources, useUserProfilesResources } from '@/mta_auth/hooks'
import { axiosGet, axiosPost } from '@/shared/data/axios'
import {
  actionHook,
  detailHook,
  listHook,
  dynamicNavigationHook,
  navigationHook,
} from '@/shared/hooks'
import { actionHookV3 } from '@/shared/hooks/dataServices/v3'
import pages from '@/pages'
import { metaReportsDetailPath } from '@/pages'

import {
  I_MetaReportBundleListItem,
  T_MetaReportBundleId,
  T_MetaReportBundleList,
  I_MetaReportGlobalBundleListItem,
} from '@/mta_meta/types'

const META_REPORTS_PATH = '/meta-reports'
const META_REPORTS_GLOBAL_PATH = '/meta-reports-global'

// -----------------
// Global report hooks
// -----------------
// Latest DONE global bundle
const useMetaReportGlobalLatestAction = actionHookV3<
  `${typeof META_REPORTS_GLOBAL_PATH}/latest`,
  undefined,
  I_MetaReportGlobalBundleListItem
>(`${META_REPORTS_GLOBAL_PATH}/latest`, axiosGet, useAuthResources)

const useMetaReportGlobalLatestBySchoolIdAction = actionHookV3<
  `${typeof META_REPORTS_GLOBAL_PATH}/latest?school_id={schoolId:number}`,
  undefined,
  I_MetaReportGlobalBundleListItem
>(`${META_REPORTS_GLOBAL_PATH}/latest?school_id={schoolId:number}`, axiosGet, useAuthResources)

// Manual GET actions (manifest/artifacts/datasets)
const useMetaReportGlobalManifestAction = actionHookV3<
  `${typeof META_REPORTS_GLOBAL_PATH}/{bundleId:number}/manifest`,
  undefined,
  any
>(`${META_REPORTS_GLOBAL_PATH}/{bundleId:number}/manifest`, axiosGet, useAuthResources)

const useMetaReportGlobalArtifactAction = actionHookV3<
  `${typeof META_REPORTS_GLOBAL_PATH}/{bundleId:number}/artifact?name={name:string}`,
  undefined,
  any
>(`${META_REPORTS_GLOBAL_PATH}/{bundleId:number}/artifact?name={name:string}`, axiosGet, useAuthResources)

const useMetaReportGlobalDatasetAction = actionHookV3<
  `${typeof META_REPORTS_GLOBAL_PATH}/{bundleId:number}/dataset?grade={grade:number}&subjects={subjects:string}&name={name:string}`,
  undefined,
  any
>(
  `${META_REPORTS_GLOBAL_PATH}/{bundleId:number}/dataset?grade={grade:number}&subjects={subjects:string}&name={name:string}`,
  axiosGet,
  useAuthResources,
)

// Chat (POST)
const useMetaReportGlobalChatAction = actionHookV3<
  `${typeof META_REPORTS_GLOBAL_PATH}/{bundleId:number}/chat`,
  { message: string; filters?: any },
  any
>(`${META_REPORTS_GLOBAL_PATH}/{bundleId:number}/chat`, axiosPost, useAuthResources)

// Generate all (POST)
const useMetaReportGlobalGenerateAll = actionHook<{ force_new_version?: boolean; grades?: number[] }, any>(
  `${META_REPORTS_GLOBAL_PATH}/generate-all`,
  axiosPost,
  useAuthResources,
)

// Lists
const useMetaReportBundleList = listHook<T_MetaReportBundleList>(META_REPORTS_PATH, axiosGet, useAuthResources)
const useMetaReportBundleListByUserSchool = listHook<T_MetaReportBundleList>(
  `${META_REPORTS_PATH}/list-by-user-school`,
  axiosGet,
  useAuthResources,
)

// Detail
const useMetaReportBundleDetail = detailHook<T_MetaReportBundleId, I_MetaReportBundleListItem>(
  META_REPORTS_PATH,
  axiosGet,
  useAuthResources,
)

// Actions
const useMetaReportGenerate = actionHook<{ arp_id: number; force_new_version?: boolean; grades?: number[] }, any>(
  `${META_REPORTS_PATH}/generate`,
  axiosPost,
  useAuthResources,
)

// GET actions (manual execution) using v3 dynamic path params
const useMetaReportManifestAction = actionHookV3<
  `${typeof META_REPORTS_PATH}/{bundleId:number}/manifest`,
  undefined,
  any
>(`${META_REPORTS_PATH}/{bundleId:number}/manifest`, axiosGet, useAuthResources)

const useMetaReportArtifactAction = actionHookV3<
  `${typeof META_REPORTS_PATH}/{bundleId:number}/artifact?name={name:string}`,
  undefined,
  any
>(`${META_REPORTS_PATH}/{bundleId:number}/artifact?name={name:string}`, axiosGet, useAuthResources)

const useMetaReportDatasetAction = actionHookV3<
  `${typeof META_REPORTS_PATH}/{bundleId:number}/dataset?grade={grade:number}&subjects={subjects:string}&name={name:string}`,
  undefined,
  any
>(
  `${META_REPORTS_PATH}/{bundleId:number}/dataset?grade={grade:number}&subjects={subjects:string}&name={name:string}`,
  axiosGet,
  useAuthResources,
)

// Navigation
const useNavigateToMetaReportList = navigationHook(pages.D._.reportes._.meta.path)
const useNavigateToMetaReportDetail = dynamicNavigationHook(metaReportsDetailPath)

// Helper: choose best list hook based on profile
const useMetaReportListHook = () => {
  const { isAdmin } = useUserProfilesResources()
  return isAdmin ? useMetaReportBundleList : useMetaReportBundleListByUserSchool
}

export {
  META_REPORTS_PATH,
  META_REPORTS_GLOBAL_PATH,
  useMetaReportBundleList,
  useMetaReportBundleListByUserSchool,
  useMetaReportBundleDetail,
  useMetaReportGenerate,
  useMetaReportManifestAction,
  useMetaReportArtifactAction,
  useMetaReportDatasetAction,
  useNavigateToMetaReportList,
  useNavigateToMetaReportDetail,
  useMetaReportListHook,
  // Global
  useMetaReportGlobalLatestAction,
  useMetaReportGlobalLatestBySchoolIdAction,
  useMetaReportGlobalManifestAction,
  useMetaReportGlobalArtifactAction,
  useMetaReportGlobalDatasetAction,
  useMetaReportGlobalChatAction,
  useMetaReportGlobalGenerateAll,
}
