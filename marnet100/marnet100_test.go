package marnet100

import "testing"

func TestNetwork(t *testing.T) {
	n := Network()
	if n.Version != "eurostat-searoute-3.5" {
		t.Fatalf("version %q", n.Version)
	}
	if len(n.Features) != 9847 {
		t.Fatalf("got %d features", len(n.Features))
	}
	total := 0
	passes := map[string]bool{}
	for _, f := range n.Features {
		total += len(f.Coords)
		if f.Pass != "" {
			passes[f.Pass] = true
		}
		for _, c := range f.Coords {
			if c[0] == 180 {
				t.Fatal("found lon 180")
			}
		}
	}
	if total != 20258 {
		t.Fatalf("got %d coords", total)
	}
	want := []string{"suez", "panama", "gibraltar", "babelmandeb", "malacca", "dover", "kiel", "corinth", "bering", "magellan", "northwest", "northeast"}
	if len(passes) != len(want) {
		t.Fatalf("got passes %v", passes)
	}
	for _, p := range want {
		if !passes[p] {
			t.Fatalf("missing pass %s", p)
		}
	}
	first := n.Features[0]
	if first.Pass != "" || len(first.Coords) != 2 || first.Coords[0] != [2]float64{147, -4.8} || first.Coords[1] != [2]float64{141, -2} {
		t.Fatalf("unexpected first feature %v", first)
	}
}
