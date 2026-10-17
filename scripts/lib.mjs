export function slugify(folder) {
  return folder
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function titleFromFolder(folder) {
  return folder.replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
}

export function extractSourceUrl(html) {
  return html.match(/content="\d+;\s*url=([^"]+)"/i)?.[1] ?? null
}

const isVariant = (name) => name.startsWith('drill-maker-') || name.startsWith('field_content_image')

export function buildDrill(folder, files, html) {
  const id = slugify(folder)
  const dir = `drills/${id}`
  const pngs = files.filter((f) => f.toLowerCase().endsWith('.png')).sort()
  const main = pngs.find((f) => !isVariant(f)) ?? pngs[0]
  const others = pngs.filter((f) => f !== main)
  const pdfs = files.filter((f) => f.toLowerCase().endsWith('.pdf'))
  const pdf = pdfs.includes('drill.pdf') ? 'drill.pdf' : pdfs[0]

  const copies = []
  if (main) copies.push([main, 'main.png'])
  others.forEach((f, i) => copies.push([f, `variant-${i + 1}.png`]))
  if (pdf) copies.push([pdf, 'fiche.pdf'])

  return {
    drill: {
      id,
      title: titleFromFolder(folder),
      image: main ? `${dir}/main.png` : null,
      variants: others.map((_, i) => `${dir}/variant-${i + 1}.png`),
      pdf: pdf ? `${dir}/fiche.pdf` : null,
      sourceUrl: html ? extractSourceUrl(html) : null,
    },
    copies,
  }
}
