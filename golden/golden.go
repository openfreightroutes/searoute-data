package golden

import "embed"

//go:embed *.json.gz
var FS embed.FS
