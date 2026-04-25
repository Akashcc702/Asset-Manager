export type DeliveryActionMeta = {
  label: string;
  description: string;
};

const MAP: Record<string, DeliveryActionMeta> = {
  release_download: {
    label: "Download Invoice",
    description:
      "The customer gets access to the downloadable files after payment succeeds.",
  },
  send_file_after_payment: {
    label: "Send file after payment",
    description:
      "The agent emails the file attachment to the customer once payment is confirmed.",
  },
  mark_milestone_complete: {
    label: "Mark milestone complete",
    description:
      "The agent marks the project milestone as complete and notifies both sides.",
  },
  release_source_code: {
    label: "Release source code",
    description:
      "The agent shares the source code repository with the customer after payment.",
  },
  no_action: {
    label: "No follow-up action",
    description: "Payment is recorded only. The agent runs no delivery step.",
  },
  none: {
    label: "No follow-up action",
    description: "Payment is recorded only. The agent runs no delivery step.",
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
