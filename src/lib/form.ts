export function normalizeOptionalText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";

  return text || null;
}

export function normalizeCurrency(value: FormDataEntryValue | null) {
  const text = normalizeOptionalText(value)?.toUpperCase() ?? null;

  if (!text) return null;

  return /^[A-Z]{3}$/.test(text) ? text : "INVALID";
}

export function normalizeNumber(value: FormDataEntryValue | null) {
  const text = normalizeOptionalText(value);

  if (!text) return null;

  const number = Number(text);

  return Number.isFinite(number) ? number : null;
}

export function normalizeDate(value: FormDataEntryValue | null) {
  const text = normalizeOptionalText(value);

  if (!text) return null;

  const date = new Date(`${text}T00:00:00.000+08:00`);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
