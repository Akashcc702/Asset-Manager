export type DeliveryActionMeta = {
  label: string;
  description: string;
};

const MAP: Record<string, DeliveryActionMeta> = {
  release_download: {
    label: "Unlock download for customer",
    description:
      "The agent automatically unlocks the digital download for the customer after payment succeeds.",
  },
  send_file_after_payment: {
    label: "Send file after payment",
    description:
      "The agent automatically emails the file attachment to the customer once payment is confirmed.",
  },
  mark_milestone_complete: {
    label: "Mark milestone complete",
    description:
      "The agent automatically marks the project milestone as complete and notifies both sides.",
  },
  release_source_code: {
    label: "Release source code",
    description:
      "The agent automatically shares the source code repository with the customer after payment.",
  },
  send_invoice_receipt: {
    label: "Email receipt after payment",
    description:
      "The agent automatically emails an invoice receipt to the customer once the payment clears.",
  },
  no_action: {
    label: "No follow-up action",
    description: "Payment is recorded only. The agent runs no automation after payment.",
  },
  none: {
    label: "No follow-up action",
    description: "Payment is recorded only. The agent runs no automation after payment.",
  },
};

export function getDeliveryActionMeta(value: string | null | undefined): DeliveryActionMeta {
  if (!value) return MAP.no_action;
  return (
    MAP[value] ?? {
      label: value
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      description: "",
    }
  );
}

export function getDeliveryActionLabel(value: string | null | undefined): string {
  return getDeliveryActionMeta(value).label;
}
