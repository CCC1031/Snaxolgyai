import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, Mail, Download, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import html2pdf from "html2pdf.js";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculatorData: {
    monthlyRevenue: number;
    marginPercent: number;
    monthlyMargin: number;
    vendingPrice: number;
    cogs: number;
    annualProfit: number;
    machineCost: number;
    paybackMonths: number;
  };
  locations: Array<{
    name: string;
    address: string;
    score: number;
    status: string;
  }>;
}

export default function LeadCaptureModal({ isOpen, onClose, calculatorData, locations }: LeadCaptureModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmittingSuccess] = useState(false);

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please provide both your name and email.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API Lead Submission (and sending details to Clarence's inbox)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log("Lead captured for Clarence/Snaxology:", {
        lead: { name, email, phone },
        vendingPlan: { calculatorData, locations }
      });

      setIsSubmittingSuccess(true);
      toast.success("Vending plan generated successfully! Your download will start now.");
      
      // Trigger the PDF Generation
      generateBrandedPDF();
    } catch (err) {
      toast.error("Failed to generate plan. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateBrandedPDF = () => {
    // Create a temporary off-screen container styled with high-fidelity Snaxology Diner branding
    const element = document.createElement("div");
    element.style.padding = "40px";
    element.style.width = "750px";
    element.style.backgroundColor = "#FFFDFB"; // Custard Cream Background
    element.style.color = "#231515";
    element.style.fontFamily = "'Georgia', serif";

    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    element.innerHTML = `
      <div style="border: 4px double #B42318; padding: 30px; background-color: #FFFDFB;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px solid #B42318; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #B42318; font-size: 32px; font-weight: bold; margin: 0 0 10px 0; letter-spacing: -0.5px;">SNAXOLOGY</h1>
          <h2 style="font-size: 18px; text-transform: uppercase; letter-spacing: 2px; color: #555; margin: 0 0 15px 0; font-family: sans-serif;">Custom Vending Route Business Plan</h2>
          <p style="font-size: 12px; font-style: italic; color: #777; margin: 0;">Prepared for <strong>${name}</strong> on ${dateStr}</p>
        </div>

        <!-- Section 1: Executive Summary -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #B42318; font-size: 18px; border-bottom: 1px solid #E5E5E5; padding-bottom: 6px; margin-bottom: 12px;">1. Executive Summary</h3>
          <p style="font-size: 13px; line-height: 1.6; margin: 0 0 12px 0;">
            This customized business roadmap outlines the financial modeling and prospective location scoring for a high-performance vending route designed in partnership with <strong>Snaxology</strong>. By utilizing modern smart vending machinery and premium inventory selection, this route aims to capture high-margin passive cash flow.
          </p>
        </div>

        <!-- Section 2: Financial Projections -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #B42318; font-size: 18px; border-bottom: 1px solid #E5E5E5; padding-bottom: 6px; margin-bottom: 15px;">2. Financial Projections</h3>
          <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 12px; margin-bottom: 15px;">
            <thead>
              <tr style="background-color: #B42318; color: #FFFFFF;">
                <th style="padding: 8px 12px; text-align: left;">Financial Metric</th>
                <th style="padding: 8px 12px; text-align: right;">Projected Value</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #E5E5E5; background-color: #FFF9F6;">
                <td style="padding: 8px 12px; font-weight: bold;">Est. Monthly Revenue</td>
                <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: #B42318;">$${calculatorData.monthlyRevenue.toLocaleString()}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E5E5E5;">
                <td style="padding: 8px 12px;">Average Gross Margin</td>
                <td style="padding: 8px 12px; text-align: right;">${calculatorData.marginPercent}%</td>
              </tr>
              <tr style="border-bottom: 1px solid #E5E5E5; background-color: #FFF9F6;">
                <td style="padding: 8px 12px; font-weight: bold;">Monthly Gross Profit</td>
                <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: #B42318;">$${calculatorData.monthlyMargin.toLocaleString()}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E5E5E5;">
                <td style="padding: 8px 12px;">Average Product Sale Price</td>
                <td style="padding: 8px 12px; text-align: right;">$${calculatorData.vendingPrice.toFixed(2)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E5E5E5; background-color: #FFF9F6;">
                <td style="padding: 8px 12px; font-weight: bold;">Projected Annual Net Profit</td>
                <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: #B42318;">$${calculatorData.annualProfit.toLocaleString()}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E5E5E5;">
                <td style="padding: 8px 12px;">Estimated Equipment Cost</td>
                <td style="padding: 8px 12px; text-align: right;">$${calculatorData.machineCost.toLocaleString()}</td>
              </tr>
              <tr style="border-bottom: 2px solid #B42318; background-color: #FFF9F6;">
                <td style="padding: 8px 12px; font-weight: bold;">Estimated Payback Period</td>
                <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: #B42318;">${calculatorData.paybackMonths.toFixed(1)} Months</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Section 3: Plotted Locations -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #B42318; font-size: 18px; border-bottom: 1px solid #E5E5E5; padding-bottom: 6px; margin-bottom: 15px;">3. Target Plotted Locations</h3>
          ${
            locations.length === 0
              ? '<p style="font-size: 12px; font-style: italic; color: #777;">No custom locations plotted yet.</p>'
              : `
              <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px;">
                <thead>
                  <tr style="background-color: #555; color: #FFFFFF;">
                    <th style="padding: 6px 10px; text-align: left;">Location Name</th>
                    <th style="padding: 6px 10px; text-align: left;">Address</th>
                    <th style="padding: 6px 10px; text-align: center;">Score</th>
                    <th style="padding: 6px 10px; text-align: right;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${locations
                    .map(
                      (loc, i) => `
                    <tr style="border-bottom: 1px solid #E5E5E5; ${i % 2 === 0 ? "background-color: #FFFDFB;" : ""}">
                      <td style="padding: 6px 10px; font-weight: bold;">${loc.name}</td>
                      <td style="padding: 6px 10px; color: #666;">${loc.address}</td>
                      <td style="padding: 6px 10px; text-align: center; font-weight: bold; color: #B42318;">⭐ ${loc.score}/5</td>
                      <td style="padding: 6px 10px; text-align: right; text-transform: uppercase; font-weight: bold; font-size: 9px; color: ${
                        loc.status === "secured" ? "#74A35A" : loc.status === "contacted" ? "#E0843D" : "#B42318"
                      }">${loc.status}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            `
          }
        </div>

        <!-- Footer Call to Action -->
        <div style="border-top: 2px solid #B42318; padding-top: 20px; text-align: center; margin-top: 40px;">
          <h4 style="color: #B42318; font-size: 16px; font-weight: bold; margin: 0 0 6px 0;">Ready to secure your locations?</h4>
          <p style="font-size: 12px; color: #555; margin: 0 0 10px 0;">Let Snaxology help you secure high-quality machines, premium inventory, and expert placement assistance.</p>
          <p style="font-size: 11px; font-weight: bold; color: #B42318; margin: 0;">Visit snaxologyvending.com | Contact: info@snaxologyvending.com</p>
        </div>
      </div>
    `;

    // PDF Configuration Options
    const opt = {
      margin: 10,
      filename: `Snaxology_Vending_Plan_${name.replace(/\s+/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "letter", orientation: "portrait" },
    };

    // Render the PDF
    html2pdf().from(element).set(opt).save();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px] border-2 border-foreground/15 bg-background p-0 overflow-hidden shadow-xl rounded-xl">
        <DialogHeader className="bg-primary/5 border-b border-foreground/10 px-6 py-5 relative">
          <div className="absolute top-4 right-4 text-primary opacity-20">
            <Sparkles className="w-12 h-12 animate-pulse" />
          </div>
          <DialogTitle className="font-serif text-2xl text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <span>Generate Your Custom Plan</span>
          </DialogTitle>
          <DialogDescription className="text-foreground/70 mt-1">
            Submit your details to instantly download your Snaxology-branded PDF vending plan and send a lead summary directly to Clarence.
          </DialogDescription>
        </DialogHeader>

        {!isSubmitted ? (
          <form onSubmit={handleSubmitLead} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="lead-name" className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Full Name</Label>
              <div className="relative">
                <Input
                  id="lead-name"
                  placeholder="e.g., Clarence Snax"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 bg-background border-2 border-foreground/10 focus:border-primary"
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-foreground/40">
                  <span className="text-sm font-serif font-bold">@</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lead-email" className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Email Address</Label>
              <div className="relative">
                <Input
                  id="lead-email"
                  type="email"
                  placeholder="e.g., clarence@snaxology.ai"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-background border-2 border-foreground/10 focus:border-primary"
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-foreground/40">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lead-phone" className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Phone Number (Optional)</Label>
              <div className="relative">
                <Input
                  id="lead-phone"
                  type="tel"
                  placeholder="e.g., (305) 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9 bg-background border-2 border-foreground/10 focus:border-primary"
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-foreground/40">
                  <span className="text-sm font-bold">#</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full tactile-btn py-6 text-base font-bold flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Calculations...</span>
                </>
              ) : (
                <>
                  <span>Download PDF & Submit Lead</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-foreground">Plan Generated!</h3>
            <p className="text-sm text-foreground/70 max-w-sm mx-auto">
              Your customized business plan PDF is downloading. Clarence has been notified of your scorecard and will reach out to help you secure your locations!
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button onClick={generateBrandedPDF} variant="outline" className="tactile-btn-secondary flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>Re-download PDF</span>
              </Button>
              <Button onClick={onClose} className="tactile-btn">
                <span>Back to Dashboard</span>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
