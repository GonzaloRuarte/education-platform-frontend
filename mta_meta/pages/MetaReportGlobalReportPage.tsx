'use client'

import { apiUrl } from '@/config'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import Page from '@/shared/components/Page'
import { useStore } from '@/shared/state'

// This page embeds the original Flask (D3) UI 1:1, but routes all XHR/fetch
// through our Django REST endpoints (scoped by user role).

declare global {
  interface Window {
    __metaReportApiBase?: string
    __metaReportFetchParent?: typeof fetch
  }
}

const IFRAME_SRC = '/meta_report/index.html'

const buildAuthedRequest = (input: RequestInfo | URL, init: RequestInit | undefined, token?: string) => {
  const baseHeaders = input instanceof Request ? new Headers(input.headers) : new Headers()
  const initHeaders = init?.headers ? new Headers(init.headers as any) : new Headers()

  // merge init headers over base
  initHeaders.forEach((v, k) => baseHeaders.set(k, v))

  if (token && !baseHeaders.has('Authorization')) {
    baseHeaders.set('Authorization', `Bearer ${token}`)
  }

  // If input is a Request, clone it to allow header override.
  if (input instanceof Request) {
    const mergedInit: RequestInit = {
      method: init?.method ?? input.method,
      body: init?.body ?? (input as any).body,
      mode: init?.mode ?? input.mode,
      credentials: init?.credentials ?? input.credentials,
      cache: init?.cache ?? input.cache,
      redirect: init?.redirect ?? input.redirect,
      referrer: init?.referrer ?? input.referrer,
      referrerPolicy: init?.referrerPolicy ?? input.referrerPolicy,
      integrity: init?.integrity ?? input.integrity,
      keepalive: init?.keepalive ?? (input as any).keepalive,
      signal: init?.signal ?? input.signal,
      headers: baseHeaders,
    }
    return new Request(input.url, mergedInit)
  }

  return new Request(String(input), { ...init, headers: baseHeaders })
}

const metaReportFetchParent: typeof fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const state = useStore.getState()
  const accessToken = state.auth_accessToken
  const refreshToken = state.auth_refreshToken

  const doFetch = async (token?: string) => {
    const req = buildAuthedRequest(input, init, token)
    return fetch(req)
  }

  let res = await doFetch(accessToken)

  // Try refresh once on 401
  if (res.status === 401 && refreshToken) {
    try {
      const refreshRes = await fetch(apiUrl('/token/refresh/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (refreshRes.ok) {
        const data: any = await refreshRes.json()
        if (data?.access) {
          useStore.getState().auth_storeRefreshedToken(String(data.access))
          res = await doFetch(String(data.access))
        }
      } else {
        // Fatal auth issue
        useStore.getState().auth_clearAuthData()
      }
    } catch {
      useStore.getState().auth_clearAuthData()
    }
  }

  return res
}

const MetaReportGlobalReportPage = () => {
  // Expose helpers to the embedded UI (same-origin iframe)
  if (typeof window !== 'undefined') {
    window.__metaReportApiBase = apiUrl('/meta-reports-global/flask')
    window.__metaReportFetchParent = metaReportFetchParent
  }

  return (
    <Page>
      <Page.Title disableMarginBottom>Reporte META+</Page.Title>
      <Page.Content>
        <div style={{ width: '100%', height: 'calc(100vh - 120px)' }}>
        <iframe
          title="Reporte META+"
          src={IFRAME_SRC}
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </div>
      </Page.Content>
    </Page>
  )
}

export default withAuth(MetaReportGlobalReportPage, {
  allowedUserProfiles: ['admin', 'school_staff', 'executive'],
  logoutDestination: 'dashboard',
})
