# 🏥 SAIS — نظام البصمة الذكية
### Smart Attendance & Inspection System
**المستشفى البيطري العام — كربلاء المقدسة**

---

## 📋 وصف النظام

SAIS هو تطبيق ويب تقدمي (PWA) متكامل لإدارة حضور وانصراف موظفي المستشفى البيطري العام بكربلاء المقدسة.

**الرابط المباشر:** https://vetkarbala.vercel.app

---

## ⚙️ المتطلبات التقنية

| المكوّن | الدور |
|---|---|
| n8n (wissamaljaberi.app.n8n.cloud) | محرك الأتمتة |
| Google Sheets | قاعدة البيانات |
| Telegram Bot | الإشعارات الفورية |
| Vercel | استضافة التطبيق |

---

## 🔗 مسارات الـ Webhook (VetHR-3)

```
POST /vet-hr/login           — تسجيل الدخول
POST /vet-hr/employees       — قراءة الموظفين
POST /vet-hr/attendance      — قراءة الحضور
POST /vet-hr/leaves          — قراءة الإجازات
POST /vet-hr/checkin         — تسجيل الدخول بالـ GPS
POST /vet-hr/checkout        — تسجيل الخروج
POST /vet-hr/leave-request   — طلب إجازة جديدة
POST /vet-hr/leave-action    — قرار الموافقة/الرفض
```

---

## 📁 هيكل الملفات

```
vetkarbala/
├── index.html      ← التطبيق الكامل (PWA)
├── manifest.json   ← إعدادات PWA
├── sw.js           ← Service Worker
├── vercel.json     ← إعدادات Vercel
└── README.md       ← هذا الملف
```

---

## 🚀 خطوات النشر على Vercel

1. ارفع هذا المجلد على GitHub
2. افتح vercel.com ← Import Project ← اختر الـ repo
3. اضغط Deploy
4. الرابط جاهز خلال 30 ثانية ✅

---

## 📊 Google Sheets ID

```
1omOclvKpIY_1AlNyaQXaUBMjXpZPbdDiBOzQM2TAM6s
```

**الشيتات:**
- الموظفون — أسماء المستخدمين وكلمات المرور
- الحضور — سجلات الدخول والخروج
- الإجازات — طلبات الإجازة والقرارات
- التقارير اليومية — الأرشيف التلقائي

---

## 📍 إحداثيات المستشفى

```
Latitude:  32.58591
Longitude: 44.02225
Radius:    300 metres
```

---

## 👨‍⚕️ معلومات التواصل

**د. وسام عبد الرسول صابر**  
مدير المستشفى البيطري العام — كربلاء المقدسة  
📧 vetkarbala@gmail.com  
📱 +964773456823

---

*Powered by DrwissamAlgaberi | SAIS v2.0 | 2026*
