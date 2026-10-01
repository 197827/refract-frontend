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

/**
 * Minimum deposit accepted by the protocol, in USDC.
 *
 * Documented here so both the deposit form and any future callers share a
 * single source of truth for the protocol floor.
 */
export const MIN_DEPOSIT_USDC = 1;

/**
 * Number of decimal places USDC supports (7-decimal base units / stroops).
 */
export const USDC_DECIMALS = 7;

/**
 * Count the number of significant decimal places in a numeric string.
 *
 * Returns 0 for values without a fractional part and `null` when the string
 * is not a plain decimal number (e.g. `abc`, `1e3`, `Infinity`).
 */
export function decimalPlaces(input: string | null | undefined): number | null {
  if (input == null) return null;
  const trimmed = input.trim();
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null;
  const dot = trimmed.indexOf(".");
  if (dot === -1) return 0;
  return trimmed.length - dot - 1;
}

/**
 * Classify a user-entered amount for a form field.
 *
 * Returns a discriminated result so callers can derive the inline error, the
 * submit-button disabled state and the preview from a single source of truth.
 * `value` is only present when the input is a valid, in-range amount.
 */
export type AmountValidation =
  | { status: "empty" }
  | { status: "invalid"; error: string }
  | { status: "valid"; value: number };

export interface ValidateAmountOptions {
  /** Reject amounts strictly below this value. */
  min?: number;
  /** Reject amounts strictly above this value. */
  max?: number;
  /** Reject amounts with more fractional digits than this. */
  maxDecimals?: number;
  /** Human-readable label used in error messages (e.g. "deposit"). */
  label?: string;
}

/**
 * Validate a user-entered amount string against optional bounds.
 *
 * Parse-first: unparseable input is rejected before any comparison, so
 * `NaN`-style inputs can never slip through a `value > max` check.
 */
export function validateAmount(
  input: string | null | undefined,
  options: ValidateAmountOptions = {},
): AmountValidation {
  const { min, max, maxDecimals, label = "amount" } = options;
  const trimmed = input?.trim() ?? "";
  if (trimmed === "") return { status: "empty" };

  const value = parseAmount(trimmed);
  if (value === null) {
    return { status: "invalid", error: `Enter a valid ${label}.` };
  }
  if (value <= 0) {
    return { status: "invalid", error: `Enter a ${label} greater than 0.` };
  }
  if (maxDecimals !== undefined) {
    const places = decimalPlaces(trimmed);
    if (places === null || places > maxDecimals) {
      return {
        status: "invalid",
        error: `Use at most ${maxDecimals} decimal places.`,
      };
    }
  }
  if (min !== undefined && value < min) {
    return { status: "invalid", error: `Minimum ${label} is ${min}.` };
  }
  if (max !== undefined && value > max) {
    return { status: "invalid", error: `Maximum ${label} is ${max}.` };
  }
  return { status: "valid", value };
}

