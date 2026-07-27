import { SkeletonBlock } from '@/app/ui/atoms/skeleton-block';

export default function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md space-y-4">
        <SkeletonBlock className="h-20 rounded-lg" />
        <SkeletonBlock className="h-80 rounded-lg" />
      </div>
    </main>
  );
}
