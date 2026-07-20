export const PRO_CURRENCY_OPTIONS = [
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "CAD", label: "CAD (C$)", symbol: "C$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
  { value: "GBP", label: "GBP (£)", symbol: "£" },
  { value: "AUD", label: "AUD (A$)", symbol: "A$" },
] as const;

export function currencySymbol(code: string): string {
  return PRO_CURRENCY_OPTIONS.find((c) => c.value === code)?.symbol ?? "$";
}
