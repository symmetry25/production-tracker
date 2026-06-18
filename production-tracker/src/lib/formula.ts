const allowedMathPattern = /^[0-9+\-*/().\s]+$/;

export function evaluateFormula(expression: string, data: Record<string, unknown>): number | string {
  const replaced = expression.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, key: string) => String(toFormulaNumber(data[key])));

  if (!allowedMathPattern.test(replaced)) {
    return "#ERROR";
  }

  try {
    const result = Function(`"use strict"; return (${replaced})`)() as unknown;
    return typeof result === "number" && Number.isFinite(result) ? normalizeFormulaNumber(result) : "#ERROR";
  } catch {
    return "#ERROR";
  }
}

export function applyFormulaFields<T extends Record<string, unknown>>(
  data: T,
  fields: { key: string; type: string; config?: { expression?: string } }[],
): T {
  return fields.reduce<T>((next, field) => {
    if (field.type !== "formula" || !field.config?.expression) {
      return next;
    }

    return { ...next, [field.key]: evaluateFormula(field.config.expression, next) };
  }, data);
}

function toFormulaNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normalizeFormulaNumber(value: number) {
  return Number(value.toFixed(6));
}
