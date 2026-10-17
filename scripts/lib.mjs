export function slugify(folder) {
  return folder
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const SMALL_WORDS = new Set(['on', 'vs', 'vs.', 'to', 'into', 'with', 'and', 'the', 'of', 'in', 'a', 'or', 'for'])

function titleCase(text) {
  return text
    .toLowerCase()
    .split(' ')
    .map((word, i) => (i > 0 && SMALL_WORDS.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ')
}

export function titleFromFolder(folder) {
  const title = folder.replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
  return /[a-z]/.test(title) ? title : titleCase(title)
}

export function extractSourceUrl(html) {
  return html.match(/content="\d+;\s*url=([^"]+)"/i)?.[1] ?? null
}

const IMAGE = /\.(png|jpe?g)$/i
const isImage = (name) => IMAGE.test(name)
const isVariant = (name) => name.startsWith('drill-maker-') || name.startsWith('field_content_image')
const ext = (name) => (name.toLowerCase().endsWith('.png') ? 'png' : 'jpg')
const mainFirst = (a, b) => isVariant(a) - isVariant(b) || a.length - b.length || a.localeCompare(b)

export function dropDuplicateImages(files, hashOf) {
  const seen = new Set()
  const dropped = new Set()
  for (const f of [...files].filter(isImage).sort(mainFirst)) {
    const h = hashOf(f)
    if (seen.has(h)) dropped.add(f)
    seen.add(h)
  }
  return files.filter((f) => !dropped.has(f))
}

export function buildDrill(folder, files, html) {
  const id = slugify(folder)
  const dir = `drills/${id}`
  const [main, ...others] = files.filter(isImage).sort(mainFirst)
  const pdfs = files.filter((f) => f.toLowerCase().endsWith('.pdf'))
  const pdf = pdfs.includes('drill.pdf') ? 'drill.pdf' : pdfs[0]

  const copies = []
  if (main) copies.push([main, `main.${ext(main)}`])
  others.forEach((f, i) => copies.push([f, `variant-${i + 1}.${ext(f)}`]))
  if (pdf) copies.push([pdf, 'fiche.pdf'])

  return {
    drill: {
      id,
      title: titleFromFolder(folder),
      image: main ? `${dir}/main.${ext(main)}` : null,
      variants: others.map((f, i) => `${dir}/variant-${i + 1}.${ext(f)}`),
      pdf: pdf ? `${dir}/fiche.pdf` : null,
      sourceUrl: html ? extractSourceUrl(html) : null,
    },
    copies,
  }
}
