export function ensureNonEmptyString(value: any) {
  if (value && typeof value === "string") {
    return value;
  }

  throw new Error("Must be non-empty string");
}
