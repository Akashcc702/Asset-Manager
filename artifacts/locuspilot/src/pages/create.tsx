import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParseAgentIntent, useCreatePayment } from "@workspace/api-client-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Loader2, Bot, Sparkles, ArrowRight } from "lucide-react";
import { DeliveryAction, Currency } from "@workspace/api-client-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().int().min(1, "Amount must be at least 1"),
  currency: z.nativeEnum(Currency),
  note: z.string().optional(),
  deliveryAction: z.nativeEnum(DeliveryAction),
});

type FormValues = z.infer<typeof formSchema>;

const SUGGESTED_PROMPTS = [
  "Collect ₹499 for resume review",
  "Take ₹199 for my coding notes and send the file after payment",
  "Create milestone payment of ₹5000 for app UI design",
  "Ask client to pay ₹999 before source code delivery"
];

export default function CreatePayment() {
  const [, setLocation] = useLocation();
  const [prompt, setPrompt] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  
  const parseIntent = useParseAgentIntent();
  const createPayment = useCreatePayment();

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: 0,
      currency: "INR",
      note: "",
      deliveryAction: "none",
    }
  });

  const handleAutoFill = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }
    
    parseIntent.mutate({ data: { prompt } }, {
      onSuccess: (parsed) => {
        setValue("title", parsed.title, { shouldValidate: true });
        setValue("amount", parsed.amount, { shouldValidate: true });
        setValue("currency", parsed.currency as any, { shouldValidate: true });
        setValue("deliveryAction", parsed.deliveryAction as any, { shouldValidate: true });
        if (parsed.note) setValue("note", parsed.note);
        
        setConfidence(parsed.confidence);
        toast.success("Form populated by AI agent");
      },
      onError: (err: any) => {
        toast.error("Failed to parse intent: " + (err.error || "Unknown error"));
      }
    });
  };

  const onSubmit = (data: FormValues) => {
    createPayment.mutate({
      data: {
        ...data,
        rawPrompt: prompt || null,
      }
    }, {
      onSuccess: (payment) => {
        toast.success("Payment request created successfully");
        setLocation(`/payments/${payment.id}`);
      },
      onError: (err: any) => {
        toast.error("Failed to create payment: " + (err.error || "Unknown error"));
      }
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create Payment Request</h1>
          <p className="text-muted-foreground mt-2">Describe what you want to collect and what happens next.</p>
        </div>

        <div className="space-y-8">
          {/* Agent Input */}
          <Card className="border-primary/20 shadow-sm bg-gradient-to-b from-card to-muted/10">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="w-5 h-5 text-primary" />
                Agent Prompt
              </CardTitle>
              <CardDescription>Tell the agent what to do in plain English.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="text-xs bg-background border border-border/60 hover:border-primary/50 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-colors text-left"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Textarea 
                  placeholder="E.g., Collect ₹1500 for the logo design final files and send the source code..."
                  className="min-h-[120px] resize-none text-base p-4 pr-32 rounded-xl"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Button 
                  className="absolute bottom-3 right-3 rounded-lg"
                  onClick={handleAutoFill}
                  disabled={parseIntent.isPending || !prompt.trim()}
                >
                  {parseIntent.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Auto-fill
                </Button>
              </div>
              {confidence !== null && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-md border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />
                  Agent parsed with {Math.round(confidence * 100)}% confidence
                </div>
              )}
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Controller
                    control={control}
                    name="title"
                    render={({ field }) => (
                      <Input id="title" placeholder="E.g., Logo Design Final Payment" {...field} />
                    )}
                  />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount (Major Units)</Label>
                    <Controller
                      control={control}
                      name="amount"
                      render={({ field }) => (
                        <Input id="amount" type="number" placeholder="E.g., 1500" {...field} />
                      )}
                    />
                    {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Controller
                      control={control}
                      name="currency"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id="currency">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="deliveryAction">Post-Payment Action</Label>
                  <Controller
                    control={control}
                    name="deliveryAction"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="deliveryAction">
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (just collect payment)</SelectItem>
                          <SelectItem value="send_file_after_payment">Send file after payment</SelectItem>
                          <SelectItem value="release_download">Release digital download</SelectItem>
                          <SelectItem value="mark_milestone_complete">Mark milestone as complete</SelectItem>
                          <SelectItem value="release_source_code">Release source code</SelectItem>
                          <SelectItem value="send_invoice_receipt">Send invoice receipt</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="note">Internal Note (Optional)</Label>
                  <Controller
                    control={control}
                    name="note"
                    render={({ field }) => (
                      <Input id="note" placeholder="E.g., Client from Upwork" {...field} value={field.value || ""} />
                    )}
                  />
                </div>

              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" className="rounded-full px-8" disabled={createPayment.isPending}>
                {createPayment.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generate Payment Link
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
