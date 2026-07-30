export type AppIdentity =
  { kind: "guest"; guestId: string } | { kind: "user"; userId: string };
