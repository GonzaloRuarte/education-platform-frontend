'use client'

import { redirect } from 'next/navigation'

export default function MetaReportBundleRedirectPage() {
  // Micro bundle pages are intentionally hidden. Always send users to the global report.
  redirect('/dashboard/reportes/meta')
}
