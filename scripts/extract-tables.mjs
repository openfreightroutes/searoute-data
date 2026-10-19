import { readFileSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { CANAL_MAX_DRAFT_M, PASSAGE_BBOXES } from 'searoute-ts'
import { ECA_ZONES } from 'searoute-ts/eca'

// native, aliases and reportOrder are not exported: copied from src/lib/restrictions.ts of searoute-ts 2.3.1
const native = ['suez', 'panama', 'gibraltar', 'babelmandeb', 'malacca', 'dover', 'kiel', 'corinth', 'bering', 'magellan', 'northwest', 'northeast']
const aliases = { babalmandab: 'babelmandeb' }
const reportOrder = ['suez', 'panama', 'gibraltar', 'babelmandeb', 'bosporus', 'ormuz', 'malacca', 'sunda', 'dover', 'kiel', 'corinth', 'bering', 'magellan', 'cape_horn', 'northwest', 'northeast']

const write = (path, value) => writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(value)), { level: 9 }))

write('passages/passages.json.gz', { bboxes: PASSAGE_BBOXES, native, aliases, canalMaxDraftM: CANAL_MAX_DRAFT_M, reportOrder })
write('eca/eca.json.gz', ECA_ZONES)
write('ports/ports.json.gz', JSON.parse(readFileSync('node_modules/searoute-ts/dist/ports.json', 'utf8')))
