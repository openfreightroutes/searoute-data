import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { CANAL_MAX_DRAFT_M, PASSAGE_BBOXES } from 'searoute-ts'
import { ECA_ZONES } from 'searoute-ts/eca'

const decode = (path) => JSON.parse(gunzipSync(readFileSync(path)))

test('passages match searoute-ts', () => {
  const decoded = decode('passages/passages.json.gz')
  assert.deepEqual(Object.keys(decoded), ['bboxes', 'native', 'aliases', 'canalMaxDraftM', 'reportOrder'])
  assert.deepEqual(decoded.bboxes, PASSAGE_BBOXES)
  assert.deepEqual(decoded.canalMaxDraftM, CANAL_MAX_DRAFT_M)
})

test('eca zones match searoute-ts', () => {
  assert.deepEqual(decode('eca/eca.json.gz'), ECA_ZONES)
})

test('ports match searoute-ts', () => {
  assert.deepEqual(decode('ports/ports.json.gz'), JSON.parse(readFileSync('node_modules/searoute-ts/dist/ports.json', 'utf8')))
})
