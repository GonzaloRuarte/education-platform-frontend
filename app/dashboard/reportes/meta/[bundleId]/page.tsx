import { redirect } from 'next/navigation'

export default function MetaReportBundleRedirectPage() {
  // The micro bundle detail UI is intentionally hidden.
  // All users should use the single Global META report UI.
  redirect('/dashboard/reportes/meta')
}
