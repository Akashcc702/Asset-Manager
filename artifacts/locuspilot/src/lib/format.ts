import { format } from "date-fns";

export function formatCurrency(amount: number, currency: string = "INR") {
  return new Intl.NumberFormat(
    currency === "INR" ? "en-IN" : "en-US",
    {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  ).format(amount);
}

export function formatDate(dateString: string | Date) {
  return format(new Date(dateString), "MMM d, yyyy");
}

export function formatDateTime(dateString: string | Date) {
  return format(new Date(dateString), "MMM d, yyyy h:mm a");
}
