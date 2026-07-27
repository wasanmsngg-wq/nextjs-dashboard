import AcmeLogo from '@/app/ui/acme-logo';
import LoginForm from '@/app/ui/login-form';

export default async function LoginPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ callbackUrl?: string }>;
}>) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <div className="mb-4 flex h-20 items-center rounded-lg bg-blue-500 px-6 text-white">
          <AcmeLogo />
        </div>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
