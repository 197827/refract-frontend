/**
 * Parse a user-entered amount string into a finite number.
 *
 * Returns `null` for empty, whitespace-only, non-numeric, or `NaN` input so
 * callers can distinguish "no value" from a real numeric value (including 0).
 */
export function parseAmount(input: string | null | undefined): number | null {
  if (input == null) return null;
  const trimmed = input.trim();
  if (trimmed === "") return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;
  return value;
}

/**
 * Convert a decimal amount into stroops (7-decimal USDC base units).
 *
 * Throws a typed error when handed a non-finite number so an invalid amount
 * can never silently reach `BigInt` and surface as a raw `RangeError`.
 */
export function toStroops(amount: number): bigint {
  if (!Number.isFinite(amount)) {
    throw new TypeError(`toStroops: expected a finite number, received ${amount}`);
  }
  return BigInt(Math.round(amount * 10 ** 7));
}
