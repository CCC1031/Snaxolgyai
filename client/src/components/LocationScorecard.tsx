import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { CheckSquare, AlertTriangle, Sparkles, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ScoreFactor {
  id: string;
  name: string;
  weight: string;
  score: number;
}

export default function LocationScorecard() {
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

  const handleScoreChange = (id: string, value: number) => {
    const validatedValue = Math.max(1, Math.min(5, value));
    setFactors(factors.map(f => f.id === id ? { ...f, score: validatedValue } : f));
  };

  const totalScore = factors.reduce((sum, f) => sum + f.score, 0);

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="font-serif text-xl">Interactive Location Scorecard</CardTitle>
            <CardDescription className="text-foreground/70">
              Score your prospective locations from 1 (poor) to 5 (excellent) to filter out bad placements.
            </CardDescription>
          </div>
          <div className="w-full sm:w-auto">
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
          <div className="text-center md:border-l-2 md:border-dashed md:border-foreground/10 md:pl-8 flex flex-col justify-center min-w-[120px]">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Total Score</p>
            <p className="text-5xl font-bold font-serif mt-1">{totalScore}</p>
            <p className="text-xs opacity-60 mt-1">out of 50</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
