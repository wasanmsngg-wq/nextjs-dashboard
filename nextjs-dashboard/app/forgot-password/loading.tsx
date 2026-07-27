import RouteLoadingAnnouncer from "@/app/ui/molecules/route-loading-announcer";
export default function Loading() {
  return (
    <main className="p-6">
      <RouteLoadingAnnouncer />
      <div className="mx-auto h-80 max-w-md animate-pulse rounded-xl bg-gray-100" />
    </main>
  );
}
