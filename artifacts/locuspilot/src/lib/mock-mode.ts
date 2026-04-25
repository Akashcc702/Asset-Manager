export function isMockCheckoutUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return host === "pay.locus.mock" || host.endsWith(".pay.locus.mock");
  } catch {
    return url.includes("pay.locus.mock");
  }
}

export function getPaymentIdFromMockUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? null;
  } catch {
    return null;
  }
}
