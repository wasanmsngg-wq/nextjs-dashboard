export function withSearchQuery(current: URLSearchParams, query: string) {
  const params = new URLSearchParams(current);
  if (query) params.set("query", query);
  else params.delete("query");
  return params;
}
