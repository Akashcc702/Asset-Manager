import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "@workspace/api-client-react";
import { CheckCircle2, Clock, XCircle, XOctagon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function StatusBadge({ status }: { status: PaymentStatus }) {
  const getProps = () => {
    switch (status) {
      case "paid":
        return {
          label: "Paid",
          className: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
        };
      case "pending":
        return {
          label: "Pending",
          className: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
          icon: <Clock className="w-3.5 h-3.5 mr-1" />,
        };
      case "failed":
        return {
          label: "Failed",
          className: "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100",
          icon: <XCircle className="w-3.5 h-3.5 mr-1" />,
        };
      case "cancelled":
        return {
          label: "Cancelled",
          className: "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100",
          icon: <XOctagon className="w-3.5 h-3.5 mr-1" />,
        };
      default:
        return {
          label: status,
          className: "",
          icon: null,
        };
    }
  };

  const props = getProps();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <Badge variant="outline" className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${props.className}`}>
          {props.icon}
          {props.label}
        </Badge>
      </motion.div>
    </AnimatePresence>
  );
}
