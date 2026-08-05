type Translation = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function formatActiveTime(seconds: number, t: Translation) {
  const normalizedSeconds = Math.max(0, Math.floor(seconds));
  if (normalizedSeconds < 60)
    return t("{value} seconds", { value: normalizedSeconds });
  const hours = Math.floor(normalizedSeconds / 3600);
  const minutes = Math.floor((normalizedSeconds % 3600) / 60);
  return hours
    ? t("{hours} hr {minutes} min", { hours, minutes })
    : t("{minutes} min", { minutes });
}
