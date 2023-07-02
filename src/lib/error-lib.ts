export function areErrorMessagesEquals(
  a: Error | null | undefined,
  b: Error | null | undefined
) {
  return a?.message === b?.message;
}
