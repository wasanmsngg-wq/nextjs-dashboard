import type { Locale } from '@/app/i18n/config';

const th: Record<string, string> = {
  Language: 'ภาษา',
  'Loading...': 'กำลังโหลด...',
  English: 'English',
  Thai: 'ไทย',
  'Open navigation': 'เปิดเมนูนำทาง',
  'Close navigation': 'ปิดเมนูนำทาง',
  'User profile (coming soon)': 'โปรไฟล์ผู้ใช้ (เร็ว ๆ นี้)',
  Home: 'หน้าหลัก',
  Customers: 'ลูกค้า',
  'Sign Out': 'ออกจากระบบ',
  Dashboard: 'แดชบอร์ด',
  'View and search customers.': 'ดูและค้นหาลูกค้า',
  'Search customers...': 'ค้นหาลูกค้า...',
  Search: 'ค้นหา',
  Name: 'ชื่อ',
  Email: 'อีเมล',
  'No customers found.': 'ไม่พบลูกค้า',
  "{name}'s profile picture": 'รูปโปรไฟล์ของ {name}',
  'Welcome to Acme.': 'ยินดีต้อนรับสู่ Acme',
  'Manage your work from one place.': 'จัดการงานของคุณได้จากที่เดียว',
  'Open dashboard': 'เปิดแดชบอร์ด',
  'Dashboard preview on desktop': 'ตัวอย่างแดชบอร์ดบนเดสก์ท็อป',
  'Dashboard preview on mobile': 'ตัวอย่างแดชบอร์ดบนมือถือ',
};

const dictionaries: Record<Locale, Record<string, string>> = {
  en: {},
  th,
};

export function translate(
  locale: Locale,
  key: string,
  values?: Record<string, string | number>,
) {
  let message = dictionaries[locale][key] ?? key;
  for (const [name, value] of Object.entries(values ?? {})) {
    message = message.replaceAll(`{${name}}`, String(value));
  }
  return message;
}
