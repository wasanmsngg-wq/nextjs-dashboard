import RouteLoadingAnnouncer from "@/app/ui/molecules/route-loading-announcer";
export default function Loading() {
  return (
    <main className="p-6">
      <RouteLoadingAnnouncer />
      <div className="h-96 max-w-xl animate-pulse rounded-xl bg-gray-100" />
    </main>
  );
}
