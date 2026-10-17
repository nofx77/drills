import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { buildDrill, dropDuplicatePngs } from './lib.mjs'

const source = process.argv[2] ?? '/Users/mnantel/Downloads/2025/2025'
const out = 'public/drills'

rmSync(out, { recursive: true, force: true })

const seen = new Map()
const drills = []

for (const folder of readdirSync(source).sort()) {
  const dir = join(source, folder)
  if (!statSync(dir).isDirectory()) continue

  const files = dropDuplicatePngs(readdirSync(dir), (f) => createHash('md5').update(readFileSync(join(dir, f))).digest('hex'))
  const htmlFile = join(dir, 'open_in_browser.html')
  const html = existsSync(htmlFile) ? readFileSync(htmlFile, 'utf8') : undefined
  const { drill, copies } = buildDrill(folder, files, html)

  if (seen.has(drill.id)) {
    throw new Error(`Slug en double « ${drill.id} » : « ${seen.get(drill.id)} » et « ${folder} »`)
  }
  seen.set(drill.id, folder)

  mkdirSync(join(out, drill.id), { recursive: true })
  for (const [from, to] of copies) copyFileSync(join(dir, from), join(out, drill.id, to))
  drills.push(drill)
}

drills.sort((a, b) => a.title.localeCompare(b.title, 'en', { numeric: true }))
writeFileSync('src/data/drills.json', JSON.stringify(drills, null, 2) + '\n')

console.log(`${drills.length} exercices, ${drills.filter((d) => !d.image).length} sans image, ${drills.filter((d) => !d.pdf).length} sans PDF`)
