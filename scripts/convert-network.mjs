import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

const [input, output] = process.argv.slice(2)
if (!input || !output) {
  console.error('usage: node scripts/convert-network.mjs <input .cjs|.geojson> <output .json.gz>')
  process.exit(1)
}

const source = input.endsWith('.cjs')
  ? createRequire(import.meta.url)(resolve(input))
  : JSON.parse(readFileSync(input, 'utf8'))

const features = source.features.map((f) => {
  if (f.geometry.type !== 'LineString') {
    throw new Error(`unsupported geometry type ${f.geometry.type}`)
  }
  const coords = f.geometry.coordinates.map(([lon, lat]) => [lon === 180 ? -180 : lon, lat])
  return f.properties?.pass ? { pass: f.properties.pass, coords } : { coords }
})

const json = JSON.stringify({ version: 'eurostat-searoute-3.5', features })
writeFileSync(output, gzipSync(Buffer.from(json), { level: 9 }))
