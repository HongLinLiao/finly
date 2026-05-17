export function normalizeOptionalText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";

  return text || null;
}

export function normalizeCurrency(value: FormDataEntryValue | null) {
  const text = normalizeOptionalText(value)?.toUpperCase() ?? null;

  if (!text) return null;

  return /^[A-Z]{3}$/.test(text) ? text : "INVALID";
}
