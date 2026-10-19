import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'

const licences = {
  'marnet100/marnet100.json.gz': 'EUPL-1.2',
  'marnet50/marnet50.json.gz': 'EUPL-1.2',
  'marnet20/marnet20.json.gz': 'EUPL-1.2',
  'passages/passages.json.gz': 'MIT',
  'eca/eca.json.gz': 'MIT',
  'ports/ports.json.gz': 'MIT',
}

const files = {}
for (const [path, licence] of Object.entries(licences)) {
  files[path] = { sha256: createHash('sha256').update(readFileSync(path)).digest('hex'), licence }
}

const manifest = { eurostatVersion: '3.5', source: 'https://github.com/eurostat/searoute', files }
writeFileSync('manifest.json', JSON.stringify(manifest, null, 2) + '\n')
