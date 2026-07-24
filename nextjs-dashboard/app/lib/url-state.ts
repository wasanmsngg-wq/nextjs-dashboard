export function withSearchQuery(current: URLSearchParams, query: string) {
  const params = new URLSearchParams(current);
  params.set('page', '1');
  if (query) params.set('query', query);
  else params.delete('query');
  return params;
}

export function withPageSize(current: URLSearchParams, pageSize: number, allowed: readonly number[]) {
  if (!allowed.includes(pageSize)) return new URLSearchParams(current);
  const params = new URLSearchParams(current);
  params.set('pageSize', String(pageSize));
  params.set('page', '1');
  return params;
}

export function withPage(current: URLSearchParams, page: number | string) {
  const params = new URLSearchParams(current);
  params.set('page', String(page));
  return params;
}
