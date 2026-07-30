import type { Locale } from "@/app/i18n/config";

const th: Record<string, string> = {
  Language: "ภาษา",
  "Loading...": "กำลังโหลด...",
  English: "อังกฤษ",
  Thai: "ไทย",
  "Open navigation": "เปิดเมนูนำทาง",
  "Close navigation": "ปิดเมนูนำทาง",
  "User profile": "โปรไฟล์ผู้ใช้",
  "User profile (coming soon)": "โปรไฟล์ผู้ใช้ (เร็ว ๆ นี้)",
  "Primary navigation": "การนำทางหลัก",
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
  "Guest export downloaded.": "ดาวน์โหลดข้อมูลผู้เยี่ยมชมแล้ว",
  "Confirm import": "ยืนยันการนำเข้า",
  "Importing…": "กำลังนำเข้า…",
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
  Workouts: "การออกกำลังกาย",
  "Back to workouts": "กลับไปหน้าการออกกำลังกาย",
  "Back to dashboard": "กลับไปหน้าแดชบอร์ด",
  "Training hub": "ศูนย์การฝึก",
  "Plan a session, follow your targets, and keep your training moving.":
    "วางแผน ทำตามเป้าหมาย และฝึกอย่างต่อเนื่อง",
  "Browse built-in movements or create your own.":
    "เลือกท่าที่มีอยู่หรือสร้างท่าของคุณเอง",
  "Build a template": "สร้างเทมเพลต",
  "Turn your favorite exercises into a reusable plan.":
    "เปลี่ยนท่าโปรดให้เป็นแผนที่ใช้ซ้ำได้",
  "Ready when you are": "พร้อมเมื่อคุณพร้อม",
  "Create a template to make your next workout faster to start.":
    "สร้างเทมเพลตเพื่อเริ่มการฝึกครั้งถัดไปได้เร็วขึ้น",
  "Create your first template": "สร้างเทมเพลตแรก",
  "Build your library": "สร้างคลังท่าของคุณ",
  "Choose from ready-made exercises or add movements that match your training.":
    "เลือกท่าที่เตรียมไว้หรือเพิ่มท่าที่เหมาะกับการฝึกของคุณ",
  "Edit exercise": "แก้ไขท่าออกกำลังกาย",
  "Create a custom exercise": "สร้างท่าออกกำลังกาย",
  "Tracking mode controls which fields appear during a workout.":
    "รูปแบบการบันทึกกำหนดช่องข้อมูลที่แสดงระหว่างการฝึก",
  "Example: Incline dumbbell press": "ตัวอย่าง: อินไคลน์ดัมเบลเพรส",
  "Choose a suggestion or type your own equipment.":
    "เลือกจากคำแนะนำหรือพิมพ์อุปกรณ์ของคุณเอง",
  "Example: dumbbell": "ตัวอย่าง: ดัมเบล",
  "Available exercises": "ท่าออกกำลังกายที่มี",
  "{count} exercises": "{count} ท่า",
  "Search exercises": "ค้นหาท่าออกกำลังกาย",
  "Filter by category": "กรองตามหมวดหมู่",
  "All categories": "ทุกหมวดหมู่",
  Custom: "กำหนดเอง",
  "Built in": "มีในระบบ",
  "No matching exercises": "ไม่พบท่าที่ตรงกัน",
  "Change the search or category filter and try again.":
    "เปลี่ยนคำค้นหรือหมวดหมู่แล้วลองอีกครั้ง",
  "Build strength with resistance or bodyweight.":
    "เพิ่มความแข็งแรงด้วยแรงต้านหรือน้ำหนักตัว",
  "Raise your heart rate and improve endurance.":
    "เพิ่มอัตราการเต้นหัวใจและความทนทาน",
  "Improve range of motion and movement quality.":
    "เพิ่มช่วงการเคลื่อนไหวและคุณภาพการเคลื่อนไหว",
  "Train stability and body control.": "ฝึกความมั่นคงและการควบคุมร่างกาย",
  "Practice a sport-specific movement.": "ฝึกการเคลื่อนไหวเฉพาะกีฬา",
  "Use when none of the categories fit.": "ใช้เมื่อไม่มีหมวดหมู่ที่เหมาะสม",
  "Category: strength": "ความแข็งแรง",
  "Category: cardio": "คาร์ดิโอ",
  "Category: mobility": "ความคล่องตัว",
  "Category: balance": "การทรงตัว",
  "Category: sport": "กีฬา",
  "Category: other": "อื่น ๆ",
  "Equipment: bodyweight": "น้ำหนักตัว",
  "Equipment: barbell": "บาร์เบล",
  "Equipment: dumbbell": "ดัมเบล",
  "Equipment: kettlebell": "เคตเทิลเบล",
  "Equipment: machine": "เครื่องออกกำลังกาย",
  "Equipment: cable": "เคเบิล",
  "Equipment: resistance band": "ยางยืดแรงต้าน",
  "Equipment: bench": "ม้านั่ง",
  "Equipment: pull-up bar": "บาร์โหน",
  "Equipment: cardio machine": "เครื่องคาร์ดิโอ",
  "Equipment: bicycle": "จักรยาน",
  "Workout builder": "เครื่องมือสร้างการฝึก",
  "Choose exercises, set targets, and save a plan you can reuse.":
    "เลือกท่า ตั้งเป้าหมาย และบันทึกแผนเพื่อใช้ซ้ำ",
  "Template details": "รายละเอียดเทมเพลต",
  "Example: Full body strength": "ตัวอย่าง: ความแข็งแรงทั่วร่างกาย",
  "Optional coaching notes or workout goal": "คำแนะนำหรือเป้าหมาย (ไม่บังคับ)",
  Exercises: "ท่าออกกำลังกาย",
  "Search your library, then add exercises in workout order.":
    "ค้นหาคลังแล้วเพิ่มท่าตามลำดับการฝึก",
  "Search by exercise name": "ค้นหาด้วยชื่อท่า",
  "No exercises are available": "ไม่มีท่าออกกำลังกาย",
  "Create an exercise first, then return to build your template.":
    "สร้างท่าก่อน แล้วกลับมาสร้างเทมเพลต",
  "Open exercise library": "เปิดคลังท่าออกกำลังกาย",
  "Workout in progress": "กำลังออกกำลังกาย",
  "Workout summary": "สรุปการออกกำลังกาย",
  "Add another exercise": "เพิ่มท่าอีก",
  "Unable to load workouts": "ไม่สามารถโหลดการออกกำลังกาย",
  "Your workout data is temporarily unavailable.":
    "ข้อมูลการออกกำลังกายไม่พร้อมใช้งานชั่วคราว",
  "Try again. If the problem continues, check the staging connection.":
    "ลองอีกครั้ง หากยังมีปัญหาให้ตรวจสอบการเชื่อมต่อ staging",
  "Try again": "ลองอีกครั้ง",
  "Plan and complete your training.": "วางแผนและทำการฝึกของคุณให้เสร็จ",
  "Log in to plan and track workouts.":
    "เข้าสู่ระบบเพื่อวางแผนและบันทึกการออกกำลังกาย",
  "Resume active workout": "ทำการออกกำลังกายต่อ",
  "Start empty workout": "เริ่มการออกกำลังกายเปล่า",
  "Manage exercises": "จัดการท่าออกกำลังกาย",
  "Create template": "สร้างเทมเพลต",
  "Workout templates": "เทมเพลตการออกกำลังกาย",
  Start: "เริ่ม",
  Edit: "แก้ไข",
  Duplicate: "ทำสำเนา",
  Archive: "เก็บถาวร",
  Copy: "สำเนา",
  "Starting workout...": "กำลังเริ่มการออกกำลังกาย...",
  "Template duplicated.": "ทำสำเนาเทมเพลตแล้ว",
  "Archive this template?": "เก็บเทมเพลตนี้ถาวรหรือไม่",
  "Template archived.": "เก็บเทมเพลตถาวรแล้ว",
  "No workout templates yet.": "ยังไม่มีเทมเพลตการออกกำลังกาย",
  "Exercise library": "คลังท่าออกกำลังกาย",
  "System exercises are bilingual. Your custom names stay as entered.":
    "ท่าของระบบมีสองภาษา ชื่อท่าที่คุณสร้างจะแสดงตามที่กรอก",
  "Exercise name": "ชื่อท่าออกกำลังกาย",
  "Tracking mode": "รูปแบบการบันทึก",
  "Repetitions and load": "จำนวนครั้งและน้ำหนัก",
  "Repetitions only": "จำนวนครั้งเท่านั้น",
  "Duration only": "ระยะเวลาเท่านั้น",
  "Distance and duration": "ระยะทางและระยะเวลา",
  Category: "หมวดหมู่",
  Equipment: "อุปกรณ์",
  "Save changes": "บันทึกการเปลี่ยนแปลง",
  "Create exercise": "สร้างท่าออกกำลังกาย",
  Cancel: "ยกเลิก",
  "Exercise saved.": "บันทึกท่าออกกำลังกายแล้ว",
  "Archive this exercise?": "เก็บท่าออกกำลังกายนี้ถาวรหรือไม่",
  "Exercise archived.": "เก็บท่าออกกำลังกายถาวรแล้ว",
  "Edit workout template": "แก้ไขเทมเพลตการออกกำลังกาย",
  "Create workout template": "สร้างเทมเพลตการออกกำลังกาย",
  "Template name": "ชื่อเทมเพลต",
  Notes: "บันทึก",
  "Add exercise": "เพิ่มท่าออกกำลังกาย",
  Add: "เพิ่ม",
  "Move up": "เลื่อนขึ้น",
  "Move down": "เลื่อนลง",
  Remove: "นำออก",
  "Set {number}": "เซต {number}",
  "Target reps": "จำนวนครั้งเป้าหมาย",
  "Target load": "น้ำหนักเป้าหมาย",
  "Target duration": "ระยะเวลาเป้าหมาย",
  "Target distance": "ระยะทางเป้าหมาย",
  "Target RPE": "RPE เป้าหมาย",
  seconds: "วินาที",
  "Remove set": "นำเซตออก",
  "Add set": "เพิ่มเซต",
  "Save template": "บันทึกเทมเพลต",
  "Saving...": "กำลังบันทึก...",
  "Template saved.": "บันทึกเทมเพลตแล้ว",
  Workout: "การออกกำลังกาย",
  "Active workout": "การออกกำลังกายที่กำลังทำ",
  "Completed workout — read only": "การออกกำลังกายเสร็จแล้ว — อ่านอย่างเดียว",
  Sets: "เซต",
  "Exercise added.": "เพิ่มท่าออกกำลังกายแล้ว",
  Reps: "จำนวนครั้ง",
  Load: "น้ำหนัก",
  Duration: "ระยะเวลา",
  Distance: "ระยะทาง",
  "Set notes": "บันทึกของเซต",
  "Add an exercise to begin.": "เพิ่มท่าออกกำลังกายเพื่อเริ่ม",
  Plan: "แผน",
  Actual: "ผลจริง",
  "No target": "ไม่มีเป้าหมาย",
  "{completed} of {total} sets complete":
    "เสร็จแล้ว {completed} จาก {total} เซต",
  "Complete this workout?": "ทำการออกกำลังกายนี้ให้เสร็จหรือไม่",
  "Workout completed.": "ทำการออกกำลังกายเสร็จแล้ว",
  "Complete workout": "ทำการออกกำลังกายให้เสร็จ",
  "Discard this workout? This cannot be undone.":
    "ละทิ้งการออกกำลังกายนี้หรือไม่ การดำเนินการนี้ย้อนกลับไม่ได้",
  "Discard workout": "ละทิ้งการออกกำลังกาย",
  "Retry save": "ลองบันทึกอีกครั้ง",
  "Reload server copy": "โหลดข้อมูลจากเซิร์ฟเวอร์ใหม่",
  "Keep this device copy": "ใช้ข้อมูลจากอุปกรณ์นี้",
  "Replace the server workout with this device copy?":
    "แทนที่การออกกำลังกายบนเซิร์ฟเวอร์ด้วยข้อมูลจากอุปกรณ์นี้หรือไม่",
  Saved: "บันทึกแล้ว",
  "Offline — changes will retry when connected.":
    "ออฟไลน์ — ระบบจะลองบันทึกอีกครั้งเมื่อเชื่อมต่อ",
  "This workout changed elsewhere. Reload the server copy.":
    "การออกกำลังกายนี้ถูกเปลี่ยนจากที่อื่น โปรดโหลดข้อมูลจากเซิร์ฟเวอร์ใหม่",
  "Save failed. Your changes remain on this device.":
    "บันทึกไม่สำเร็จ การเปลี่ยนแปลงยังอยู่ในอุปกรณ์นี้",
  "Log in to manage workouts.": "เข้าสู่ระบบเพื่อจัดการการออกกำลังกาย",
  "Too many workout updates. Wait and try again.":
    "มีการอัปเดตการออกกำลังกายมากเกินไป โปรดรอแล้วลองอีกครั้ง",
  "The workout update could not be saved.": "ไม่สามารถบันทึกการอัปเดตได้",
  "Check the exercise fields.": "ตรวจสอบข้อมูลท่าออกกำลังกาย",
  "The exercise could not be saved.": "ไม่สามารถบันทึกท่าออกกำลังกายได้",
  "The exercise could not be archived.": "ไม่สามารถเก็บท่าออกกำลังกายถาวรได้",
  "Check the template fields.": "ตรวจสอบข้อมูลเทมเพลต",
  "The template could not be saved.": "ไม่สามารถบันทึกเทมเพลตได้",
  "The template could not be archived.": "ไม่สามารถเก็บเทมเพลตถาวรได้",
  "The template could not be duplicated.": "ไม่สามารถทำสำเนาเทมเพลตได้",
  "The workout could not be started.": "ไม่สามารถเริ่มการออกกำลังกายได้",
  "Check the exercise and set count.": "ตรวจสอบท่าออกกำลังกายและจำนวนเซต",
  "The exercise could not be added.": "ไม่สามารถเพิ่มท่าออกกำลังกายได้",
  "Check the workout set values.": "ตรวจสอบค่าของเซต",
  "This workout changed on another device.":
    "การออกกำลังกายนี้ถูกเปลี่ยนบนอุปกรณ์อื่น",
  "The workout set could not be saved.": "ไม่สามารถบันทึกเซตได้",
  "The workout could not be completed.": "ไม่สามารถทำการออกกำลังกายให้เสร็จได้",
  "The workout could not be discarded.": "ไม่สามารถละทิ้งการออกกำลังกายได้",
};

const dictionaries: Record<Locale, Record<string, string>> = { en: {}, th };

export function hasTranslation(locale: Locale, key: string) {
  return locale === "en" || Object.hasOwn(dictionaries[locale], key);
}

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
