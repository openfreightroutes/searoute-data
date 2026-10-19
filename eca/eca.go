package eca

import (
	"bytes"
	"compress/gzip"
	_ "embed"
	"encoding/json"
	"sync"
)

//go:embed eca.json.gz
var data []byte

type Zone struct {
	Name   string       `json:"name"`
	BBoxes [][4]float64 `json:"bboxes"`
}

var Zones = sync.OnceValue(func() []Zone {
	zr, err := gzip.NewReader(bytes.NewReader(data))
	if err != nil {
		panic(err)
	}
	var z []Zone
	if err := json.NewDecoder(zr).Decode(&z); err != nil {
		panic(err)
	}
	return z
})
