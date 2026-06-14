// ---- Color palette (mirrors CSS variables in index.css) ----
export const COLORS = {
  navyDark: '#1B3A57',
  navyMid: '#2C5468',
  teal: '#7BA8A8',
  gold: '#FCBF2C',
  peach: '#F5C49B',
  green: '#7CB342',
  red: '#C8202F',
  maroon: '#5C1A2B',
  grayBar: '#9E9E9E',
  grayLight: '#EFEFEF',
}

// ---- Task statuses (per deliverable row) ----
// key -> { label, color, weight } ; weight used as default % when none set
export const TASK_STATUS = {
  notStarted: { label: 'لم يبدأ', color: COLORS.grayBar },
  onPlan: { label: 'حسب المخطط', color: COLORS.green },
  late: { label: 'متأخر', color: COLORS.red },
  suspended: { label: 'معلق', color: COLORS.maroon },
  done: { label: 'مكتمل', color: COLORS.navyDark },
}

export const TASK_STATUS_ORDER = ['notStarted', 'onPlan', 'late', 'suspended', 'done']

// ---- Project-level status (auto-derived from planned vs actual gap) ----
export const PROJECT_STATUS = {
  onPlan: { label: 'حسب المخطط', color: COLORS.green },
  minorDelay: { label: 'تأخر بسيط', color: COLORS.peach, textDark: true },
  late: { label: 'متأخر', color: COLORS.red },
  suspended: { label: 'معلق', color: COLORS.maroon },
  done: { label: 'مكتمل', color: COLORS.navyDark },
}

// ---- Timeline domain: fixed Feb -> Nov 2026 ----
export const TIMELINE = {
  year: 2026,
  start: '2026-02-01',
  end: '2026-11-30',
  months: [
    { label: 'فبراير', m: 1 }, // JS month index (0=Jan)
    { label: 'مارس', m: 2 },
    { label: 'إبريل', m: 3 },
    { label: 'مايو', m: 4 },
    { label: 'يونيو', m: 5 },
    { label: 'يوليو', m: 6 },
    { label: 'إغسطس', m: 7 },
    { label: 'سبتمبر', m: 8 },
    { label: 'اكتوبر', m: 9 },
    { label: 'نوفمبر', m: 10 },
  ],
}

// ---- Legend (bottom row) ----
export const LEGEND = [
  { label: 'لم يبدأ (0%)', color: COLORS.grayBar },
  { label: 'حسب المخطط (أقل من 5% تأخير)', color: COLORS.green },
  { label: 'تأخر بسيط (6%-10% تأخير)', color: COLORS.peach },
  { label: 'متأخر (أكثر من 10% تأخير)', color: COLORS.red },
  { label: 'معلق', color: COLORS.maroon },
  { label: 'مكتمل كلياً (100%)', color: COLORS.navyDark },
]

const uid = () => Math.random().toString(36).slice(2, 9)

// ---- Seed data: 6 phases, ~15 tasks ----
export const SEED_PHASES = [
  {
    id: uid(),
    name: 'المرحلة التجريبية وتأسيس المنظومة',
    tasks: [
      { id: uid(), code: '1.1', name: 'استراتيجية العضويات', startDate: '2026-02-01', endDate: '2026-03-05', status: 'done', percentComplete: 100 },
      { id: uid(), code: '1.2', name: 'صفحات الهبوط ونظام CRM', startDate: '2026-02-15', endDate: '2026-03-25', status: 'done', percentComplete: 100 },
      { id: uid(), code: '1.3', name: 'الملفات التعريفية', startDate: '2026-03-01', endDate: '2026-03-28', status: 'onPlan', percentComplete: 85 },
    ],
  },
  {
    id: uid(),
    name: 'مرحلة إعادة التصميم والتحضير للتوسّع',
    tasks: [
      { id: uid(), code: '2.1', name: 'الفيديوهات التعريفية', startDate: '2026-03-20', endDate: '2026-04-25', status: 'onPlan', percentComplete: 70 },
      { id: uid(), code: '2.2', name: 'تحليل المخرجات', startDate: '2026-04-10', endDate: '2026-05-10', status: 'late', percentComplete: 45 },
    ],
  },
  {
    id: uid(),
    name: 'الإطلاق متعدد القنوات',
    tasks: [
      { id: uid(), code: '3.1', name: 'حملات الرسائل SMS / Email / WhatsApp', startDate: '2026-05-01', endDate: '2026-06-05', status: 'onPlan', percentComplete: 55 },
      { id: uid(), code: '3.2', name: 'تصميم حقائب تأسيسية', startDate: '2026-05-15', endDate: '2026-06-20', status: 'late', percentComplete: 30 },
      { id: uid(), code: '3.3', name: 'إطلاق الحملات الإعلانية الرقمية', startDate: '2026-06-01', endDate: '2026-07-10', status: 'onPlan', percentComplete: 20 },
    ],
  },
  {
    id: uid(),
    name: 'التفعيل الميداني والفعاليات',
    tasks: [
      { id: uid(), code: '4.1', name: 'حملات المؤثرين', startDate: '2026-06-20', endDate: '2026-07-25', status: 'notStarted', percentComplete: 0 },
      { id: uid(), code: '4.2', name: 'تفعيل الشراكات المؤسسية', startDate: '2026-07-01', endDate: '2026-08-15', status: 'notStarted', percentComplete: 0 },
      { id: uid(), code: '4.3', name: 'تنظيم الفعاليات والمعارض', startDate: '2026-07-20', endDate: '2026-09-05', status: 'suspended', percentComplete: 10 },
    ],
  },
  {
    id: uid(),
    name: 'التكثيف وتحسين الأداء',
    tasks: [
      { id: uid(), code: '5.1', name: 'تكثيف المكالمات', startDate: '2026-08-15', endDate: '2026-09-25', status: 'notStarted', percentComplete: 0 },
      { id: uid(), code: '5.2', name: 'تحسين أداء القنوات', startDate: '2026-09-01', endDate: '2026-10-15', status: 'notStarted', percentComplete: 0 },
    ],
  },
  {
    id: uid(),
    name: 'مرحلة الإغلاق والمتابعة',
    tasks: [
      { id: uid(), code: '6.1', name: 'قياس النتائج والتقرير النهائي', startDate: '2026-10-01', endDate: '2026-11-28', status: 'notStarted', percentComplete: 0 },
    ],
  },
]

export const SEED_SUMMARY = {
  title: 'جمعية الأزياء',
  subtitle: 'تقرير حالة مشروع',
  achievements: [
    'إطلاق استراتيجية العضويات واعتمادها',
    'تشغيل نظام CRM وصفحات الهبوط',
    'إنتاج الملفات والفيديوهات التعريفية',
  ],
  nextSteps: [
    'إطلاق حملات الرسائل عبر SMS و Email و WhatsApp',
    'بدء الحملات الإعلانية الرقمية',
    'التحضير لحملات المؤثرين والشراكات',
  ],
  risks: [
    'تأخر تحليل المخرجات قد يؤثر على جدولة الإطلاق',
    'الحاجة إلى اعتماد ميزانية الحملات الإعلانية',
    'تأمين شركاء الفعاليات الميدانية',
  ],
}

export const newTask = (code = '') => ({
  id: uid(),
  code,
  name: 'مخرج جديد',
  startDate: '2026-06-01',
  endDate: '2026-06-30',
  status: 'notStarted',
  percentComplete: 0,
})

export const newPhase = () => ({ id: uid(), name: 'مرحلة جديدة', tasks: [] })

export { uid }
