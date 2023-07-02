export function ensureJSONResponse(response: Response) {
  const contentTypeParts = response.headers.get("content-type")?.split(";");

  if (contentTypeParts?.[0] !== "application/json") {
    throw new Error("Not JSON response");
  }

  return response.json();
}
