import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Volume2, ShieldCheck, MessageSquare, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function PitchHelper() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const scripts = [
    {
      title: "The Warm Intro (In-Person)",
      scenario: "Walking into a local auto shop, warehouse, or office to find the manager.",
      text: "Hi, my name is Clarence, and I'm with Snaxology Vending. We're a local, family-owned business right here in Miami. I was driving by and noticed your team works hard here, and I wanted to see if you have any vending or refreshment services on site? We actually provide, install, and stock modern, clean snack and drink machines completely free of charge to you. Our goal is to make sure your employees and customers have cold drinks and fresh snacks without you ever having to lift a finger or pay a cent. Is that something you'd be open to?"
    },
    {
      title: "The Cold Call Script",
      scenario: "Calling local businesses to identify the decision maker and schedule a visit.",
      text: "Hi there, I was hoping to speak with the office manager or facility director? ... Hi, my name is Clarence from Snaxology Vending. We're a local Miami vending operator. We're currently expanding our route in your area and are offering to place a brand-new, energy-efficient beverage and snack machine in your break room at zero cost to your company. We handle 100% of the installation, maintenance, and stocking. I'd love to drop by for just 5 minutes this Thursday to show you a quick photo of our modern machines and see if we'd be a good fit. Would morning or afternoon work better for you?"
    }
  ];

  const objections = [
    {
      q: "How much does this cost us?",
      a: "Absolutely nothing. Snaxology provides the machine, handles the delivery, keeps it fully stocked, and takes care of all maintenance at zero cost to you. We make our money solely from the items purchased by customers, so there's never a bill or invoice sent to your business."
    },
    {
      q: "We want a percentage of the sales (Commission).",
      a: "We completely understand! Many large operations ask for that. However, as a local operator, we focus 100% of our budget on providing premium, reliable service, stocking name-brand items, and responding to repairs within 24 hours. If we pay a high commission, we have to raise the prices of the snacks for your employees. What we suggest is starting with a 90-day trial period at zero commission so we can see the actual volume. If the machine does extremely well, we are more than happy to discuss a reasonable commission structure that works for both of us!"
    },
    {
      q: "What if the machine breaks down or eats someone's money?",
      a: "That's our top priority. Every Snaxology machine has a clear sticker with our direct phone number (305-527-0879) and email. If a machine ever has an issue or refunds are needed, we respond within 24 hours, and we refund any lost money immediately, no questions asked. We also use modern guaranteed-delivery sensors—if a snack doesn't drop, the customer's card or cash is never charged."
    },
    {
      q: "We already have a vending service, but they are terrible.",
      a: "I hear that all the time! Many vendors stock machines once a month or leave broken equipment sitting for weeks. At Snaxology, we pride ourselves on being a local boutique operator. We monitor our machines remotely so we know when they are running low before we even leave our warehouse. If you're unhappy with your current provider, we can easily coordinate a smooth transition with zero downtime for your staff."
    }
  ];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Script copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card className="tactile-card">
      <CardHeader className="bg-primary/5 border-b border-foreground/10 pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <CardTitle className="font-serif text-xl">Interactive Pitch & Objection Helper</CardTitle>
        </div>
        <CardDescription className="text-foreground/70">
          Use Clarence's battle-tested pitch scripts and objection-handling plays to secure prime placements.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="scripts" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6 bg-muted border-2 border-foreground/5 p-1 rounded-lg">
            <TabsTrigger value="scripts" className="font-serif font-bold py-2 data-[state=active]:bg-card data-[state=active]:text-primary rounded-md transition-all">
              Outreach Scripts
            </TabsTrigger>
            <TabsTrigger value="objections" className="font-serif font-bold py-2 data-[state=active]:bg-card data-[state=active]:text-primary rounded-md transition-all">
              Objection Crusher
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scripts" className="space-y-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {scripts.map((script, idx) => (
                <div key={idx} className="border-2 border-foreground/10 rounded-lg p-5 bg-card flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-lg text-primary">{script.title}</h4>
                      <Volume2 className="w-4 h-4 text-foreground/40" />
                    </div>
                    <p className="text-xs text-foreground/50 italic font-medium">{script.scenario}</p>
                    <p className="text-sm text-foreground/80 leading-relaxed font-sans pt-2 border-t border-dashed border-foreground/5">
                      "{script.text}"
                    </p>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(script.text, idx)}
                    variant="outline"
                    className="tactile-btn-secondary w-full flex items-center justify-center gap-2 mt-4"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-4 h-4 text-secondary" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="objections" className="space-y-4 focus-visible:outline-none">
            <div className="space-y-4 max-w-4xl mx-auto">
              {objections.map((obj, idx) => (
                <div key={idx} className="border-2 border-foreground/10 rounded-lg overflow-hidden">
                  <div className="bg-primary/5 px-4 py-3 border-b border-foreground/10 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-serif font-bold text-foreground text-sm sm:text-base">
                      Objection: "{obj.q}"
                    </span>
                  </div>
                  <div className="p-4 bg-card">
                    <p className="text-sm text-foreground/80 leading-relaxed font-sans">
                      <span className="font-serif font-bold text-primary mr-1">Your Response:</span>
                      {obj.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
