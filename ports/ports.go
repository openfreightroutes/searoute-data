package ports

import (
	"bytes"
	"compress/gzip"
	_ "embed"
	"encoding/json"
	"sync"
)

//go:embed ports.json.gz
var data []byte

type Port struct {
	Name        string     `json:"name"`
	Country     string     `json:"country"`
	Coordinates [2]float64 `json:"coordinates"`
}

var All = sync.OnceValue(func() map[string]Port {
	zr, err := gzip.NewReader(bytes.NewReader(data))
	if err != nil {
		panic(err)
	}
	var p map[string]Port
	if err := json.NewDecoder(zr).Decode(&p); err != nil {
		panic(err)
	}
	return p
})
