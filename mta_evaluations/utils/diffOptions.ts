// utils/diffOptions.ts
export type Option = { id: number | null; name: string; content: string; is_true: boolean }

export function diffOptions(original: Option[], next: Option[]) {
  const origMap = new Map(original.map(o => [o.id, o]))

  const toCreate = next.filter(o => o.id == null || o.id < 0).map(({ id, ...rest }) => rest)

  const toDelete = original
    .filter(o => !next.some(n => n.id === o.id))
    .map(o => o.id!)
  
  const toUpdate = next.filter(o => {
    if (o.id == null || o.id < 0) return false
    const orig = origMap.get(o.id)!
    return (o.name !== orig.name) || (o.content !== orig.content) || (o.is_true !== orig.is_true)
  })

  return { toCreate, toDelete, toUpdate }
}
