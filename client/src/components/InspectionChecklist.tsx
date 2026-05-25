import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ShieldAlert, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InspectionItem {
  id: string;
  text: string;
  category: "electrical" | "payment" | "mechanical" | "general";
  checked: boolean;
}

export default function InspectionChecklist() {
  const [items, setItems] = useState<InspectionItem[]>([
    { id: "p1", text: "Machine powers on without sparks, hums, or error codes.", category: "electrical", checked: false },
    { id: "p2", text: "Display screen works, is fully readable, and has no missing segments.", category: "electrical", checked: false },
    { id: "p3", text: "Bill validator accepts $1, $5, and $10 bills smoothly.", category: "payment", checked: false },
    { id: "p4", text: "Coin mechanism accepts nickels, dimes, and quarters.", category: "payment", checked: false },
    { id: "p5", text: "Coin mechanism dispenser works and dispenses change correctly.", category: "payment", checked: false },
    { id: "p6", text: "Every single selection button has been pressed and tested.", category: "mechanical", checked: false },
    { id: "p7", text: "Snack coils or drink columns spin/vend successfully when selected.", category: "mechanical", checked: false },
    { id: "p8", text: "Drink machine cools down properly (compressor kicks in, no loud rattling).", category: "electrical", checked: false },
    { id: "p9", text: "Door, lock, front glass, and rubber seals are in good physical condition.", category: "general", checked: false },
    { id: "p10", text: "Interior is clean, free from heavy rust, pests, and sticky soda residue.", category: "general", checked: false },
    { id: "p11", text: "Machine is MDB (Multi-Drop Bus) compatible for future card reader upgrades.", category: "payment", checked: false },
    { id: "p12", text: "Seller has provided a credible reason for selling and machine dimensions fit.", category: "general", checked: false }
  ]);

  const handleToggle = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleReset = () => {
    setItems(items.map(item => ({ ...item, checked: false })));
  };

  const checkedCount = items.filter(item => item.checked).length;
  const progressPercent = Math.round((checkedCount / items.length) * 100);

  // Group items by category
  const categories = {
    electrical: { title: "⚡ Electrical & Cooling", items: items.filter(i => i.category === "electrical") },
    payment: { title: "🪙 Payment Systems", items: items.filter(i => i.category === "payment") },
    mechanical: { title: "⚙️ Mechanical & Motors", items: items.filter(i => i.category === "mechanical") },
    general: { title: "📦 Cabinet & General", items: items.filter(i => i.category === "general") }
  };

  return (
    <Card className="tactile-card">
      <CardHeader className="bg-primary/5 border-b border-foreground/10 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              <CardTitle className="font-serif text-xl">On-Site Machine Inspection Checklist</CardTitle>
            </div>
            <CardDescription className="text-foreground/70">
              Take this checklist on your phone when inspecting a used vending machine. Never buy sight unseen!
            </CardDescription>
          </div>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="tactile-btn-secondary flex items-center gap-2 self-start sm:self-center"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Checklist</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Progress Bar */}
        <div className="bg-muted border-2 border-foreground/5 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60">Inspection Progress</span>
            <span className="text-sm font-bold font-serif text-primary">{checkedCount} / {items.length} Checked ({progressPercent}%)</span>
          </div>
          <Progress value={progressPercent} className="h-2.5 bg-background border border-foreground/10" />
          {progressPercent === 100 && (
            <div className="flex items-center gap-1.5 text-xs text-secondary font-semibold pt-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Perfect! This machine is fully verified and ready for deployment.</span>
            </div>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(categories).map(([key, cat]) => (
            <div key={key} className="border-2 border-foreground/10 rounded-lg p-4 bg-card space-y-3">
              <h4 className="font-serif font-bold text-foreground border-b border-foreground/10 pb-1 text-base">
                {cat.title}
              </h4>
              <div className="space-y-2.5">
                {cat.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5 group">
                    <Checkbox
                      id={item.id}
                      checked={item.checked}
                      onCheckedChange={() => handleToggle(item.id)}
                      className="mt-1 border-2 border-foreground/30 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                    />
                    <label
                      htmlFor={item.id}
                      className={`text-sm leading-relaxed cursor-pointer select-none transition-all ${
                        item.checked ? "text-foreground/40 line-through font-medium" : "text-foreground/80 hover:text-foreground"
                      }`}
                    >
                      {item.text}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
