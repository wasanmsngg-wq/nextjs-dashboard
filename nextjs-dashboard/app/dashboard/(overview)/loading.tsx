import RouteLoadingAnnouncer from "@/app/ui/molecules/route-loading-announcer";

export default function Loading() {
  return (
    <main>
      <RouteLoadingAnnouncer />
      <div className="h-8 w-36 animate-pulse rounded bg-gray-100" />
    </main>
  );
}
