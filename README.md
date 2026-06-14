# تقرير حالة مشروع — Project Status Dashboard

لوحة تحكم تفاعلية (صفحة واحدة) لمتابعة حالة المشروع بأسلوب مخطط جانت، باللغة العربية مع تخطيط كامل من اليمين إلى اليسار (RTL).

An interactive single‑page React dashboard recreating a Gantt‑style project tracker. Built with **React + Vite + Tailwind CSS**. No backend — all state lives in React and persists to `localStorage`, so edits survive a refresh.

## التشغيل / Getting started

```bash
npm install
npm run dev      # development server (http://localhost:5173)
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## المزايا / Features

- **رأس قابل للتعديل** — عنوان المشروع والعنوان الفرعي.
- **بطاقات الملخص** — أهم الإنجازات، الخطوات القادمة، أبرز المخاطر (قوائم قابلة للإضافة/الحذف/التعديل) + مؤشرات الإنجاز (المخطط/الفعلي) مع مؤشرات دائرية وشارة حالة المشروع.
- **مخطط جانت رئيسي** — جدول المراحل والمخرجات على اليمين، وخط زمني متزامن (فبراير ← نوفمبر 2026) على اليسار، مع أشرطة جانت ونقاط تحقق (معيّنات) ملوّنة بالحالة، وخط أحمر متقطّع لـ«اليوم».
- **تفاعلية كاملة** — تحرير اسم/مرحلة/تواريخ/حالة كل مخرج، إضافة/حذف/إعادة ترتيب المخرجات والمراحل، فلترة حسب الحالة والمرحلة والبحث، واختيار «تاريخ اليوم».
- **حساب تلقائي** — نسبة الإنجاز الفعلي تُحسب من حالات المهام، والمخطط من المدة المنقضية حتى تاريخ اليوم، وحالة المشروع تُشتق من الفجوة بينهما (مع إمكانية التجاوز اليدوي).

## البنية / Project structure

| File | Purpose |
| --- | --- |
| `src/App.jsx` | Main page: header, summary cards, filter bar, Gantt, legend |
| `src/components.jsx` | Reusable UI (editable text/list, status badge, circular progress) |
| `src/data.js` | Palette, statuses, timeline domain, legend, seed data |
| `src/utils.js` | Date math, bar geometry, percentage roll‑ups, status derivation |

## لوحة الألوان / Palette

`--navy-dark #1B3A57` · `--navy-mid #2C5468` · `--teal #7BA8A8` · `--gold #FCBF2C` · `--peach #F5C49B` · `--green #7CB342` · `--red #C8202F` · `--maroon #5C1A2B` · `--gray-bar #9E9E9E` · `--gray-light #EFEFEF`
