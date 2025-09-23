import ApiError from '@/shared/data/errors'



const TAG_RE = /^[a-z0-9]+$/i;

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


export { parseTags, findFirstInvalid, normalizeTagsForTransport };