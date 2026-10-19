import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'

const names = ['basic', 'options', 'antimeridian', 'multi', 'alternatives', 'emissions', 'errors', 'networks']
const load = (dir) => Object.fromEntries(names.map((n) => [n, JSON.parse(gunzipSync(readFileSync(`${dir}/${n}.json.gz`)))]))

test('golden files parse and hold at least 250 uniquely named cases', () => {
  const golden = load('golden')
  const all = names.flatMap((n) => golden[n])
  assert.ok(all.length >= 250, `${all.length} cases`)
  assert.equal(new Set(all.map((c) => c.name)).size, all.length)
})

test('every case has exactly one of result and error', () => {
  for (const c of Object.values(load('golden')).flat()) {
    assert.equal('result' in c, !('error' in c), c.name)
    assert.equal('side' in (c.error ?? {}), c.error?.name === 'SnapFailedError', c.name)
  }
})

test('every case uses a known function, network and error name', () => {
  for (const c of Object.values(load('golden')).flat()) {
    assert.ok(['seaRoute', 'seaRouteMulti', 'seaRouteAlternatives'].includes(c.fn), c.name)
    assert.ok(['marnet100', 'marnet50', 'marnet20'].includes(c.network), c.name)
    if (c.error) assert.ok(['SnapFailedError', 'NoRouteError', 'UnknownPortError', 'Error'].includes(c.error.name), c.name)
  }
})

test('regenerating produces byte-identical files', () => {
  const dir = mkdtempSync(join(tmpdir(), 'golden-'))
  execFileSync('node', ['scripts/golden.mjs', dir])
  assert.deepEqual(readdirSync(dir).sort(), names.map((n) => `${n}.json.gz`).sort())
  for (const n of names) {
    assert.ok(readFileSync(`golden/${n}.json.gz`).equals(readFileSync(`${dir}/${n}.json.gz`)), n)
  }
})
