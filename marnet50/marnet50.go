package marnet50

import (
	"bytes"
	_ "embed"
	"sync"

	"github.com/openfreightroutes/searoute-data/network"
)

//go:embed marnet50.json.gz
var data []byte

var Network = sync.OnceValue(func() *network.Network {
	n, err := network.Decode(bytes.NewReader(data))
	if err != nil {
		panic(err)
	}
	return n
})
