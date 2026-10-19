package eca

import "testing"

func TestZones(t *testing.T) {
	z := Zones()
	names := []string{"Baltic Sea SECA", "North Sea SECA", "Mediterranean Sea SECA", "North American ECA", "US Caribbean ECA"}
	if len(z) != len(names) {
		t.Fatalf("got %d zones", len(z))
	}
	for i, n := range names {
		if z[i].Name != n {
			t.Fatalf("zone %d is %q, want %q", i, z[i].Name, n)
		}
	}
	if z[0].BBoxes[0] != [4]float64{12.0, 53.6, 30.5, 66.0} {
		t.Fatalf("baltic bbox %v", z[0].BBoxes[0])
	}
	if len(z[3].BBoxes) != 3 {
		t.Fatalf("north american has %d bboxes", len(z[3].BBoxes))
	}
}
