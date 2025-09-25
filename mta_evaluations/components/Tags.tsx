import ApiError from '@/shared/data/errors'
import InputControlled from '@/shared/forms/InputControlled'
import type { Control, FieldValues, Path } from 'react-hook-form'

const TAG_RE = /^[a-z0-9_-]+$/i;

const parseTags = (raw: string) =>
  raw
    .split(/[;,\s]+/g)        // allow ; , or spaces between tags
    .map(t => t.trim())
    .filter(Boolean);

const findFirstInvalid = (tags: string[]) =>
  tags.find(t => !TAG_RE.test(t));


function normalizeTagsForTransport(raw: string): string {
  if (!raw?.trim()) return ''

  const tagsArray = parseTags(raw)
  const bad = findFirstInvalid(tagsArray)
  if (bad) {
    throw new ApiError({
      message: `Etiqueta inválida: "${bad}"`,
      status: 400,
      rawError: 'invalid_tag',
    })
  }

  return tagsArray.join(';')
}




type Props<T extends FieldValues> = {
  control: Control<T>
  name?: Path<T>
  label?: string
  optional?: boolean
}

export default function TagsFieldControlled<T extends FieldValues>({
  control,
  name,
  label = 'Etiquetas',
  optional = true,
}: Props<T>) {
  const tagsKey = (name ?? ('tags' as Path<T>))

  return (
    <InputControlled<T>
      control={control}
      name={tagsKey}
      label={label}
      placeholder="ej: algebra; ecuaciones; 2024-2025"
      title="Separá las etiquetas con ; , o espacio. Solo letras, números y guiones."
      rules={{
        validate: (value: string) => {
          if (optional && !value?.trim()) return true
          const arr = parseTags(value)
          const bad = findFirstInvalid(arr)
          if (bad) return `Etiqueta inválida: "${bad}". Solo letras, números y guiones.`
          return true
        },
      }}
    />
  )
}


export { parseTags, findFirstInvalid, normalizeTagsForTransport, TagsFieldControlled };