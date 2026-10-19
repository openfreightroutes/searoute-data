package network

import (
	"compress/gzip"
	"encoding/json"
	"io"
)

type Feature struct {
	Pass   string       `json:"pass,omitempty"`
	Coords [][2]float64 `json:"coords"`
}

type Network struct {
	Version  string    `json:"version"`
	Features []Feature `json:"features"`
}

func Decode(r io.Reader) (*Network, error) {
	zr, err := gzip.NewReader(r)
	if err != nil {
		return nil, err
	}
	defer zr.Close()
	var n Network
	if err := json.NewDecoder(zr).Decode(&n); err != nil {
		return nil, err
	}
	return &n, nil
}
