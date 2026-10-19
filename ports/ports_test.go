package ports

import "testing"

func TestAll(t *testing.T) {
	p := All()
	if len(p) != 1610 {
		t.Fatalf("got %d ports", len(p))
	}
	if p["CNSHA"] != (Port{"Shanghai", "China", [2]float64{121.473701, 31.230416}}) {
		t.Fatalf("CNSHA %v", p["CNSHA"])
	}
	if p["NLRTM"].Coordinates != [2]float64{4.5, 51.92} {
		t.Fatalf("NLRTM %v", p["NLRTM"].Coordinates)
	}
}
