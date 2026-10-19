import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'

const require = createRequire(import.meta.url)
const networks = { marnet: 'marnet100', 'marnet-50km': 'marnet50', 'marnet-20km': 'marnet20' }

for (const [source, pkg] of Object.entries(networks)) {
  test(`${pkg} matches searoute-ts ${source}`, () => {
    const input = `node_modules/searoute-ts/dist/data/${source}.cjs`
    const out = join(mkdtempSync(join(tmpdir(), 'searoute-data-')), `${pkg}.json.gz`)
    execFileSync('node', ['scripts/convert-network.mjs', input, out])

    const checkedIn = readFileSync(`${pkg}/${pkg}.json.gz`)
    assert.deepEqual(readFileSync(out), checkedIn)

    const decoded = JSON.parse(gunzipSync(checkedIn))
    const src = require(`../${input}`)
    assert.equal(decoded.features.length, src.features.length)
    src.features.forEach((f, i) => {
      assert.deepEqual(decoded.features[i].coords, f.geometry.coordinates)
    })
  })
}
