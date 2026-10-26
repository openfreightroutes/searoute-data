import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

const [input, output, fullPrecision] = process.argv.slice(2)
if (!input || !output) {
  console.error('usage: node scripts/convert-network.mjs <input .cjs|.geojson> <output .json.gz> [full-precision .geojson]')
  process.exit(1)
}

const source = input.endsWith('.cjs')
  ? createRequire(import.meta.url)(resolve(input))
  : JSON.parse(readFileSync(input, 'utf8'))

const full = fullPrecision ? JSON.parse(readFileSync(fullPrecision, 'utf8')).features : []

const features = source.features.map((f, i) => {
  if (f.geometry.type !== 'LineString') {
    throw new Error(`unsupported geometry type ${f.geometry.type}`)
  }
  // GDAL 3.13 drops a line whose two points round to the same 6-decimal position; older GDAL kept both.
  const raw = f.geometry.coordinates.length < 2 && full[i]
    ? full[i].geometry.coordinates.map(([lon, lat]) => [Number(lon.toFixed(6)), Number(lat.toFixed(6))])
    : f.geometry.coordinates
  const coords = raw.map(([lon, lat]) => [lon === 180 ? -180 : lon, lat])
  return f.properties?.pass ? { pass: f.properties.pass, coords } : { coords }
})

const json = JSON.stringify({ version: 'eurostat-searoute-3.5', features })
writeFileSync(output, gzipSync(Buffer.from(json), { level: 9 }))
