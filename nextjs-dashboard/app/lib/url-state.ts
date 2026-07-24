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

export function parsePositivePage(value: string | undefined): number | null {
  if (value === undefined) {
    return 1;
  }

  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const page = Number(value);

  if (!Number.isSafeInteger(page)) {
    return null;
  }

  return page;
}

export function normalizePage(
    value: string | undefined,
    totalPages: number,
) {
  const parsedPage = parsePositivePage(value);
  const lastPage = Math.max(totalPages, 1);
  const page = parsedPage === null ? 1 : Math.min(parsedPage, lastPage);

  return {
    page,
    needsRedirect:
        value !== undefined && (parsedPage === null || parsedPage !== page),
  };
}
