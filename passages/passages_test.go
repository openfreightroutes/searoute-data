package passages

import (
	"reflect"
	"testing"
)

func TestTable(t *testing.T) {
	tb := Load()
	if len(tb.BBoxes) != 17 {
		t.Fatalf("got %d bbox entries", len(tb.BBoxes))
	}
	if !reflect.DeepEqual(tb.BBoxes["suez"], [][4]float64{{32.0, 29.5, 32.9, 31.5}}) {
		t.Fatalf("suez %v", tb.BBoxes["suez"])
	}
	if !reflect.DeepEqual(tb.BBoxes["northeast"], [][4]float64{{30.0, 68.0, 180.0, 82.0}}) {
		t.Fatalf("northeast %v", tb.BBoxes["northeast"])
	}
	if !reflect.DeepEqual(tb.Aliases, map[string]string{"babalmandab": "babelmandeb"}) {
		t.Fatalf("aliases %v", tb.Aliases)
	}
	if !reflect.DeepEqual(tb.CanalMaxDraftM, map[string]float64{"panama": 15.2, "suez": 20.1, "kiel": 7.0, "corinth": 7.3}) {
		t.Fatalf("draft %v", tb.CanalMaxDraftM)
	}
	native := []string{"suez", "panama", "gibraltar", "babelmandeb", "malacca", "dover", "kiel", "corinth", "bering", "magellan", "northwest", "northeast"}
	if !reflect.DeepEqual(tb.Native, native) {
		t.Fatalf("native %v", tb.Native)
	}
	order := []string{"suez", "panama", "gibraltar", "babelmandeb", "bosporus", "ormuz", "malacca", "sunda", "dover", "kiel", "corinth", "bering", "magellan", "cape_horn", "northwest", "northeast"}
	if !reflect.DeepEqual(tb.ReportOrder, order) {
		t.Fatalf("order %v", tb.ReportOrder)
	}
}
