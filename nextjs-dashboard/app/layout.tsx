import '@/app/ui/global.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { inter } from '@/app/ui/fonts';
import { I18nProvider } from '@/app/i18n/provider';
import { getLocale } from '@/app/i18n/server';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body className={`${inter.className} antialiased`}>
        <AntdRegistry>
          <I18nProvider initialLocale={locale}>{children}</I18nProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
