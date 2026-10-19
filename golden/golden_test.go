package golden

import (
	"compress/gzip"
	"encoding/json"
	"testing"
)

func TestFS(t *testing.T) {
	for _, name := range []string{"basic", "options", "antimeridian", "multi", "alternatives", "emissions", "errors", "networks"} {
		f, err := FS.Open(name + ".json.gz")
		if err != nil {
			t.Fatal(err)
		}
		zr, err := gzip.NewReader(f)
		if err != nil {
			t.Fatal(err)
		}
		var cases []map[string]any
		if err := json.NewDecoder(zr).Decode(&cases); err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		if len(cases) == 0 {
			t.Fatalf("%s is empty", name)
		}
	}
}
