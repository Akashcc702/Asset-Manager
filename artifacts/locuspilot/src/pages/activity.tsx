import { Layout } from "@/components/layout";
import { Timeline } from "@/components/timeline";
import { useListActivity } from "@workspace/api-client-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/lib/use-debounce"; // Need to write this small hook or just use local state directly

export default function Activity() {
  const [filterId, setFilterId] = useState("");
  // Simple local debounce since we only re-render when user types
  
  // Convert string to number, NaN if invalid
  const paymentIdNum = filterId.trim() ? parseInt(filterId.trim(), 10) : undefined;
  
  const { data: logs, isLoading } = useListActivity({
    limit: 100,
    ...(paymentIdNum && !isNaN(paymentIdNum) ? { paymentId: paymentIdNum } : {})
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agent Activity</h1>
            <p className="text-muted-foreground mt-1">A complete timeline of all automated agent actions.</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter by Payment ID..."
              className="pl-9"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-card border rounded-xl shadow-sm p-4 sm:p-8">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : logs && logs.length > 0 ? (
            <Timeline logs={logs} />
          ) : (
            <div className="text-center py-20 px-4">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No activity found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {filterId ? `No agent actions found for Payment ID ${filterId}.` : "No agent activity yet. Create your first payment request to see the agent in action."}
              </p>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
