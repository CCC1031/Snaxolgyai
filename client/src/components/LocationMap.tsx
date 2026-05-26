import { useState, useEffect, useRef } from "react";
import { MapView } from "@/components/Map";
import L from "leaflet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin, Plus, Trash2, Map, Star, RefreshCw, CheckSquare } from "lucide-react";
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

interface LocationMapProps {
  onScoreLocation?: (id: string) => void;
}

export default function LocationMap({ onScoreLocation }: LocationMapProps) {
  const [locations, setLocations] = useState<VendingLocation[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [score, setScore] = useState(3);
  const [status, setStatus] = useState<VendingLocation["status"]>("prospect");
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isPlotting, setIsPlotting] = useState(false);
  
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

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

  // Handle Leaflet Map Ready
  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
    
    // Add a slight timeout to let the tiles load and trigger transition
    setTimeout(() => {
      setIsMapLoading(false);
    }, 1200);
    
    updateMarkers();
  };

  // Handle scorecard click from Leaflet popup
  useEffect(() => {
    // Expose a global handler so that buttons in the raw Leaflet HTML popups can call React props
    (window as any).handleScorecardFromPopup = (id: string) => {
      if (onScoreLocation) {
        onScoreLocation(id);
      }
    };
    return () => {
      delete (window as any).handleScorecardFromPopup;
    };
  }, [onScoreLocation]);

  // Re-render markers and fit bounds
  const updateMarkers = () => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const bounds: L.LatLngTuple[] = [];

    locations.forEach((loc) => {
      let pinColor = "#B42318"; // Prospect: Snaxology Cherry Red
      let pinTitle = "Target Prospect";

      if (loc.status === "secured") {
        pinColor = "#74A35A"; // Secured: Snaxology Sage Green
        pinTitle = "Secured Placement";
      } else if (loc.status === "contacted") {
        pinColor = "#E0843D"; // Contacted: Snaxology Mustard/Amber Orange
        pinTitle = "Contacted";
      } else if (loc.status === "rejected") {
        pinColor = "#8E8E93"; // Rejected: Gray
        pinTitle = "Closed / Rejected";
      }

      // Create Custom Leaflet DivIcon for the Branded Pin
      const customIcon = L.divIcon({
        html: `
          <div style="position: relative; width: 30px; height: 42px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <!-- Outer Pin Shape (SVG) -->
            <svg width="30" height="42" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
              <path d="M15 0C6.71 0 0 6.71 0 15C0 26.25 15 42 15 42C15 42 30 26.25 30 15C30 6.71 23.29 0 15 0Z" fill="${pinColor}" stroke="#FFFFFF" stroke-width="1.5"/>
            </svg>
            <!-- Inner Branded Vending Icon -->
            <div style="position: absolute; top: 8px; display: flex; align-items: center; justify-content: center; width: 14px; height: 14px; color: #FFFFFF;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M6 2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3l3 3H5l3-3H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v5h12V4H6zm0 7v7h12v-7H6z"/>
              </svg>
            </div>
          </div>
        `,
        className: "custom-vending-pin",
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -40]
      });

      // Determine status display text and background style for popup
      let statusBg = "#FEE4E2";
      let statusText = "#B42318";
      if (loc.status === "secured") {
        statusBg = "#ECFDF3";
        statusText = "#027A48";
      } else if (loc.status === "contacted") {
        statusBg = "#FFFAEB";
        statusText = "#B54708";
      } else if (loc.status === "rejected") {
        statusBg = "#F2F4F7";
        statusText = "#344054";
      }

      // Calculate total points and percentage
      const totalPoints = loc.score * 10; // score is out of 5
      const percentage = (loc.score / 5) * 100;

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 8px; width: 220px; box-sizing: border-box;">
            <!-- Title and Address -->
            <h4 style="margin: 0 0 4px 0; font-weight: 700; font-size: 14px; color: #1c1917; font-family: Georgia, serif;">${loc.name}</h4>
            <p style="margin: 0 0 10px 0; font-size: 11px; color: #57534e; line-height: 1.4;">${loc.address}</p>
            
            <!-- Quick Stats -->
            <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; background: #fafaf9; padding: 8px; border-radius: 6px; border: 1px solid #f5f5f4;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 10px; color: #78716c; font-weight: 500;">Outreach Status</span>
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background-color: ${statusBg}; color: ${statusText};">${loc.status}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 10px; color: #78716c; font-weight: 500;">Vending Score</span>
                <span style="font-size: 11px; font-weight: 700; color: #854d0e;">⭐ ${loc.score > 0 ? `${loc.score}/5 (${percentage}%)` : "Not Scored"}</span>
              </div>
            </div>

            <!-- Action Button -->
            <button 
              onclick="window.handleScorecardFromPopup('${loc.id}')"
              style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; background-color: #8C1D18; color: #ffffff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: background-color 0.2s;"
              onmouseover="this.style.backgroundColor='#721612'"
              onmouseout="this.style.backgroundColor='#8C1D18'"
            >
              <svg viewBox="0 0 24 24" width="12" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block;">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              ${loc.score > 0 ? "Update Scorecard" : "Evaluate Scorecard"}
            </button>
          </div>
        `);

      markersRef.current.push(marker);
      bounds.push([loc.lat, loc.lng]);
    });

    // Auto-fit map to show all markers
    if (locations.length > 0 && mapRef.current) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      if (locations.length === 1) {
        mapRef.current.setZoom(13);
      }
    }
  };

  // Add Location & Geocode
  const handleAddLocation = async () => {
    if (!name || !address) {
      toast.error("Please fill out both the location name and search address.");
      return;
    }

    setIsPlotting(true);

    try {
      // Geocode using Manus Geocoding Proxy with the reliable backend API key
      const apiKey = "G2aKSzKduAizaCGgetZASt";
      const url = `https://forge.manus.ai/v1/maps/proxy/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results && data.results[0]) {
        const geoLoc = data.results[0].geometry.location;
        const formattedAddress = data.results[0].formatted_address;

        const newLoc: VendingLocation = {
          id: Date.now().toString(),
          name,
          address: formattedAddress,
          lat: geoLoc.lat,
          lng: geoLoc.lng,
          score,
          status
        };

        setLocations([...locations, newLoc]);
        setName("");
        setAddress("");
        setScore(3);
        setStatus("prospect");
        
        toast.success(`"${name}" successfully plotted on your route map!`);
      } else {
        toast.error("Could not find the coordinates for this address. Please try a more specific address.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("An error occurred while geocoding the address. Please try again.");
    } finally {
      setIsPlotting(false);
    }
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
          {/* Interactive Leaflet Map */}
          <div className="w-full h-[400px] rounded-lg border-2 border-foreground/15 overflow-hidden shadow-inner relative">
            {isMapLoading && (
              <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center transition-all duration-500 ease-out">
                <div className="relative flex items-center justify-center w-24 h-24 mb-4">
                  {/* Outer Pulsing Branded Ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping duration-1000" />
                  {/* Spinning Inner Ring */}
                  <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin duration-700" />
                  {/* Central Retro Vending Silhouette SVG */}
                  <svg className="w-10 h-10 text-primary animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3l3 3H5l3-3H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v5h12V4H6zm0 7v7h12v-7H6z" />
                  </svg>
                </div>
                <h4 className="font-serif font-bold text-lg text-foreground tracking-wide animate-pulse">
                  Plotting Your Vending Route...
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Connecting to Snaxology AI Mapping Engine
                </p>
              </div>
            )}
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
                  placeholder="e.g., 250 Wynwood Way, Miami, FL"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-background border-2 border-foreground/10 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <option value="rejected">❌ Closed / Rejected</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="loc-score" className="text-xs font-semibold text-foreground/70">Initial Priority / Quality</Label>
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
                disabled={isPlotting}
                className="w-full h-10 font-serif font-bold text-sm tracking-wider tactile-btn-primary flex items-center justify-center gap-2"
              >
                {isPlotting ? "Plotting..." : "Plot Location"}
              </Button>
            </div>
          </div>
        </div>

        {/* Saved Locations Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="border-2 border-foreground/10 rounded-lg p-4 bg-card">
            <h4 className="font-serif font-bold text-foreground text-base border-b border-foreground/10 pb-2 flex items-center justify-between">
              <span>My Vending Route ({locations.length})</span>
              <span className="text-xs font-sans font-normal text-foreground/60">Saved Spots</span>
            </h4>
            
            <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {locations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-semibold">No locations plotted yet.</p>
                  <p className="text-xs mt-1">Add your first target prospect to start mapping your route!</p>
                </div>
              ) : (
                locations.map((loc) => {
                  let statusBadgeColor = "bg-primary/10 text-primary border-primary/20";
                  if (loc.status === "secured") statusBadgeColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
                  if (loc.status === "contacted") statusBadgeColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                  if (loc.status === "rejected") statusBadgeColor = "bg-muted text-muted-foreground border-muted-foreground/20";

                  return (
                    <div 
                      key={loc.id}
                      className="group border-2 border-foreground/5 hover:border-primary/20 rounded-md p-3 bg-background hover:bg-primary/5 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <h5 className="font-serif font-bold text-sm text-foreground truncate">{loc.name}</h5>
                          <p className="text-xs text-foreground/60 truncate">{loc.address}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${statusBadgeColor}`}>
                              {loc.status}
                            </span>
                            <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{loc.score}/5</span>
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => handleDeleteLocation(loc.id)}
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      
                      {/* Quick Action Button to Score this location */}
                      <div className="flex gap-2 pt-2 mt-2 border-t border-foreground/5">
                        <Button
                          onClick={() => onScoreLocation?.(loc.id)}
                          variant="outline"
                          size="sm"
                          className="w-full h-7 text-xs font-serif font-bold text-primary hover:bg-primary/5 flex items-center justify-center gap-1 border-primary/20"
                        >
                          <CheckSquare className="w-3 h-3" />
                          <span>{loc.score > 0 && loc.score !== 3 ? "Update Scorecard" : "Evaluate Scorecard"}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
