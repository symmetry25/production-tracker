export function formatUtcDate(value: Date | string | null | undefined) {
  const date = coerceDate(value);
  if (!date) return "--";

  return [date.getUTCFullYear(), padDatePart(date.getUTCMonth() + 1), padDatePart(date.getUTCDate())].join("/");
}

export function formatUtcShortDate(value: Date | string | null | undefined) {
  const date = coerceDate(value);
  if (!date) return "--";

  return [date.getUTCFullYear(), padDatePart(date.getUTCMonth() + 1), padDatePart(date.getUTCDate())].join("-");
}

export function formatUtcDateTime(value: Date | string | null | undefined, options: { seconds?: boolean } = {}) {
  const date = coerceDate(value);
  if (!date) return "--";

  const parts = [padDatePart(date.getUTCHours()), padDatePart(date.getUTCMinutes())];
  if (options.seconds) {
    parts.push(padDatePart(date.getUTCSeconds()));
  }

  return `${formatUtcDate(value)} ${parts.join(":")}`;
}

export function formatUtcMonthDayTime(value: Date | string | null | undefined) {
  const date = coerceDate(value);
  if (!date) return "--";

  return `${padDatePart(date.getUTCMonth() + 1)}/${padDatePart(date.getUTCDate())} ${padDatePart(date.getUTCHours())}:${padDatePart(date.getUTCMinutes())}`;
}

function coerceDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}
