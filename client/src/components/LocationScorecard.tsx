import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckSquare, AlertTriangle, Sparkles, HelpCircle, ArrowLeft, Save, MapPin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface ScoreFactor {
  id: string;
  name: string;
  weight: string;
  score: number;
}

interface LocationScorecardProps {
  selectedLocationId?: string | null;
  onLocationChange?: (id: string | null) => void;
  onBackToMap?: () => void;
}

interface VendingLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  score: number;
  status: "prospect" | "contacted" | "secured" | "rejected";
  detailedScores?: Record<string, number>;
}

export default function LocationScorecard({ 
  selectedLocationId, 
  onLocationChange,
  onBackToMap 
}: LocationScorecardProps) {
  const [locations, setLocations] = useState<VendingLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<VendingLocation | null>(null);
  const [locationName, setLocationName] = useState<string>("Sample Location (e.g., Local Warehouse)");
  const [factors, setFactors] = useState<ScoreFactor[]>([
    { id: "traffic", name: "Daily Foot Traffic", weight: "High volume is critical", score: 3 },
    { id: "dwell", name: "People remain on site for long periods", weight: "Dwell time drives snack hunger", score: 3 },
    { id: "competition", name: "Limited nearby food and drink competition", weight: "No close convenience stores", score: 3 },
    { id: "access", name: "Easy restocking access", weight: "Parking, ground floor, or elevator", score: 3 },
    { id: "visibility", name: "Safe, visible machine placement", weight: "High-traffic corridor/breakroom", score: 3 },
    { id: "power", name: "Reliable electrical outlet", weight: "Dedicated outlet, no light switches", score: 3 },
    { id: "decision", name: "Decision maker is responsive", weight: "Easy to communicate with", score: 3 },
    { id: "commission", name: "Commission expectations are reasonable", weight: "Ideally 0% to start, max 10%", score: 3 },
    { id: "audience", name: "Customer base matches products", weight: "Blue-collar likes hearty snacks", score: 3 },
    { id: "expansion", name: "Opportunity to expand later", weight: "Space for more machines/smart coolers", score: 3 }
  ]);

  // Load locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("snaxology_vending_locations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocations(parsed);
      } catch (e) {
        console.error("Failed to load locations in scorecard", e);
      }
    }
  }, [selectedLocationId]);

  // Handle selected location change
  useEffect(() => {
    if (locations.length > 0 && selectedLocationId) {
      const loc = locations.find(l => l.id === selectedLocationId);
      if (loc) {
        setSelectedLocation(loc);
        setLocationName(loc.name);
        
        // Load detailed scores if they exist, otherwise default to average/existing score
        const defaultScore = loc.score > 0 ? Math.round(loc.score) : 3;
        const detailed = loc.detailedScores || {};
        
        setFactors(prev => prev.map(f => ({
          ...f,
          score: detailed[f.id] !== undefined ? detailed[f.id] : defaultScore
        })));
      }
    } else {
      setSelectedLocation(null);
    }
  }, [locations, selectedLocationId]);

  const handleScoreChange = (id: string, value: number) => {
    const validatedValue = Math.max(1, Math.min(5, value));
    setFactors(factors.map(f => f.id === id ? { ...f, score: validatedValue } : f));
  };

  const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
  
  // Calculate average out of 5 to save back to the map location
  const averageScore = Math.round((totalScore / 50) * 5 * 10) / 10; // Round to 1 decimal place

  // Save the scorecard back to the location list
  const handleSaveScorecard = () => {
    if (!selectedLocationId || !selectedLocation) {
      toast.error("No active mapped location selected to save this scorecard.");
      return;
    }

    const detailedScores: Record<string, number> = {};
    factors.forEach(f => {
      detailedScores[f.id] = f.score;
    });

    const updatedLocations = locations.map(loc => {
      if (loc.id === selectedLocationId) {
        return {
          ...loc,
          name: locationName, // Allow renaming from scorecard
          score: Math.round(averageScore), // Save 1-5 integer score for pins
          detailedScores
        };
      }
      return loc;
    });

    localStorage.setItem("snaxology_vending_locations", JSON.stringify(updatedLocations));
    setLocations(updatedLocations);
    
    toast.success(`Scorecard for "${locationName}" saved successfully!`, {
      description: `Calculated Score: ${totalScore}/50 (Map Rating: ${Math.round(averageScore)}/5 Stars)`
    });

    if (onBackToMap) {
      setTimeout(() => {
        onBackToMap();
      }, 800);
    }
  };

  // Score analysis
  let scoreStatus = {
    color: "text-amber-600 bg-amber-50 border-amber-200",
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    text: "Caution Needed",
    desc: "A location scoring under 30 needs caution. It may have weak traffic, difficult access, or high commissions that will eat your margins. Consider renegotiating terms or testing with a lower-cost machine first."
  };

  if (totalScore >= 35) {
    scoreStatus = {
      color: "text-secondary bg-secondary/10 border-secondary/20",
      icon: <Sparkles className="w-5 h-5 text-secondary" />,
      text: "Excellent Opportunity",
      desc: "A location scoring 35 or higher deserves serious consideration! The traffic, accessibility, and cooperation from the decision maker are highly favorable. Secure this spot as soon as possible."
    };
  } else if (totalScore >= 30) {
    scoreStatus = {
      color: "text-primary bg-primary/5 border-primary/10",
      icon: <CheckSquare className="w-5 h-5 text-primary" />,
      text: "Good / Viable Spot",
      desc: "Scoring between 30 and 34 indicates a solid, standard vending location. Ensure your product mix is tailored to the audience and monitor your margins closely."
    };
  }

  return (
    <Card className="tactile-card">
      <CardHeader className="bg-primary/5 border-b border-foreground/10 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {onBackToMap && (
                <Button 
                  onClick={onBackToMap}
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 -ml-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <CardTitle className="font-serif text-xl">Interactive Location Scorecard</CardTitle>
            </div>
            <CardDescription className="text-foreground/70">
              {selectedLocation 
                ? `Scoring mapped location: ${selectedLocation.name}`
                : "Score your prospective locations from 1 (poor) to 5 (excellent) to filter out bad placements."
              }
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {locations.length > 0 && (
              <select
                value={selectedLocationId || ""}
                onChange={(e) => onLocationChange?.(e.target.value || null)}
                className="h-10 rounded-md border-2 border-foreground/10 bg-background px-3 py-1.5 text-sm font-serif font-bold text-primary focus:border-primary focus:outline-none"
              >
                <option value="">-- Select Mapped Location --</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>📍 {loc.name}</option>
                ))}
              </select>
            )}
            
            <Input
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="bg-background border-2 border-foreground/15 font-serif font-bold text-primary max-w-xs"
              placeholder="Enter Location Name"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {selectedLocation && (
          <div className="bg-primary/5 border border-primary/10 rounded-md p-3 flex items-center gap-2 text-xs text-primary font-medium">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span>Connected to mapped spot: <strong>{selectedLocation.name}</strong> ({selectedLocation.address})</span>
          </div>
        )}

        <div className="overflow-x-auto border-2 border-foreground/10 rounded-lg">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="font-serif font-bold text-foreground">Scoring Factor</TableHead>
                <TableHead className="font-serif font-bold text-foreground hidden md:table-cell">Why It Matters</TableHead>
                <TableHead className="font-serif font-bold text-foreground text-center w-28">Score (1–5)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {factors.map((factor) => (
                <TableRow key={factor.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="font-medium text-foreground/90">
                    {factor.name}
                    <div className="text-xs text-foreground/50 md:hidden mt-0.5">{factor.weight}</div>
                  </TableCell>
                  <TableCell className="text-foreground/60 text-xs hidden md:table-cell">{factor.weight}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={factor.score}
                        onChange={(e) => handleScoreChange(factor.id, Number(e.target.value))}
                        className="w-16 text-center font-bold border-2 border-foreground/10 focus:border-primary bg-background"
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-foreground/30 cursor-pointer hover:text-foreground/50" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-foreground text-background max-w-xs">
                          Score 1 (Awful) to 5 (Outstanding) based on your site visit.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Results Panel */}
        <div className={`border-2 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 ${scoreStatus.color}`}>
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              {scoreStatus.icon}
              <h4 className="font-serif font-bold text-lg">{scoreStatus.text} for {locationName}</h4>
            </div>
            <p className="text-sm leading-relaxed opacity-90">{scoreStatus.desc}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0">
            <div className="text-center md:border-l-2 md:border-dashed md:border-foreground/10 md:pl-6 flex flex-col justify-center min-w-[120px]">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Total Score</p>
              <p className="text-5xl font-bold font-serif mt-1">{totalScore}</p>
              <p className="text-xs opacity-60 mt-1">out of 50</p>
            </div>

            {selectedLocationId && (
              <Button
                onClick={handleSaveScorecard}
                className="tactile-btn-primary w-full sm:w-auto h-12 px-6 flex items-center justify-center gap-2 font-serif font-bold tracking-wider"
              >
                <Save className="w-4 h-4" />
                <span>Save Scorecard</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
