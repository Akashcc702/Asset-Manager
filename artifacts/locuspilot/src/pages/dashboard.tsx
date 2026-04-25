import { Layout } from "@/components/layout";
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, Activity, Wallet, Clock, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading, isError } = useGetDashboardSummary();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-40" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !summary) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-destructive mb-4">Failed to load dashboard data.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </Layout>
    );
  }

  const totals = summary.totalsByCurrency ?? [];
  const isMultiCurrency = totals.length > 1;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your agentic payments.</p>
          </div>
          <Link href="/create">
            <Button className="rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              New Payment Request
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm border-border/60 sm:col-span-2 md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isMultiCurrency ? "Collected by Currency" : "Total Collected"}
              </CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {totals.length === 0 ? (
                <>
                  <div className="text-2xl font-bold text-muted-foreground">--</div>
                  <p className="text-xs text-muted-foreground mt-1">No paid payments yet</p>
                </>
              ) : totals.length === 1 ? (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(totals[0].totalMinor, totals[0].currency)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totals[0].count} paid {totals[0].count === 1 ? "payment" : "payments"} in {totals[0].currency}
                  </p>
                </>
              ) : (
                <div className="space-y-1.5">
                  {totals.map((row) => (
                    <div
                      key={row.currency}
                      className="flex items-baseline justify-between gap-3"
                    >
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="text-[11px] font-mono font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {row.currency}
                        </span>
                        <span className="text-lg font-bold tabular-nums truncate">
                          {formatCurrency(row.totalMinor, row.currency)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {row.count} paid
                      </span>
                    </div>
                  ))}
                  <p className="text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
                    Currencies are not summed across each other.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid Requests</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.paidRequests}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.pendingRequests}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Payments */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Recent payments</h2>
              <Link href="/activity" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            
            {summary.recentPayments.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                <p className="text-muted-foreground">No payments yet</p>
                <Link href="/create">
                  <Button variant="link" className="mt-2 text-primary">Create your first payment</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary.recentPayments.map(payment => (
                  <Link key={payment.id} href={`/payments/${payment.id}`}>
                    <Card className="hover:shadow-md transition-all cursor-pointer h-full border-border/60 hover:border-primary/30 flex flex-col">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start mb-2">
                          <StatusBadge status={payment.status} />
                          <span className="text-xs text-muted-foreground">{new Date(payment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <CardTitle className="text-lg leading-tight line-clamp-2" title={payment.title}>{payment.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 mt-auto">
                        <div className="font-semibold text-xl text-primary mt-2">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Agent activity</h2>
            <Card className="border-border/60">
              <CardContent className="p-0">
                {summary.recentActivity.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No agent activity yet
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {summary.recentActivity.slice(0, 6).map(activity => (
                      <div key={activity.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-mono font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            {activity.actionType}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{formatDateTime(activity.createdAt)}</span>
                        </div>
                        <p className="text-sm text-foreground line-clamp-2">
                          {activity.actionSummary}
                        </p>
                        {activity.paymentRequestId && (
                          <Link href={`/payments/${activity.paymentRequestId}`} className="text-xs text-primary hover:underline mt-2 inline-flex items-center">
                            View payment <ArrowRight className="ml-1 w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {summary.recentActivity.length > 6 && (
                  <div className="p-3 border-t text-center">
                    <Link href="/activity">
                      <Button variant="ghost" size="sm" className="w-full text-xs">View entire log</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </Layout>
  );
}
