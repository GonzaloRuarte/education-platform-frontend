// hooks/useProgressSubmit.ts
'use client'

import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { normalizeTagsForTransport } from '@/mta_evaluations/components/Tags'

type MakePayload<TForm, TWire> = (f: TForm & { tags: string }) => TWire
type MutFn<TWire> = (wire: TWire) => Promise<any>

export function useProgressSubmit() {
  const { setInProgressStatus, setIsNotInProgress } = useInProgress()

  return async function submitWithTags<TForm extends { tags?: string }, TWire>(
    form: TForm,
    makePayload: MakePayload<any, TWire>,
    mutate: MutFn<TWire>,
    onSuccessMsg: string,
    onAfterSuccess: () => void,
  ) {
    setInProgressStatus(true)
    let tagsSemicolon = ''
    try {
      tagsSemicolon = normalizeTagsForTransport(form.tags ?? '')
    } catch (err) {
      handleServiceError(err)
      setIsNotInProgress()
      return
    }
    try {
      const wire = makePayload({ ...form, tags: tagsSemicolon })
      await mutate(wire)
      successToast(onSuccessMsg)
      onAfterSuccess()
    } catch (err) {
      handleServiceError(err)
    } finally {
      setInProgressStatus(false)
    }
  }
}
