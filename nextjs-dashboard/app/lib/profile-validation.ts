import { z } from "zod";

const timezone = z.string().refine((value) => {
  try {
    Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}, "Select a valid IANA timezone.");

export const profileSchema = z.object({
  displayName: z.string().trim().max(80),
  locale: z.enum(["en", "th"]),
  timezone,
  unitSystem: z.enum(["metric", "us"]),
});
