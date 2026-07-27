import type { Locale } from "@/app/i18n/config";

const th: Record<string, string> = {
  Language: "ภาษา",
  "Loading...": "กำลังโหลด...",
  English: "อังกฤษ",
  Thai: "ไทย",
  "Open navigation": "เปิดเมนูนำทาง",
  "Close navigation": "ปิดเมนูนำทาง",
  "User profile": "โปรไฟล์ผู้ใช้",
  Home: "หน้าหลัก",
  Customers: "ลูกค้า",
  "Sign Out": "ออกจากระบบ",
  "Log in": "เข้าสู่ระบบ",
  Dashboard: "แดชบอร์ด",
  "View and search customers.": "ดูและค้นหาลูกค้า",
  "Search customers...": "ค้นหาลูกค้า...",
  Search: "ค้นหา",
  "Search results update as you type.": "ผลการค้นหาจะอัปเดตขณะที่คุณพิมพ์",
  Name: "ชื่อ",
  Email: "อีเมล",
  Password: "รหัสผ่าน",
  "Confirm password": "ยืนยันรหัสผ่าน",
  "No customers found.": "ไม่พบลูกค้า",
  "{name}'s profile picture": "รูปโปรไฟล์ของ {name}",
  "Welcome to Exercise Tracker.": "ยินดีต้อนรับสู่ Exercise Tracker",
  "Manage your exercise preferences in one place.":
    "จัดการการตั้งค่าการออกกำลังกายของคุณได้ในที่เดียว",
  "Open dashboard": "เปิดแดชบอร์ด",
  "Dashboard preview on desktop": "ตัวอย่างแดชบอร์ดบนเดสก์ท็อป",
  "Dashboard preview on mobile": "ตัวอย่างแดชบอร์ดบนมือถือ",
  "Create account": "สร้างบัญชี",
  "Reset password": "รีเซ็ตรหัสผ่าน",
  "Choose a new password": "ตั้งรหัสผ่านใหม่",
  "Please wait…": "โปรดรอสักครู่…",
  "Sign up": "สมัครสมาชิก",
  "Send recovery link": "ส่งลิงก์กู้คืน",
  "Update password": "อัปเดตรหัสผ่าน",
  "Forgot password?": "ลืมรหัสผ่าน?",
  "Back to login": "กลับไปหน้าเข้าสู่ระบบ",
  "Continue to dashboard": "ไปยังแดชบอร์ด",
  "Profile settings": "การตั้งค่าโปรไฟล์",
  "Display name": "ชื่อที่แสดง",
  Timezone: "เขตเวลา",
  Units: "หน่วย",
  Metric: "เมตริก",
  "US customary": "ระบบอเมริกัน",
  "Save profile": "บันทึกโปรไฟล์",
  "Profile saved.": "บันทึกโปรไฟล์แล้ว",
  "Guest profile saved on this browser.":
    "บันทึกโปรไฟล์ผู้เยี่ยมชมในเบราว์เซอร์นี้แล้ว",
  "The profile could not be saved.": "ไม่สามารถบันทึกโปรไฟล์ได้",
  "Guest data stays on this device and browser. It is not backed up and browser cleanup may remove it.":
    "ข้อมูลผู้เยี่ยมชมจะอยู่ในอุปกรณ์และเบราว์เซอร์นี้เท่านั้น ไม่มีการสำรองข้อมูล และอาจถูกลบเมื่อล้างข้อมูลเบราว์เซอร์",
  "Guest data": "ข้อมูลผู้เยี่ยมชม",
  "Guest data is device/browser-specific, is not backed up, and may be cleared by the browser.":
    "ข้อมูลผู้เยี่ยมชมใช้ได้เฉพาะอุปกรณ์และเบราว์เซอร์นี้ ไม่มีการสำรองข้อมูล และเบราว์เซอร์อาจลบข้อมูลได้",
  "Import a guest JSON export": "นำเข้าไฟล์ JSON ของผู้เยี่ยมชม",
  "Review selected preferences": "ตรวจสอบการตั้งค่าที่เลือก",
  "Review preferences": "ตรวจสอบการตั้งค่า",
  "Not set": "ไม่ได้ตั้งค่า",
  "No guest profile found.": "ไม่พบโปรไฟล์ผู้เยี่ยมชม",
  "Export JSON": "ส่งออก JSON",
  "Confirm import": "ยืนยันการนำเข้า",
  "Clear guest data": "ล้างข้อมูลผู้เยี่ยมชม",
  "Guest data cleared from this browser.":
    "ล้างข้อมูลผู้เยี่ยมชมจากเบราว์เซอร์นี้แล้ว",
  "Guest data could not be cleared because storage is unavailable.":
    "ไม่สามารถล้างข้อมูลได้ เนื่องจากพื้นที่จัดเก็บใช้งานไม่ได้",
  "This guest export version is not supported.":
    "ไม่รองรับเวอร์ชันไฟล์ส่งออกนี้",
  "The selected file is not a valid guest export.":
    "ไฟล์ที่เลือกไม่ใช่ไฟล์ส่งออกข้อมูลผู้เยี่ยมชมที่ถูกต้อง",
  "Review the selected preferences. Existing browser data has not changed.":
    "โปรดตรวจสอบการตั้งค่าที่เลือก ข้อมูลเดิมในเบราว์เซอร์ยังไม่เปลี่ยนแปลง",
  "The selected guest export could not be read.":
    "ไม่สามารถอ่านไฟล์ส่งออกที่เลือกได้",
  "Guest export imported into this browser.":
    "นำเข้าข้อมูลผู้เยี่ยมชมในเบราว์เซอร์นี้แล้ว",
  "Guest data could not be saved. Browser storage may be unavailable or full.":
    "ไม่สามารถบันทึกข้อมูลได้ พื้นที่จัดเก็บของเบราว์เซอร์อาจใช้งานไม่ได้หรือเต็ม",
  "Profile imported, but guest data could not be cleared from this browser.":
    "นำเข้าโปรไฟล์แล้ว แต่ไม่สามารถล้างข้อมูลผู้เยี่ยมชมจากเบราว์เซอร์นี้ได้",
  "This export was already imported.": "ไฟล์ส่งออกนี้ถูกนำเข้าแล้ว",
  "Guest profile imported successfully.": "นำเข้าโปรไฟล์ผู้เยี่ยมชมสำเร็จ",
  "Guest storage is corrupt.": "ข้อมูลผู้เยี่ยมชมเสียหาย",
  "Guest storage is unsupported.": "ไม่รองรับรูปแบบข้อมูลผู้เยี่ยมชม",
  "Guest storage is unavailable.": "พื้นที่จัดเก็บข้อมูลใช้งานไม่ได้",
  "Enter a valid email and password.": "กรุณากรอกอีเมลและรหัสผ่านที่ถูกต้อง",
  "Email or password is incorrect.": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  "Enter a valid email and a password of at least 8 characters.":
    "กรุณากรอกอีเมลที่ถูกต้องและรหัสผ่านอย่างน้อย 8 ตัวอักษร",
  "Unable to create the account. Check the details and try again.":
    "ไม่สามารถสร้างบัญชีได้ โปรดตรวจสอบข้อมูลแล้วลองอีกครั้ง",
  "Check your email to verify your account.":
    "โปรดตรวจสอบอีเมลเพื่อยืนยันบัญชี",
  "Enter your email address.": "กรุณากรอกอีเมล",
  "If an account exists, a recovery link has been sent.":
    "หากมีบัญชีนี้ ระบบได้ส่งลิงก์กู้คืนแล้ว",
  "Passwords do not match.": "รหัสผ่านไม่ตรงกัน",
  "Use a password between 8 and 128 characters.":
    "กรุณาใช้รหัสผ่าน 8 ถึง 128 ตัวอักษร",
  "This recovery link is invalid or expired. Request a new one.":
    "ลิงก์กู้คืนนี้ไม่ถูกต้องหรือหมดอายุ โปรดขอลิงก์ใหม่",
  "The password could not be updated. Request a new recovery link.":
    "ไม่สามารถอัปเดตรหัสผ่านได้ โปรดขอลิงก์กู้คืนใหม่",
  "Password updated. You can continue to your dashboard.":
    "อัปเดตรหัสผ่านแล้ว คุณสามารถไปยังแดชบอร์ดได้",
  "Check the profile fields and try again.":
    "โปรดตรวจสอบข้อมูลโปรไฟล์แล้วลองอีกครั้ง",
  "Log in before saving an account profile.":
    "โปรดเข้าสู่ระบบก่อนบันทึกโปรไฟล์บัญชี",
  "The guest export is invalid or unsupported.":
    "ไฟล์ส่งออกข้อมูลผู้เยี่ยมชมไม่ถูกต้องหรือไม่รองรับ",
  "Verify your account before importing guest data.":
    "โปรดยืนยันบัญชีก่อนนำเข้าข้อมูลผู้เยี่ยมชม",
  "The import could not be confirmed. Your browser data was kept.":
    "ไม่สามารถยืนยันการนำเข้าได้ ข้อมูลในเบราว์เซอร์ยังคงอยู่",
  "Too many attempts. Wait and try again.":
    "มีความพยายามมากเกินไป โปรดรอสักครู่แล้วลองอีกครั้ง",
  "Unable to log in right now.": "ไม่สามารถเข้าสู่ระบบได้ในขณะนี้",
  "Unable to create the account right now.": "ไม่สามารถสร้างบัญชีได้ในขณะนี้",
  "Too many recovery requests. Wait and try again.":
    "มีคำขอกู้คืนมากเกินไป โปรดรอสักครู่แล้วลองอีกครั้ง",
  "Too many recovery attempts. Wait and try again.":
    "มีความพยายามกู้คืนมากเกินไป โปรดรอสักครู่แล้วลองอีกครั้ง",
  "Too many profile updates. Wait and try again.":
    "มีการอัปเดตโปรไฟล์มากเกินไป โปรดรอสักครู่แล้วลองอีกครั้ง",
  "Too many import attempts. Wait and try again.":
    "มีความพยายามนำเข้ามากเกินไป โปรดรอสักครู่แล้วลองอีกครั้ง",
  "Too many searches. Wait and try again.":
    "มีการค้นหามากเกินไป โปรดรอสักครู่แล้วลองอีกครั้ง",
};

const dictionaries: Record<Locale, Record<string, string>> = { en: {}, th };

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
