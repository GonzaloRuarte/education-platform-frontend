'use client'

import { I_EvaluationToResolve, I_ResolutionState } from '@/mta_resolutions/types'
import { T_AppointmentId } from '@/mta_schedule/types'

const DB_NAME = 'assessment_resolution_offline'
const DB_VERSION = 1
const STORE_NAME = 'resolution_snapshots'
const ACTIVE_SNAPSHOT_KEY_STORAGE = 'assessment_resolution-active-snapshot-key'

export interface I_ResolutionOfflineSnapshotMetadata {
  resolution_startedAt: string | null
  resolution_submitByTime: string | null
  resolution_serverNowAtSync: string | null
  resolution_maxDurationMinutes: number | null
  resolution_pin: number | null
  resolution_lastUpload: string | null
  resolution_serverStateToken: string | null
  resolution_hasUnsyncedLocalChanges: boolean
  resolution_successfulResumeIdentityKey: string | null
}

export interface I_ResolutionOfflineSnapshot {
  key: string
  updatedAt: string
  evaluation: I_EvaluationToResolve | null
  state: I_ResolutionState | null
  metadata: I_ResolutionOfflineSnapshotMetadata
}

const defaultMetadata = (): I_ResolutionOfflineSnapshotMetadata => ({
  resolution_startedAt: null,
  resolution_submitByTime: null,
  resolution_serverNowAtSync: null,
  resolution_maxDurationMinutes: null,
  resolution_pin: null,
  resolution_lastUpload: null,
  resolution_serverStateToken: null,
  resolution_hasUnsyncedLocalChanges: false,
  resolution_successfulResumeIdentityKey: null,
})

const ensureClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('offlineStorage can only run in the browser')
  }
}

export const buildResolutionOfflineKey = (appointmentId: T_AppointmentId, studentPersonalId: string) =>
  `appointment:${appointmentId}::student:${studentPersonalId}`

export const buildResolutionOfflineKeyFromState = (state: I_ResolutionState) =>
  buildResolutionOfflineKey(state.appointment_id, state.student_personal_id)

const openDb = (): Promise<IDBDatabase> => {
  ensureClient()

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'))
  })
}

const getSnapshot = async (key: string): Promise<I_ResolutionOfflineSnapshot | null> => {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(key)

    request.onsuccess = () => resolve((request.result as I_ResolutionOfflineSnapshot | undefined) ?? null)
    request.onerror = () => reject(request.error ?? new Error('Failed to read snapshot'))
    tx.oncomplete = () => db.close()
    tx.onerror = () => reject(tx.error ?? new Error('Failed to read snapshot'))
  })
}


const putSnapshot = async (snapshot: I_ResolutionOfflineSnapshot): Promise<void> => {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)

    store.put(snapshot)

    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => reject(tx.error ?? new Error('Failed to write snapshot'))
    tx.onabort = () => reject(tx.error ?? new Error('Write transaction aborted'))
  })
}

const deleteSnapshot = async (key: string): Promise<void> => {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)

    store.delete(key)

    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => reject(tx.error ?? new Error('Failed to delete snapshot'))
    tx.onabort = () => reject(tx.error ?? new Error('Delete transaction aborted'))
  })
}


export const setActiveResolutionSnapshotKey = (key: string) => {
  ensureClient()
  window.localStorage.setItem(ACTIVE_SNAPSHOT_KEY_STORAGE, key)
}

export const getActiveResolutionSnapshotKey = (): string | null => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(ACTIVE_SNAPSHOT_KEY_STORAGE)
}

export const clearActiveResolutionSnapshotKey = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(ACTIVE_SNAPSHOT_KEY_STORAGE)
}

export const getStrictActiveResolutionSnapshot = async (): Promise<I_ResolutionOfflineSnapshot | null> => {
  const activeKey = getActiveResolutionSnapshotKey()
  if (!activeKey) return null
  return getSnapshot(activeKey)
}

export const getResolutionSnapshotByIdentity = async (
  appointmentId: T_AppointmentId,
  studentPersonalId: string,
): Promise<I_ResolutionOfflineSnapshot | null> => {
  return getSnapshot(buildResolutionOfflineKey(appointmentId, studentPersonalId))
}

export const persistResolutionSnapshot = async (args: {
  key?: string
  state?: I_ResolutionState | null
  evaluation?: I_EvaluationToResolve | null
  metadata?: Partial<I_ResolutionOfflineSnapshotMetadata>
}): Promise<I_ResolutionOfflineSnapshot> => {
  const { state = null, evaluation = null, metadata } = args

  const resolvedKey = args.key ?? (state ? buildResolutionOfflineKeyFromState(state) : null)
  if (!resolvedKey) {
    throw new Error('Cannot persist resolution snapshot without a key or a resolution state')
  }

  const existing = await getSnapshot(resolvedKey)

  const next: I_ResolutionOfflineSnapshot = {
    key: resolvedKey,
    updatedAt: new Date().toISOString(),
    evaluation: evaluation ?? existing?.evaluation ?? null,
    state: state ?? existing?.state ?? null,
    metadata: {
      ...defaultMetadata(),
      ...(existing?.metadata ?? {}),
      ...(metadata ?? {}),
    },
  }

  await putSnapshot(next)
  setActiveResolutionSnapshotKey(resolvedKey)

  return next
}

export const persistResolutionStateSnapshot = async (
  state: I_ResolutionState,
  metadata?: Partial<I_ResolutionOfflineSnapshotMetadata>,
) => {
  return persistResolutionSnapshot({
    key: buildResolutionOfflineKeyFromState(state),
    state,
    metadata,
  })
}

export const clearResolutionOfflineDataForKey = async (key: string | null | undefined) => {
  if (typeof window === 'undefined' || !key) return

  const activeKey = getActiveResolutionSnapshotKey()
  if (activeKey === key) {
    clearActiveResolutionSnapshotKey()
  }

  await deleteSnapshot(key)
}

export const clearResolutionOfflineDataForIdentity = async (
  appointmentId: T_AppointmentId,
  studentPersonalId: string,
) => {
  await clearResolutionOfflineDataForKey(buildResolutionOfflineKey(appointmentId, studentPersonalId))
}

export const clearCurrentResolutionOfflineData = async (resolutionState?: I_ResolutionState | null) => {
  const key = resolutionState
    ? buildResolutionOfflineKeyFromState(resolutionState)
    : getActiveResolutionSnapshotKey()

  await clearResolutionOfflineDataForKey(key)
}
