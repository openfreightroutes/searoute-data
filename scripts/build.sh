#!/usr/bin/env bash
set -euo pipefail

if ! command -v ogr2ogr >/dev/null 2>&1; then
  echo "ogr2ogr (GDAL) is required to rebuild the networks; install GDAL and retry" >&2
  exit 1
fi

cd "$(dirname "$0")/.."
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

base=https://raw.githubusercontent.com/eurostat/searoute/searoute-3.5/modules/core/src/main/resources/marnet
for km in 100 50 20; do
  curl -fsSL -o "$work/marnet_plus_${km}km.gpkg" "$base/marnet_plus_${km}km.gpkg"
  # the layer is named "type", which plain ogr2ogr cannot read in GDAL 3.13
  layer=$(sqlite3 "$work/marnet_plus_${km}km.gpkg" 'select table_name from gpkg_contents')
  sql="SELECT geometry, pass FROM \"$layer\""
  ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=6 -dialect SQLite -sql "$sql" "$work/marnet${km}.geojson" "$work/marnet_plus_${km}km.gpkg"
  ogr2ogr -f GeoJSON -dialect SQLite -sql "$sql" "$work/marnet${km}-full.geojson" "$work/marnet_plus_${km}km.gpkg"
  node scripts/convert-network.mjs "$work/marnet${km}.geojson" "marnet${km}/marnet${km}.json.gz" "$work/marnet${km}-full.geojson"
done

npm ci
node scripts/extract-tables.mjs
node scripts/manifest.mjs
