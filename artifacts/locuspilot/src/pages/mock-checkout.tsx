import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetPayment,
  useSimulatePaymentSuccess,
  getGetPaymentQueryKey,
  getGetDashboardSummaryQueryKey,
  getListActivityQueryKey,
} from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { formatCurrency } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  TestTube2,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

export default function MockCheckout() {
  const [, params] = useRoute("/mock-checkout/:id");
  const id = Number(params?.id);
  const queryClient = useQueryClient();

  const { data: payment, isLoading, isError } = useGetPayment(id, {
    query: { enabled: !!id, queryKey: getGetPaymentQueryKey(id) },
  });

  const simulate = useSimulatePaymentSuccess();

  const handleSimulate = () => {
    simulate.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Mock payment marked successful");
          queryClient.invalidateQueries({ queryKey: getGetPaymentQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListActivityQueryKey() });
        },
        onError: () => toast.error("Could not simulate the payment"),
      },
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-xl">
          <Skeleton className="h-[480px] w-full rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (isError || !payment) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Checkout Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find a payment for this checkout link.
          </p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isPaid = payment.status === "paid";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-xl">
        {/* Demo banner */}
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-amber-900">
          <TestTube2 className="h-4 w-4 shrink-0" />
          <p className="text-xs font-medium leading-snug">
            Demo checkout for mock mode. No real card is charged. The agent treats
            this exactly like a CheckoutWithLocus session.
          </p>
        </div>

        <Card className="overflow-hidden border-border/60 shadow-lg">
          {/* Top brand strip */}
          <div className="flex items-center justify-between border-b bg-muted/30 px-6 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CreditCard className="h-4 w-4 text-primary" />
              CheckoutWithLocus
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                · Mock
              </span>
            </div>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {payment.paymentId}
            </Badge>
          </div>

          <CardHeader className="space-y-2 pt-8 text-center">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              You are paying
            </p>
            <CardTitle className="text-xl font-semibold leading-tight">
              {payment.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            <div className="text-center">
              <div className="text-5xl font-extrabold tracking-tighter">
                {formatCurrency(payment.amount, payment.currency)}
              </div>
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span>Status</span>
                <StatusBadge status={payment.status} />
              </div>
            </div>

            {payment.note && (
              <div className="rounded-lg border bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
                {payment.note}
              </div>
            )}

            {/* Action */}
            {isPaid ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-base font-semibold text-emerald-900">
                    Payment received
                  </p>
                  <p className="mt-1 text-xs text-emerald-800/80">
                    The agent has executed the post-payment delivery action.
                  </p>
                </div>
                <Link href={`/payments/${payment.id}`}>
                  <Button variant="outline" size="sm" className="mt-2">
                    View receipt and timeline
                  </Button>
                </Link>
              </div>
            ) : (
              <Button
                size="lg"
                className="h-12 w-full text-base font-semibold"
                onClick={handleSimulate}
                disabled={simulate.isPending}
              >
                {simulate.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                Pay {formatCurrency(payment.amount, payment.currency)}
              </Button>
            )}

            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Simulated secure checkout. No real funds move in mock mode.
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href={`/payments/${payment.id}`}>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="mr-2 h-3.5 w-3.5" />
              Back to payment details
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
