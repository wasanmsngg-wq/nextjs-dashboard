export const HOSPITAL_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
export const DEFAULT_HOSPITAL_PAGE_SIZE = HOSPITAL_PAGE_SIZE_OPTIONS[0];

export function normalizeHospitalPageSize(value: string | number | undefined) {
  const pageSize = Number(value);
  return HOSPITAL_PAGE_SIZE_OPTIONS.includes(
    pageSize as (typeof HOSPITAL_PAGE_SIZE_OPTIONS)[number],
  )
    ? pageSize
    : DEFAULT_HOSPITAL_PAGE_SIZE;
}
