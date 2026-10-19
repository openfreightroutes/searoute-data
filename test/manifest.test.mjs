import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'))
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))

test('manifest hashes match the files on disk', () => {
  for (const [path, entry] of Object.entries(manifest.files)) {
    assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'), entry.sha256, path)
  }
})

test('manifest lists exactly the .json.gz files under the package dirs', () => {
  const onDisk = readdirSync('.', { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'node_modules')
    .flatMap((d) => readdirSync(d.name).filter((f) => f.endsWith('.json.gz')).map((f) => `${d.name}/${f}`))
  assert.deepEqual(Object.keys(manifest.files).sort(), onDisk.sort())
})

test('every export resolves to an existing file', () => {
  for (const key of Object.keys(pkg.exports)) {
    const url = import.meta.resolve(`@openfreightroutes/searoute-data/${key.slice(2)}`)
    assert.ok(existsSync(fileURLToPath(url)), key)
  }
})
