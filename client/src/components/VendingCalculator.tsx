import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Percent, TrendingUp, Calendar } from "lucide-react";

export default function VendingCalculator() {
  const [machineCost, setMachineCost] = useState<number>(2000);
  const [monthlySales, setMonthlySales] = useState<number>(500);
  const [cogsPercent, setCogsPercent] = useState<number>(45); // Cost of Goods Sold %
  const [operatingExpenses, setOperatingExpenses] = useState<number>(50); // Gas, fees, etc.

  // Calculations
  const monthlyCOGS = (monthlySales * cogsPercent) / 100;
  const grossProfit = monthlySales - monthlyCOGS;
  const netProfit = grossProfit - operatingExpenses;
  const marginPercent = monthlySales > 0 ? (netProfit / monthlySales) * 100 : 0;
  const paybackPeriod = netProfit > 0 ? machineCost / netProfit : 0;

  return (
    <Card className="tactile-card">
      <CardHeader className="bg-primary/5 border-b border-foreground/10 pb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <CardTitle className="font-serif text-xl">Vending Profit & Payback Calculator</CardTitle>
        </div>
        <CardDescription className="text-foreground/70">
          Estimate your margins, monthly net profit, and how quickly your equipment will pay for itself.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-lg border-b border-foreground/10 pb-1">Your Estimates</h3>
          
          <div className="space-y-2">
            <Label htmlFor="machineCost" className="font-medium text-foreground/80">Machine & Setup Cost ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input
                id="machineCost"
                type="number"
                value={machineCost}
                onChange={(e) => setMachineCost(Math.max(0, Number(e.target.value)))}
                className="pl-9 bg-background border-2 border-foreground/10 focus:border-primary"
              />
            </div>
            <p className="text-xs text-foreground/50">Include transport, card reader, and initial stock.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlySales" className="font-medium text-foreground/80">Estimated Monthly Sales ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input
                id="monthlySales"
                type="number"
                value={monthlySales}
                onChange={(e) => setMonthlySales(Math.max(0, Number(e.target.value)))}
                className="pl-9 bg-background border-2 border-foreground/10 focus:border-primary"
              />
            </div>
            <p className="text-xs text-foreground/50">Average machine makes $300 - $600/month depending on location.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cogsPercent" className="font-medium text-foreground/80">Product Cost (COGS %)</Label>
              <div className="relative">
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <Input
                  id="cogsPercent"
                  type="number"
                  value={cogsPercent}
                  onChange={(e) => setCogsPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="pr-9 bg-background border-2 border-foreground/10 focus:border-primary"
                />
              </div>
              <p className="text-xs text-foreground/50">Cost of snacks/drinks. Standard is 40-50%.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatingExpenses" className="font-medium text-foreground/80">Monthly Gas & Fees ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <Input
                  id="operatingExpenses"
                  type="number"
                  value={operatingExpenses}
                  onChange={(e) => setOperatingExpenses(Math.max(0, Number(e.target.value)))}
                  className="pl-9 bg-background border-2 border-foreground/10 focus:border-primary"
                />
              </div>
              <p className="text-xs text-foreground/50">Gas, card reader fees, commissions.</p>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="bg-primary/5 rounded-lg border-2 border-primary/10 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="font-serif font-bold text-lg text-primary border-b border-primary/10 pb-1">Projections</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-foreground/60 font-semibold">Monthly Revenue</p>
                <p className="text-2xl font-bold font-serif text-foreground">${monthlySales.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-foreground/60 font-semibold">Product Cost</p>
                <p className="text-2xl font-bold font-serif text-foreground/80">${monthlyCOGS.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-primary/10">
              <div>
                <p className="text-xs uppercase tracking-wider text-foreground/60 font-semibold">Net Profit</p>
                <p className="text-2xl font-bold font-serif text-secondary">${netProfit > 0 ? netProfit.toFixed(2) : "0.00"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-foreground/60 font-semibold">Net Margin</p>
                <p className="text-2xl font-bold font-serif text-secondary">{netProfit > 0 ? `${marginPercent.toFixed(1)}%` : "0.0%"}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t-2 border-dashed border-primary/20 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-md text-primary mt-1">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-foreground/60 font-semibold">Estimated Payback Period</p>
                {netProfit > 0 ? (
                  <p className="text-2xl font-bold font-serif text-primary">
                    {paybackPeriod.toFixed(1)} <span className="text-sm font-sans font-normal text-foreground/70">Months</span>
                  </p>
                ) : (
                  <p className="text-lg font-serif text-destructive font-bold">Unprofitable (Increase sales or reduce costs)</p>
                )}
                <p className="text-xs text-foreground/50 mt-1">
                  Time before your machine pays for itself and starts printing pure profit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
