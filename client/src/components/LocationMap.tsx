import { useState, useEffect, useRef } from "react";
import MapView from "@/components/Map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin, Plus, Trash2, Map, Star, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface VendingLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  score: number;
  status: "prospect" | "contacted" | "secured" | "rejected";
}

export default function LocationMap() {
  const [locations, setLocations] = useState<VendingLocation[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [score, setScore] = useState(3);
  const [status, setStatus] = useState<VendingLocation["status"]>("prospect");
  
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Load locations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("snaxology_vending_locations");
    if (saved) {
      try {
        setLocations(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse locations", e);
      }
    } else {
      // Default sample locations in Miami
      const defaults: VendingLocation[] = [
        { id: "1", name: "Wynwood Creative Office", address: "Wynwood, Miami, FL", lat: 25.8024, lng: -80.1994, score: 4, status: "secured" },
        { id: "2", name: "Doral Logistics Warehouse", address: "Doral, Miami, FL", lat: 25.8153, lng: -80.3582, score: 5, status: "prospect" },
        { id: "3", name: "Brickell Gym Center", address: "Brickell, Miami, FL", lat: 25.7617, lng: -80.1918, score: 3, status: "contacted" }
      ];
      setLocations(defaults);
      localStorage.setItem("snaxology_vending_locations", JSON.stringify(defaults));
    }
  }, []);

  // Save locations to localStorage and update markers when locations change
  useEffect(() => {
    if (locations.length > 0) {
      localStorage.setItem("snaxology_vending_locations", JSON.stringify(locations));
    }
    updateMarkers();
  }, [locations]);

  // Clean up markers on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach(m => m.setMap(null));
    };
  }, []);

  // Update map markers
  const updateMarkers = () => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    locations.forEach((loc) => {
      // Color code based on status
      let markerColor = "#B42318"; // Prospect: Cherry Red
      if (loc.status === "secured") markerColor = "#74A35A"; // Secured: Sage Green
      if (loc.status === "contacted") markerColor = "#FF9500"; // Contacted: Amber
      if (loc.status === "rejected") markerColor = "#8E8E93"; // Rejected: Gray

      // Create marker pin using SVG
      const svgMarker = {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-12-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
        fillColor: markerColor,
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#FFFFFF",
        scale: 1.5,
        anchor: new google.maps.Point(12, 21),
      };

      const marker = new google.maps.Marker({
        position: { lat: loc.lat, lng: loc.lng },
        map: mapRef.current,
        title: loc.name,
        icon: svgMarker,
      });

      // Info Window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-family: sans-serif; padding: 8px; max-width: 200px;">
            <h4 style="margin: 0 0 4px 0; font-weight: bold; font-size: 14px; color: #151515;">${loc.name}</h4>
            <p style="margin: 0 0 6px 0; font-size: 11px; color: #666;">${loc.address}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 6px;">
              <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: ${markerColor};">${loc.status}</span>
              <span style="font-size: 11px; font-weight: bold; color: #B42318;">⭐ ${loc.score}/5</span>
            </div>
          </div>
        `
      });

      marker.addListener("click", () => {
        infoWindow.open(mapRef.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend({ lat: loc.lat, lng: loc.lng });
    });

    // Auto-fit map to show all markers if there are any
    if (locations.length > 0 && mapRef.current) {
      mapRef.current.fitBounds(bounds);
      // Don't zoom in too close if only 1 marker
      if (locations.length === 1) {
        mapRef.current.setZoom(13);
      }
    }
  };

  // Google Map Initialization callback
  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    
    // Set initial center to Miami
    map.setCenter({ lat: 25.7617, lng: -80.1918 });
    map.setZoom(11);

    // Setup Autocomplete
    const inputElement = document.getElementById("address-input") as HTMLInputElement;
    if (inputElement && google.maps.places) {
      const autocomplete = new google.maps.places.Autocomplete(inputElement, {
        types: ["geocode", "establishment"]
      });
      
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          setAddress(place.formatted_address || place.name || "");
          // Focus map on selected place
          map.setCenter(place.geometry.location);
          map.setZoom(15);
        }
      });
      autocompleteRef.current = autocomplete;
    }

    updateMarkers();
  };

  // Add Location
  const handleAddLocation = () => {
    if (!name.trim()) {
      toast.error("Please enter a location name.");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter or select an address.");
      return;
    }

    // Geocode address to get lat/lng if autocomplete didn't fully capture it
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, statusResult) => {
      if (statusResult === "OK" && results && results[0]) {
        const geoLoc = results[0].geometry.location;
        const newLoc: VendingLocation = {
          id: Date.now().toString(),
          name,
          address: results[0].formatted_address,
          lat: geoLoc.lat(),
          lng: geoLoc.lng(),
          score,
          status
        };

        setLocations([...locations, newLoc]);
        setName("");
        setAddress("");
        setScore(3);
        setStatus("prospect");
        
        // Clear input element physically
        const inputElement = document.getElementById("address-input") as HTMLInputElement;
        if (inputElement) inputElement.value = "";

        toast.success(`"${name}" successfully plotted on your route map!`);
      } else {
        toast.error("Could not find the coordinates for this address. Please try a more specific address.");
      }
    });
  };

  // Delete Location
  const handleDeleteLocation = (id: string) => {
    const locToDelete = locations.find(l => l.id === id);
    const updated = locations.filter(l => l.id !== id);
    setLocations(updated);
    if (updated.length === 0) {
      localStorage.removeItem("snaxology_vending_locations");
    }
    toast.success(`Removed "${locToDelete?.name}" from map.`);
  };

  // Reset to defaults
  const handleResetLocations = () => {
    if (confirm("Reset route map to sample Miami locations?")) {
      const defaults: VendingLocation[] = [
        { id: "1", name: "Wynwood Creative Office", address: "Wynwood, Miami, FL", lat: 25.8024, lng: -80.1994, score: 4, status: "secured" },
        { id: "2", name: "Doral Logistics Warehouse", address: "Doral, Miami, FL", lat: 25.8153, lng: -80.3582, score: 5, status: "prospect" },
        { id: "3", name: "Brickell Gym Center", address: "Brickell, Miami, FL", lat: 25.7617, lng: -80.1918, score: 3, status: "contacted" }
      ];
      setLocations(defaults);
      toast.success("Route map reset to default locations.");
    }
  };

  return (
    <Card className="tactile-card">
      <CardHeader className="bg-primary/5 border-b border-foreground/10 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5 text-primary" />
              <CardTitle className="font-serif text-xl">Visual Route & Prospect Plotter</CardTitle>
            </div>
            <CardDescription className="text-foreground/70">
              Plot your 25 target locations, track outreach statuses, and visualize your vending route.
            </CardDescription>
          </div>
          <Button
            onClick={handleResetLocations}
            variant="outline"
            size="sm"
            className="tactile-btn-secondary flex items-center gap-2 self-start sm:self-center"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Map</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Map & Plotting Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Interactive Google Map */}
          <div className="w-full h-[400px] rounded-lg border-2 border-foreground/15 overflow-hidden shadow-inner relative">
            <MapView onMapReady={handleMapReady} />
          </div>

          {/* Plotting Form */}
          <div className="border-2 border-foreground/10 rounded-lg p-5 bg-card space-y-4">
            <h4 className="font-serif font-bold text-foreground text-base border-b border-foreground/10 pb-1 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-primary" />
              <span>Plot New Prospect</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="loc-name" className="text-xs font-semibold text-foreground/70">Location Name</Label>
                <Input
                  id="loc-name"
                  placeholder="e.g., Wynwood Car Repair"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border-2 border-foreground/10 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address-input" className="text-xs font-semibold text-foreground/70">Search Address</Label>
                <Input
                  id="address-input"
                  placeholder="Start typing address..."
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-background border-2 border-foreground/10 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="loc-status" className="text-xs font-semibold text-foreground/70">Outreach Status</Label>
                <select
                  id="loc-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VendingLocation["status"])}
                  className="w-full h-10 rounded-md border-2 border-foreground/10 bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="prospect">🎯 Target Prospect</option>
                  <option value="contacted">📞 Contacted</option>
                  <option value="secured">🤝 Secured Placement</option>
                  <option value="rejected">❌ Rejected / Closed</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="loc-score" className="text-xs font-semibold text-foreground/70">Location Score (1–5)</Label>
                <select
                  id="loc-score"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full h-10 rounded-md border-2 border-foreground/10 bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="1">⭐ 1/5 (Weak Traffic)</option>
                  <option value="2">⭐⭐ 2/5 (Low Dwell)</option>
                  <option value="3">⭐⭐⭐ 3/5 (Viable Spot)</option>
                  <option value="4">⭐⭐⭐⭐ 4/5 (Strong Traffic)</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5/5 (Premium Spot)</option>
                </select>
              </div>

              <Button
                onClick={handleAddLocation}
                className="tactile-btn-primary w-full h-10 flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-4 h-4" />
                <span>Plot Location</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Saved Route List (4 cols) */}
        <div className="lg:col-span-4 border-2 border-foreground/10 rounded-lg bg-card flex flex-col h-[560px]">
          <div className="bg-primary/5 px-4 py-3 border-b-2 border-foreground/10 flex items-center justify-between">
            <h4 className="font-serif font-bold text-foreground text-sm">My Vending Route ({locations.length})</h4>
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Saved Spots</span>
          </div>

          <div className="p-3 overflow-y-auto grow space-y-2.5">
            {locations.length === 0 ? (
              <div className="text-center py-12 text-foreground/40 space-y-2">
                <MapPin className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-xs font-medium">No locations plotted yet.</p>
                <p className="text-[10px]">Use the form to add your first prospect!</p>
              </div>
            ) : (
              locations.map((loc) => {
                let statusBadge = "bg-primary/10 text-primary border-primary/20";
                if (loc.status === "secured") statusBadge = "bg-secondary/10 text-secondary border-secondary/20";
                if (loc.status === "contacted") statusBadge = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                if (loc.status === "rejected") statusBadge = "bg-foreground/10 text-foreground/50 border-foreground/10";

                return (
                  <div key={loc.id} className="border-2 border-foreground/5 rounded-md p-3 bg-background hover:border-primary/20 transition-all flex justify-between items-start gap-2 group">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h5 className="font-serif font-bold text-xs sm:text-sm text-foreground/90 truncate max-w-[140px]">{loc.name}</h5>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${statusBadge}`}>
                          {loc.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-foreground/50 truncate max-w-[180px]">{loc.address}</p>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Score: {loc.score}/5</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteLocation(loc.id)}
                      variant="ghost"
                      size="sm"
                      className="text-foreground/30 hover:text-destructive hover:bg-destructive/5 h-7 w-7 p-0 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
