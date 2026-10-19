package passages

import (
	"bytes"
	"compress/gzip"
	_ "embed"
	"encoding/json"
	"sync"
)

//go:embed passages.json.gz
var data []byte

type Table struct {
	BBoxes         map[string][][4]float64 `json:"bboxes"`
	Native         []string                `json:"native"`
	Aliases        map[string]string       `json:"aliases"`
	CanalMaxDraftM map[string]float64      `json:"canalMaxDraftM"`
	ReportOrder    []string                `json:"reportOrder"`
}

var Load = sync.OnceValue(func() *Table {
	zr, err := gzip.NewReader(bytes.NewReader(data))
	if err != nil {
		panic(err)
	}
	t := &Table{}
	if err := json.NewDecoder(zr).Decode(t); err != nil {
		panic(err)
	}
	return t
})
