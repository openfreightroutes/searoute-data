#!/usr/bin/env bash
set -euo pipefail

if ! command -v ogr2ogr >/dev/null 2>&1; then
  echo "ogr2ogr (GDAL) is required to rebuild the networks; install GDAL and retry" >&2
  exit 1
fi

cd "$(dirname "$0")/.."
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

base=https://raw.githubusercontent.com/eurostat/searoute/v3.5/modules/core/src/main/resources/marnet
for km in 100 50 20; do
  curl -fsSL -o "$work/marnet_plus_${km}km.gpkg" "$base/marnet_plus_${km}km.gpkg"
  ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=6 "$work/marnet${km}.geojson" "$work/marnet_plus_${km}km.gpkg"
  node scripts/convert-network.mjs "$work/marnet${km}.geojson" "marnet${km}/marnet${km}.json.gz"
done

node scripts/extract-tables.mjs
node scripts/manifest.mjs
