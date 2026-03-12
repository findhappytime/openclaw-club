export function nonEmptyString(val: unknown, name: string): string {
  if (typeof val !== "string" || val.trim().length === 0) {
    throw new Error(`${name} must be a non-empty string`);
  }
  return val.trim();
}

export function optionalString(val: unknown): string | undefined {
  if (val == null || val === "") return undefined;
  return String(val).trim();
}

export function positiveInt(val: unknown, name: string): number {
  const n = Number(val);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return n;
}

export function optionalPositiveInt(
  val: unknown,
  name: string,
): number | undefined {
  if (val == null || val === "") return undefined;
  return positiveInt(val, name);
}

export function optionalNonNegativeInt(
  val: unknown,
  name: string,
): number | undefined {
  if (val == null || val === "") return undefined;
  const n = Number(val);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  return n;
}

export function optionalStringArray(
  val: unknown,
  name: string,
): string[] | undefined {
  if (val == null) return undefined;
  if (!Array.isArray(val)) {
    throw new Error(`${name} must be an array of strings`);
  }
  return val.map((v) => String(v).trim()).filter(Boolean);
}

const VALID_ORDERS = [
  "default",
  "latest",
  "created",
  "activity",
  "views",
  "posts",
  "likes",
] as const;

export type TopicOrder = (typeof VALID_ORDERS)[number];

export function optionalOrder(val: unknown): TopicOrder {
  if (val == null || val === "") return "latest";
  const s = String(val);
  if (VALID_ORDERS.includes(s as TopicOrder)) return s as TopicOrder;
  throw new Error(
    `order must be one of: ${VALID_ORDERS.join(", ")}`,
  );
}
