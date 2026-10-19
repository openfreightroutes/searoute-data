package network

import (
	"bytes"
	"compress/gzip"
	"testing"
)

func TestDecodeRoundTrip(t *testing.T) {
	var buf bytes.Buffer
	zw := gzip.NewWriter(&buf)
	zw.Write([]byte(`{"version":"v","features":[{"pass":"suez","coords":[[1,2],[3,4]]},{"coords":[[5,6],[7,8]]}]}`))
	zw.Close()

	n, err := Decode(&buf)
	if err != nil {
		t.Fatal(err)
	}
	if n.Version != "v" || len(n.Features) != 2 {
		t.Fatalf("got version %q with %d features", n.Version, len(n.Features))
	}
	if n.Features[0].Pass != "suez" || n.Features[1].Pass != "" {
		t.Fatalf("unexpected pass values %q, %q", n.Features[0].Pass, n.Features[1].Pass)
	}
	if n.Features[1].Coords[1] != [2]float64{7, 8} {
		t.Fatalf("unexpected coord %v", n.Features[1].Coords[1])
	}
}

func TestDecodeRejectsPlainJSON(t *testing.T) {
	if _, err := Decode(bytes.NewReader([]byte(`{"version":"v","features":[]}`))); err == nil {
		t.Fatal("expected an error for ungzipped input")
	}
}
