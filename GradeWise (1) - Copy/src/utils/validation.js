export const WEIGHT_TOLERANCE = 0.01;

export function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

export function roundTo(value, decimals = 10) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function resultOk(result) {
  return { valid: true, errors: [], result };
}

export function resultError(errors) {
  return { valid: false, errors, result: null };
}

export function numericError(field, value, { min = 0, max = Infinity, required = true } = {}) {
  if (value === undefined || value === null) {
    return required ? { field, code: "required", message: `${field} is required.` } : null;
  }
  if (!isFiniteNumber(value)) {
    return { field, code: "invalid_number", message: `${field} must be a finite number.` };
  }
  if (value < min || value > max) {
    return { field, code: "out_of_range", message: `${field} must be between ${min} and ${max}.` };
  }
  return null;
}

export function stringError(field, value) {
  if (typeof value !== "string" || value.trim() === "") {
    return { field, code: "required", message: `${field} must be a non-empty string.` };
  }
  return null;
}
