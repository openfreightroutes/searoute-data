import { mkdirSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { clearFinderCache, registerEcaZones, seaRoute, seaRouteAlternatives, seaRouteMulti } from 'searoute-ts'
import { ECA_ZONES } from 'searoute-ts/eca'
import { DEFAULT_MARNET as MARNET20 } from 'searoute-ts/marnet-20km'
import { DEFAULT_MARNET as MARNET50 } from 'searoute-ts/marnet-50km'
import 'searoute-ts/ports'

const outDir = process.argv[2] ?? 'golden'

const NYC = [-74.04, 40.69]
const LONDON = [-0.13, 51.5]
const SHANGHAI = [121.5, 31.0]
const ROTTERDAM = [4.4, 51.9]
const SINGAPORE = [103.8, 1.3]
const LA = [-118.3, 33.7]
const YOKOHAMA = [139.6, 35.4]
const HONOLULU = [-157.8, 21.3]
const SYDNEY = [151.2, -33.9]
const VANCOUVER = [-123.1, 49.3]
const MUMBAI = [72.9, 19.0]
const LISBON = [-9.14, 38.7]
const BARCELONA = [2.1734, 41.3851]
const MARSEILLE = [5.3698, 43.2965]
const CAPE_TOWN = [18.4, -33.9]

const lanes = [
  ['shanghai-rotterdam', SHANGHAI, ROTTERDAM],
  ['singapore-rotterdam', SINGAPORE, ROTTERDAM],
  ['mumbai-rotterdam', MUMBAI, ROTTERDAM],
  ['yokohama-la', YOKOHAMA, LA],
  ['honolulu-yokohama', HONOLULU, YOKOHAMA],
  ['sydney-vancouver', SYDNEY, VANCOUVER],
  ['ny-rotterdam', NYC, ROTTERDAM],
  ['ny-lisbon', NYC, LISBON],
  ['singapore-la', SINGAPORE, LA],
  ['ny-la', NYC, LA],
]
const shortRoutes = [
  ['dover-strait', [1.45, 50.94], [2.2, 51.34], { returnPassages: true }],
  ['barcelona-marseille', BARCELONA, MARSEILLE, {}],
  ['same-edge-west-med', [5.63, 40.76], [5.29, 40.04], {}],
  ['shanghai-kyushu', [121.545763, 31.254191], [130.392684, 33.628909], {}],
  ['angola-congo-coast', [12.33596, -6.11957], [11.881, -4.893], {}],
]
const passages = [
  'suez', 'panama', 'gibraltar', 'babelmandeb', 'babalmandab', 'bosporus', 'ormuz', 'malacca', 'sunda',
  'dover', 'kiel', 'corinth', 'bering', 'magellan', 'cape_horn', 'northwest', 'northeast',
]
const sweepLanes = [
  ['shanghai-rotterdam', SHANGHAI, ROTTERDAM],
  ['ny-la', NYC, LA],
  ['ny-singapore', NYC, SINGAPORE],
  ['yokohama-ny', YOKOHAMA, NYC],
]
const viaLanes = [
  ['cape-town-mumbai', CAPE_TOWN, MUMBAI],
  ['shanghai-rotterdam', SHANGHAI, ROTTERDAM],
]
const vessels = ['feeder', 'handysize', 'panamax', 'postpanamax', 'capesize', 'vlcc']
const km = { units: 'kilometers' }

const specs = {
  basic: [
    ...lanes.map(([n, a, b]) => ({ name: `basic/${n}`, points: [a, b], options: km })),
    ...lanes.map(([n, a, b]) => ({ name: `basic/${n}-reversed`, points: [b, a], options: km })),
    ...shortRoutes.map(([n, a, b, o]) => ({ name: `basic/short-${n}`, points: [a, b], options: { ...km, ...o } })),
    ...shortRoutes.map(([n, a, b, o]) => ({ name: `basic/short-${n}-reversed`, points: [b, a], options: { ...km, ...o } })),
    { name: 'basic/ny-london-default-units', points: [NYC, LONDON], options: {} },
    ...['nauticalmiles', 'kilometers', 'miles', 'meters'].map((units) => ({
      name: `basic/ny-london-${units}`, points: [NYC, LONDON], options: { units },
    })),
  ],
  options: [
    ...sweepLanes.flatMap(([n, a, b]) => passages.map((p) => ({
      name: `options/${n}-restrict-${p}`, points: [a, b], options: { ...km, restrictions: [p] },
    }))),
    ...viaLanes.flatMap(([n, a, b]) => ['suez', 'panama', 'gibraltar', 'malacca', 'sunda', 'cape_horn', 'northeast'].map((p) => ({
      name: `options/${n}-via-${p}`, points: [a, b], options: { ...km, via: [p] },
    }))),
    ...viaLanes.flatMap(([n, a, b]) => ['suez', 'northeast'].map((p) => ({
      name: `options/${n}-via-${p}-allow-arctic`, points: [a, b], options: { ...km, via: [p], allowArctic: true },
    }))),
    ...[false, true].map((allowArctic) => ({
      name: `options/yokohama-ny-allow-arctic-${allowArctic}`, points: [YOKOHAMA, NYC], options: { ...km, allowArctic },
    })),
    ...sweepLanes.slice(0, 2).flatMap(([n, a, b]) => [7.1, 15.3, 20.2].map((d) => ({
      name: `options/${n}-draft-${d}`, points: [a, b], options: { ...km, vesselDraftMeters: d },
    }))),
    ...sweepLanes.slice(0, 2).map(([n, a, b]) => ({
      name: `options/${n}-speed-20`, points: [a, b], options: { ...km, speedKnots: 20 },
    })),
    ...lanes.flatMap(([n, a, b]) => [
      { name: `options/${n}-speed-14`, points: [a, b], options: { ...km, speedKnots: 14 } },
      { name: `options/${n}-append-origin-destination`, points: [a, b], options: { ...km, appendOriginDestination: true } },
      { name: `options/${n}-return-passages`, points: [a, b], options: { ...km, returnPassages: true } },
      { name: `options/${n}-max-snap-50`, points: [a, b], options: { ...km, maxSnapDistanceKm: 50 } },
    ]),
  ],
  antimeridian: ['yokohama-la', 'honolulu-yokohama', 'sydney-vancouver', 'singapore-la'].flatMap((n) => {
    const [, a, b] = lanes.find((l) => l[0] === n)
    return ['none', 'unwrap', 'split'].map((mode) => ({
      name: `antimeridian/${n}-${mode}`,
      points: [a, b],
      options: mode === 'none' ? km : { ...km, antimeridian: mode },
    }))
  }),
  multi: [
    { name: 'multi/shanghai-singapore-mumbai-rotterdam', fn: 'seaRouteMulti', points: [SHANGHAI, SINGAPORE, MUMBAI, ROTTERDAM], options: km },
    { name: 'multi/ports-cnsha-sgsin-inbom-nlrtm', fn: 'seaRouteMulti', points: ['CNSHA', 'SGSIN', 'INBOM', 'NLRTM'], options: km },
    { name: 'multi/pacific-split', fn: 'seaRouteMulti', points: [SHANGHAI, HONOLULU, LA], options: { ...km, antimeridian: 'split' } },
    {
      name: 'multi/return-passages-speed',
      fn: 'seaRouteMulti',
      points: [SHANGHAI, SINGAPORE, MUMBAI, ROTTERDAM],
      options: { ...km, returnPassages: true, speedKnots: 14 },
    },
  ],
  alternatives: [
    ...[['shanghai-rotterdam', SHANGHAI, ROTTERDAM], ['ny-singapore', NYC, SINGAPORE], ['mumbai-ny', MUMBAI, NYC], ['yokohama-rotterdam', YOKOHAMA, ROTTERDAM]]
      .flatMap(([n, a, b]) => [1, 3, 6].map((k) => ({
        name: `alternatives/${n}-k${k}`, fn: 'seaRouteAlternatives', points: [a, b], options: { ...km, k },
      }))),
    { name: 'alternatives/shanghai-rotterdam-k6-similarity-0.1', fn: 'seaRouteAlternatives', points: [SHANGHAI, ROTTERDAM], options: { ...km, k: 6, similarityThreshold: 0.1 } },
    { name: 'alternatives/shanghai-rotterdam-k3-restrict-suez', fn: 'seaRouteAlternatives', points: [SHANGHAI, ROTTERDAM], options: { ...km, k: 3, restrictions: ['suez'] } },
  ],
  emissions: [['ny-rotterdam', NYC, ROTTERDAM], ['barcelona-marseille', BARCELONA, MARSEILLE], ['yokohama-la', YOKOHAMA, LA]]
    .flatMap(([n, a, b]) => [true, false].flatMap((eca) => [
      { name: 'emissions', options: { emissions: true } },
      ...vessels.map((v) => ({ name: `vessel-${v}`, options: { emissions: true, vesselClass: v } })),
      { name: 'co2e-factor-30', options: { emissions: true, co2eFactorKgPerKm: 30 } },
      { name: 'glec-inflation-0.15', options: { emissions: true, glecInflation: 0.15 } },
    ].map((e) => ({
      name: `emissions/${n}-${e.name}-eca-${eca}`, eca, points: [a, b], options: { ...km, ...e.options },
    })))),
  errors: [
    { name: 'errors/inland-origin', points: [[10, 50], ROTTERDAM], options: { ...km, maxSnapDistanceKm: 100 } },
    { name: 'errors/inland-destination', points: [ROTTERDAM, [10, 50]], options: { ...km, maxSnapDistanceKm: 100 } },
    { name: 'errors/same-vertex', points: [BARCELONA, [2.1734, 41.3941]], options: km },
    { name: 'errors/via-and-restricted-suez', points: [SHANGHAI, ROTTERDAM], options: { ...km, via: ['suez'], restrictions: ['suez'] } },
    { name: 'errors/unknown-port', points: ['XXXXX', 'NLRTM'], options: km },
    { name: 'errors/multi-one-point', fn: 'seaRouteMulti', points: [SHANGHAI], options: km },
    { name: 'errors/all-passages-restricted', points: [SHANGHAI, ROTTERDAM], options: { ...km, restrictions: passages } },
  ],
  networks: [['shanghai-rotterdam', SHANGHAI, ROTTERDAM], ['yokohama-la', YOKOHAMA, LA], ['barcelona-marseille', BARCELONA, MARSEILLE]]
    .flatMap(([n, a, b]) => ['marnet50', 'marnet20'].map((network) => ({
      name: `networks/${n}-${network}`, network, points: [a, b], options: km,
    }))),
}

const networks = { marnet50: MARNET50, marnet20: MARNET20 }
const fns = { seaRoute, seaRouteMulti, seaRouteAlternatives }

mkdirSync(outDir, { recursive: true })
for (const [file, list] of Object.entries(specs)) {
  const cases = list.map((spec) => {
    const c = {
      name: spec.name,
      fn: spec.fn ?? 'seaRoute',
      network: spec.network ?? 'marnet100',
      eca: spec.eca ?? false,
      points: spec.points,
      options: spec.options,
    }
    registerEcaZones(c.eca ? ECA_ZONES : [])
    clearFinderCache()
    const options = c.network === 'marnet100' ? c.options : { ...c.options, network: networks[c.network] }
    try {
      const out = c.fn === 'seaRouteMulti' ? fns[c.fn](c.points, options) : fns[c.fn](c.points[0], c.points[1], options)
      c.result = JSON.parse(JSON.stringify(out))
    } catch (err) {
      c.error = err.name === 'SnapFailedError' ? { name: err.name, side: err.side } : { name: err.name }
    }
    return c
  })
  writeFileSync(`${outDir}/${file}.json.gz`, gzipSync(Buffer.from(JSON.stringify(cases)), { level: 9 }))
  console.log(`${file}: ${cases.length} cases, ${cases.filter((c) => c.error).length} errors`)
}
