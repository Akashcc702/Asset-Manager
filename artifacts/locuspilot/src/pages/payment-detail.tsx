import { Layout } from "@/components/layout";
import { Timeline } from "@/components/timeline";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetPayment, useSimulatePaymentSuccess } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { formatCurrency, formatDate } from "@/lib/format";
import { Copy, ExternalLink, Loader2, PlayCircle, AlertCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { getGetPaymentQueryKey, getGetDashboardSummaryQueryKey, getListActivityQueryKey } from "@workspace/api-client-react";

export default function PaymentDetail() {
  const [, params] = useRoute("/payments/:id");
  const id = Number(params?.id);
  const queryClient = useQueryClient();

  const { data: payment, isLoading, isError, refetch } = useGetPayment(id, {
    query: { enabled: !!id, queryKey: getGetPaymentQueryKey(id) }
  });

  const simulateSuccess = useSimulatePaymentSuccess();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !payment) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Payment Not Found</h2>
          <p className="text-muted-foreground mb-6">Could not load the payment details. It might not exist or there was a network error.</p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCcw className="w-4 h-4 mr-2" /> Retry
            </Button>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSimulate = () => {
    simulateSuccess.mutate({ id }, {
      onSuccess: () => {
        toast.success("Payment success simulated!");
        // Invalidate queries to refresh data across the app
        queryClient.invalidateQueries({ queryKey: getGetPaymentQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListActivityQueryKey() });
      },
      onError: (err: any) => {
        toast.error("Simulation failed: " + (err.error || "Unknown error"));
      }
    });
  };

  const handleCopyLink = () => {
    if (payment.paymentUrl) {
      navigator.clipboard.writeText(payment.paymentUrl);
      toast.success("Payment link copied to clipboard");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{payment.title}</h1>
              <StatusBadge status={payment.status} />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span className="font-mono bg-muted px-1.5 rounded">{payment.paymentId}</span>
              <span>•</span>
              <span>Created {formatDate(payment.createdAt)}</span>
            </div>
          </div>
          
          {payment.status === "pending" && (
            <Button 
              onClick={handleSimulate} 
              disabled={simulateSuccess.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all whitespace-nowrap"
            >
              {simulateSuccess.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlayCircle className="w-4 h-4 mr-2" />}
              Simulate Payment Success
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-primary/10 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-primary/5 to-transparent p-8 md:p-12 flex flex-col items-center justify-center text-center border-b">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Amount to collect</div>
                <div className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tighter">
                  {formatCurrency(payment.amount, payment.currency)}
                </div>
              </div>
              <CardContent className="p-6 md:p-8 space-y-8">
                
                {payment.paymentUrl && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Checkout Link</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted p-3 rounded-lg border font-mono text-sm truncate text-muted-foreground">
                        {payment.paymentUrl}
                      </div>
                      <Button variant="outline" size="icon" onClick={handleCopyLink} title="Copy link">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" asChild title="Open link">
                        <a href={payment.paymentUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Delivery Action</div>
                    <div className="font-medium bg-primary/5 text-primary inline-flex px-2 py-1 rounded text-sm">
                      {payment.deliveryAction}
                    </div>
                  </div>
                  {payment.note && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Internal Note</div>
                      <div className="text-sm">{payment.note}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {payment.rawPrompt && (
              <Card className="bg-muted/30 border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    Raw Agent Prompt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground italic">"{payment.rawPrompt}"</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar / Timeline */}
          <div className="space-y-6">
            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-4 border-b bg-muted/20">
                <CardTitle className="text-lg flex items-center gap-2">
                  Agent Activity
                  <Badge variant="secondary" className="ml-auto font-mono text-xs">{payment.logs.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-6">
                <Timeline logs={payment.logs} />
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </Layout>
  );
}

// Need to import Badge, adding it
import { Badge } from "@/components/ui/badge";