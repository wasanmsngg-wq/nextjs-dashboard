function partsAt(timestamp: number, timezone: string) {
  const dateTimeParts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone: timezone,
  });
  const parts = Object.fromEntries(
    dateTimeParts
      .formatToParts(new Date(timestamp))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
}

export function localDateBoundaryUtc(
  date: string,
  timezone: string,
  followingDay = false,
) {
  const [year, month, day] = date.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day + (followingDay ? 1 : 0));
  let candidate = target;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    candidate -= partsAt(candidate, timezone) - target;
  }
  return new Date(candidate).toISOString();
}

export function localCalendarDate(timestamp: number, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timezone,
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

export function startOfIsoWeek(date: string) {
  const instant = new Date(`${date}T00:00:00Z`);
  const daysSinceMonday = (instant.getUTCDay() + 6) % 7;
  instant.setUTCDate(instant.getUTCDate() - daysSinceMonday);
  return instant.toISOString().slice(0, 10);
}

export function addCalendarDays(date: string, days: number) {
  const instant = new Date(`${date}T00:00:00Z`);
  instant.setUTCDate(instant.getUTCDate() + days);
  return instant.toISOString().slice(0, 10);
}
