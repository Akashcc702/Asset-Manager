import { AgentActionLog } from "@workspace/api-client-react";
import { formatDateTime } from "@/lib/format";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getDeliveryActionLabel } from "@/lib/delivery-action";

function humanizePayload(payload: unknown): unknown {
  if (Array.isArray(payload)) return payload.map(humanizePayload);
  if (payload && typeof payload === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(payload as Record<string, unknown>)) {
      if (k === "deliveryAction" && typeof v === "string") {
        out[k] = `${v}  (${getDeliveryActionLabel(v)})`;
      } else {
        out[k] = humanizePayload(v);
      }
    }
    return out;
  }
  return payload;
}

export function Timeline({ logs }: { logs: AgentActionLog[] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
        <p className="text-muted-foreground text-sm">No agent activity yet.</p>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="relative border-l-2 border-primary/20 ml-3 md:ml-4 space-y-6 pb-4">
      {logs.map((log, index) => (
        <motion.div 
          key={log.id} 
          className="relative pl-6"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-primary" />
          <div className="bg-card border shadow-sm rounded-xl p-4 transition-all hover:shadow-md">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-primary/10 text-primary">
                    {log.actionType}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-foreground">
                  {log.actionSummary}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => copyToClipboard(log.actionSummary)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {log.actionPayload != null && Object.keys(log.actionPayload as Record<string, unknown>).length > 0 && (
              <div className="mt-3 bg-muted/50 rounded-lg p-3 overflow-x-auto">
                <pre className="text-[11px] text-muted-foreground font-mono">
                  {JSON.stringify(humanizePayload(log.actionPayload), null, 2)}
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
