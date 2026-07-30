import RouteLoadingAnnouncer from "@/app/ui/molecules/route-loading-announcer";

export default function Loading() {
  return (
    <main className="p-6" aria-busy="true">
      <RouteLoadingAnnouncer />
    </main>
  );
}
