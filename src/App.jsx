import React, { useState, useEffect, useMemo } from 'react'
import {
  SEED_PHASES,
  SEED_SUMMARY,
  TASK_STATUS,
  TASK_STATUS_ORDER,
  PROJECT_STATUS,
  TIMELINE,
  LEGEND,
  newTask,
  newPhase,
} from './data.js'
import {
  todayISO,
  barGeometry,
  monthColumns,
  dateToFraction,
  rollup,
  deriveProjectStatus,
  taskActual,
  projectStatusInfo,
} from './utils.js'
import {
  EditableText,
  EditableList,
  StatusBadge,
  CircularProgress,
  IconBtn,
} from './components.jsx'

const STORAGE_KEY = 'project-status-dashboard-v1'

const defaultState = () => ({
  ...SEED_SUMMARY,
  phases: SEED_PHASES,
  today: '2026-06-14',
  plannedOverride: null,
  actualOverride: null,
  statusOverride: null,
})

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaultState(), ...JSON.parse(raw) }
  } catch (e) {
    /* ignore */
  }
  return defaultState()
}

export default function App() {
  const [state, setState] = useState(loadState)

  // Filters (not persisted — view-only)
  const [statusFilter, setStatusFilter] = useState(
    Object.fromEntries(TASK_STATUS_ORDER.map((k) => [k, true]))
  )
  const [phaseFilter, setPhaseFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      /* ignore */
    }
  }, [state])

  const patch = (p) => setState((s) => ({ ...s, ...p }))

  // ---- Phase / task mutations ----
  const setPhases = (updater) =>
    setState((s) => ({ ...s, phases: typeof updater === 'function' ? updater(s.phases) : updater }))

  const updateTask = (phaseId, taskId, changes) =>
    setPhases((phases) =>
      phases.map((ph) =>
        ph.id !== phaseId
          ? ph
          : { ...ph, tasks: ph.tasks.map((t) => (t.id === taskId ? { ...t, ...changes } : t)) }
      )
    )

  const deleteTask = (phaseId, taskId) =>
    setPhases((phases) =>
      phases.map((ph) =>
        ph.id !== phaseId ? ph : { ...ph, tasks: ph.tasks.filter((t) => t.id !== taskId) }
      )
    )

  const addTask = (phaseId) =>
    setPhases((phases) =>
      phases.map((ph) => {
        if (ph.id !== phaseId) return ph
        const idx = phases.findIndex((p) => p.id === phaseId) + 1
        const code = `${idx}.${ph.tasks.length + 1}`
        return { ...ph, tasks: [...ph.tasks, newTask(code)] }
      })
    )

  const moveTask = (phaseId, taskId, dir) =>
    setPhases((phases) =>
      phases.map((ph) => {
        if (ph.id !== phaseId) return ph
        const i = ph.tasks.findIndex((t) => t.id === taskId)
        const j = i + dir
        if (i < 0 || j < 0 || j >= ph.tasks.length) return ph
        const tasks = [...ph.tasks]
        ;[tasks[i], tasks[j]] = [tasks[j], tasks[i]]
        return { ...ph, tasks }
      })
    )

  const renamePhase = (phaseId, name) =>
    setPhases((phases) => phases.map((ph) => (ph.id === phaseId ? { ...ph, name } : ph)))

  const deletePhase = (phaseId) =>
    setPhases((phases) => phases.filter((ph) => ph.id !== phaseId))

  const addPhase = () => setPhases((phases) => [...phases, newPhase()])

  // ---- Derived metrics ----
  const computed = useMemo(() => rollup(state.phases, state.today), [state.phases, state.today])
  const plannedVal = state.plannedOverride ?? computed.planned
  const actualVal = state.actualOverride ?? computed.actual
  const derivedStatus = deriveProjectStatus(plannedVal, actualVal)
  const statusKey = state.statusOverride ?? derivedStatus

  // ---- Filtered view ----
  const visiblePhases = useMemo(() => {
    const q = search.trim()
    return state.phases
      .filter((ph) => phaseFilter === 'all' || ph.id === phaseFilter)
      .map((ph) => ({
        ...ph,
        visibleTasks: ph.tasks.filter(
          (t) => statusFilter[t.status] && (q === '' || t.name.includes(q) || t.code.includes(q))
        ),
      }))
  }, [state.phases, phaseFilter, statusFilter, search])

  const months = useMemo(() => monthColumns(), [])
  const todayPct = dateToFraction(state.today) * 100

  const ROW_H = 44 // task row height (px)
  const PHASE_H = 40 // phase header row height (px)

  return (
    <div dir="rtl" className="min-h-screen text-[#1f2a33] pb-10">
      {/* ============ HEADER ============ */}
      <header className="bg-navy-dark text-white">
        <div className="max-w-[1400px] mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
              <EditableText
                value={state.title}
                onChange={(v) => patch({ title: v })}
                className="text-white"
              />
            </h1>
            <div className="h-1 w-24 bg-gold rounded mt-1.5" />
          </div>
          <div className="text-left text-sm text-teal/90">
            <EditableText
              value={state.subtitle}
              onChange={(v) => patch({ subtitle: v })}
              className="text-teal"
            />
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-3 md:px-5 space-y-5 mt-5">
        {/* ============ TOP SUMMARY ROW ============ */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <SummaryCard title="أهم الإنجازات" accent="#7CB342">
            <EditableList
              items={state.achievements}
              onChange={(v) => patch({ achievements: v })}
              accent="#7CB342"
            />
          </SummaryCard>

          <SummaryCard title="الخطوات القادمة" accent="#2C5468">
            <EditableList
              items={state.nextSteps}
              onChange={(v) => patch({ nextSteps: v })}
              accent="#2C5468"
            />
          </SummaryCard>

          <SummaryCard title="أبرز المخاطر والدعم المطلوب" accent="#C8202F">
            <EditableList
              items={state.risks}
              onChange={(v) => patch({ risks: v })}
              accent="#C8202F"
            />
          </SummaryCard>

          {/* KPI stack */}
          <SummaryCard title="مؤشرات الإنجاز" accent="#FCBF2C">
            <div className="flex items-center justify-around gap-2 mt-1">
              <KpiBlock
                label="نسبة الإنجاز المخطط"
                color="#2C5468"
                value={plannedVal}
                override={state.plannedOverride}
                onChange={(v) => patch({ plannedOverride: v })}
                onReset={() => patch({ plannedOverride: null })}
              />
              <KpiBlock
                label="نسبة الإنجاز الفعلي"
                color="#7CB342"
                value={actualVal}
                override={state.actualOverride}
                onChange={(v) => patch({ actualOverride: v })}
                onReset={() => patch({ actualOverride: null })}
              />
            </div>
            <ProjectStatusBadge
              statusKey={statusKey}
              isAuto={state.statusOverride == null}
              onChange={(k) => patch({ statusOverride: k })}
              onAuto={() => patch({ statusOverride: null })}
            />
          </SummaryCard>
        </section>

        {/* ============ FILTER BAR ============ */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-navy-dark">الحالة:</span>
            {TASK_STATUS_ORDER.map((key) => {
              const s = TASK_STATUS[key]
              const on = statusFilter[key]
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter((f) => ({ ...f, [key]: !f[key] }))}
                  className="text-[11px] px-2.5 py-1 rounded-full border transition-all"
                  style={{
                    background: on ? s.color : 'transparent',
                    color: on ? '#fff' : s.color,
                    borderColor: s.color,
                    opacity: on ? 1 : 0.55,
                  }}
                >
                  {s.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 mr-auto flex-wrap">
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-gold/40 outline-none"
            >
              <option value="all">كل المراحل</option>
              {state.phases.map((ph) => (
                <option key={ph.id} value={ph.id}>
                  {ph.name}
                </option>
              ))}
            </select>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في المخرجات…"
              className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 w-44 focus:ring-2 focus:ring-gold/40 outline-none"
            />
            <label className="text-xs text-navy-dark font-bold flex items-center gap-1.5">
              تاريخ اليوم:
              <input
                type="date"
                value={state.today}
                min={TIMELINE.start}
                max={TIMELINE.end}
                onChange={(e) => patch({ today: e.target.value || todayISO() })}
                className="ltr-num border border-gray-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-gold/40 outline-none"
              />
            </label>
          </div>
        </section>

        {/* ============ MAIN GANTT ============ */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex">
            {/* RIGHT: table */}
            <div className="shrink-0 w-[300px] md:w-[420px] border-l border-gray-200">
              {/* table header */}
              <div
                className="sticky top-0 z-20 bg-navy-mid text-white grid items-center text-[12px] font-bold"
                style={{ gridTemplateColumns: '1fr 1.6fr 96px', height: 56 }}
              >
                <div className="px-2 text-center">المراحل</div>
                <div className="px-2 text-center border-r border-white/15">أهم مخرجات المرحلة</div>
                <div className="px-2 text-center border-r border-white/15">الحالة</div>
              </div>

              {visiblePhases.map((ph, pi) => (
                <PhaseTableBlock
                  key={ph.id}
                  phase={ph}
                  phaseIndex={pi}
                  rowH={ROW_H}
                  phaseH={PHASE_H}
                  onRename={(name) => renamePhase(ph.id, name)}
                  onDeletePhase={() => deletePhase(ph.id)}
                  onAddTask={() => addTask(ph.id)}
                  onUpdateTask={(tid, ch) => updateTask(ph.id, tid, ch)}
                  onDeleteTask={(tid) => deleteTask(ph.id, tid)}
                  onMoveTask={(tid, d) => moveTask(ph.id, tid, d)}
                />
              ))}
              <div className="p-2">
                <button
                  onClick={addPhase}
                  className="w-full text-xs text-navy-mid hover:text-white hover:bg-navy-mid border border-dashed border-navy-mid/40 rounded-lg py-1.5 font-medium transition-colors"
                >
                  ＋ إضافة مرحلة
                </button>
              </div>
            </div>

            {/* LEFT: timeline */}
            <div className="flex-1 overflow-x-auto timeline-scroll">
              <div className="relative" style={{ minWidth: 720 }}>
                {/* month axis header */}
                <div
                  className="sticky top-0 z-10 bg-navy-mid text-white"
                  style={{ height: 56 }}
                >
                  <div className="flex justify-between items-center px-3 pt-1.5">
                    <span className="text-[11px] text-teal/90">المحور الزمني</span>
                    <span className="ltr-num text-xs font-bold text-gold">{TIMELINE.year}</span>
                  </div>
                  <div className="relative h-7">
                    {months.map((mo) => (
                      <div
                        key={mo.label}
                        className="absolute top-0 h-full flex items-center justify-center text-[10.5px] border-r border-white/15"
                        style={{ right: `${mo.rightStart}%`, width: `${mo.widthPct}%` }}
                      >
                        {mo.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* timeline body with absolute gridlines + today line */}
                <div className="relative">
                  {/* month gridlines (full height) */}
                  {months.map((mo) => (
                    <div
                      key={mo.label}
                      className="absolute top-0 bottom-0 border-r border-gray-100"
                      style={{ right: `${mo.rightStart}%` }}
                    />
                  ))}

                  {/* TODAY line */}
                  {todayPct >= 0 && todayPct <= 100 && (
                    <div
                      className="absolute top-0 bottom-0 z-20 pointer-events-none"
                      style={{ right: `${todayPct}%` }}
                    >
                      <div
                        className="h-full border-r-2 border-dashed"
                        style={{ borderColor: '#C8202F' }}
                      />
                      <div
                        className="absolute -bottom-0.5 -translate-x-1/2 right-0 flex flex-col items-center"
                        style={{ transform: 'translateX(50%)' }}
                      >
                        <div
                          className="w-0 h-0"
                          style={{
                            borderInline: '5px solid transparent',
                            borderTop: '7px solid #C8202F',
                          }}
                        />
                      </div>
                      <div
                        className="absolute top-1 right-0 translate-x-1/2 bg-brand-red text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap font-bold"
                        style={{ transform: 'translateX(50%)' }}
                      >
                        اليوم
                      </div>
                    </div>
                  )}

                  {/* rows */}
                  {visiblePhases.map((ph) => (
                    <div key={ph.id}>
                      {/* phase spacer row aligning with the table phase header */}
                      <div
                        className="border-b border-gray-100 bg-graylight/60"
                        style={{ height: PHASE_H }}
                      />
                      {ph.visibleTasks.map((t, i) => (
                        <TimelineRow key={t.id} task={t} rowH={ROW_H} zebra={i % 2 === 1} />
                      ))}
                      {ph.visibleTasks.length === 0 && (
                        <div
                          className="border-b border-gray-100"
                          style={{ height: ROW_H }}
                        />
                      )}
                    </div>
                  ))}
                  {/* spacer to match the "add phase" footer in the table */}
                  <div style={{ height: 52 }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ LEGEND ============ */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
            {LEGEND.map((l) => (
              <div key={l.label} className="flex items-center gap-2 text-[12px]">
                <span
                  className="w-3.5 h-3.5 rotate-45 inline-block rounded-[2px]"
                  style={{ background: l.color }}
                />
                <span className="text-gray-700">{l.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-[12px] border-r border-gray-200 pr-6">
              <Diamond color="#7CB342" />
              <span className="text-gray-700">نقطة تحقق أسبوعية</span>
            </div>
          </div>
        </section>

        <footer className="text-center text-[11px] text-gray-400 pt-2">
          جميع البيانات قابلة للتعديل وتُحفظ محلياً في المتصفح • تقرير حالة مشروع
        </footer>
      </main>
    </div>
  )
}

/* ===================== Sub-components ===================== */

function SummaryCard({ title, accent, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div
        className="px-3 py-2 text-white text-[13px] font-bold flex items-center gap-2"
        style={{ background: '#1B3A57' }}
      >
        <span className="w-1.5 h-4 rounded-full" style={{ background: accent }} />
        {title}
      </div>
      <div className="p-3 flex-1">{children}</div>
    </div>
  )
}

function KpiBlock({ label, color, value, override, onChange, onReset }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <CircularProgress value={value} color={color} label={label} size={86} />
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          max={100}
          value={Math.round(value)}
          onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value))))}
          className="ltr-num w-12 text-center text-xs border border-gray-300 rounded px-1 py-0.5 focus:ring-2 focus:ring-gold/40 outline-none"
        />
        {override != null ? (
          <IconBtn onClick={onReset} title="حساب تلقائي" className="text-gold">
            ↺
          </IconBtn>
        ) : (
          <span className="text-[9px] text-gray-400">تلقائي</span>
        )}
      </div>
    </div>
  )
}

function ProjectStatusBadge({ statusKey, isAuto, onChange, onAuto }) {
  const [open, setOpen] = useState(false)
  const info = projectStatusInfo(statusKey)
  return (
    <div className="mt-3 flex flex-col items-center gap-1">
      <span className="text-[11px] text-gray-500">حالة المشروع</span>
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-full px-4 py-1.5 font-bold text-sm shadow-sm"
          style={{ background: info.color, color: info.textDark ? '#5C1A2B' : '#fff' }}
        >
          {info.label}
        </button>
        {open && (
          <div className="absolute z-30 mt-1 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[140px]">
            <button
              onClick={() => {
                onAuto()
                setOpen(false)
              }}
              className={`w-full text-right px-3 py-1.5 text-[12px] hover:bg-gray-50 ${
                isAuto ? 'font-bold text-navy-dark' : ''
              }`}
            >
              تلقائي ✓
            </button>
            <div className="h-px bg-gray-100 my-1" />
            {Object.entries(PROJECT_STATUS).map(([key, s]) => (
              <button
                key={key}
                onClick={() => {
                  onChange(key)
                  setOpen(false)
                }}
                className="w-full text-right px-3 py-1.5 text-[12px] hover:bg-gray-50 flex items-center gap-2"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <span className="text-[9px] text-gray-400">{isAuto ? 'محسوبة تلقائياً' : 'محددة يدوياً'}</span>
    </div>
  )
}

function PhaseTableBlock({
  phase,
  phaseIndex,
  rowH,
  phaseH,
  onRename,
  onDeletePhase,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
}) {
  return (
    <div>
      {/* phase header */}
      <div
        className="relative flex items-center bg-navy-dark text-white group"
        style={{ height: phaseH }}
      >
        <span className="absolute right-0 top-0 bottom-0 w-1.5" style={{ background: '#7BA8A8' }} />
        <div className="pr-4 pl-2 text-[12.5px] font-bold flex-1 leading-tight">
          <EditableText value={phase.name} onChange={onRename} className="text-white" />
        </div>
        <div className="flex items-center gap-1 pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onAddTask} title="إضافة مخرج" className="text-teal hover:text-gold text-sm">
            ＋
          </button>
          <button onClick={onDeletePhase} title="حذف المرحلة" className="text-teal hover:text-brand-red text-xs">
            🗑
          </button>
        </div>
      </div>

      {/* task rows */}
      {phase.visibleTasks.map((t, i) => (
        <div
          key={t.id}
          className={`grid items-center group border-b border-gray-100 ${
            i % 2 === 1 ? 'bg-graylight/60' : 'bg-white'
          }`}
          style={{ gridTemplateColumns: '1fr 1.6fr 96px', height: rowH }}
        >
          {/* phase column (reorder controls) */}
          <div className="flex flex-col items-center justify-center text-gray-300">
            <button
              onClick={() => onMoveTask(t.id, -1)}
              className="leading-none hover:text-navy-dark text-[10px] opacity-0 group-hover:opacity-100"
              title="أعلى"
            >
              ▲
            </button>
            <button
              onClick={() => onMoveTask(t.id, 1)}
              className="leading-none hover:text-navy-dark text-[10px] opacity-0 group-hover:opacity-100"
              title="أسفل"
            >
              ▼
            </button>
          </div>

          {/* deliverable name + code + dates */}
          <div className="px-2 border-r border-gray-100 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="ltr-num text-[10px] font-bold text-navy-mid bg-graylight rounded px-1 shrink-0">
                {t.code}
              </span>
              <span className="text-[12px] truncate flex-1">
                <EditableText value={t.name} onChange={(v) => onUpdateTask(t.id, { name: v })} />
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <input
                type="date"
                value={t.startDate}
                onChange={(e) => onUpdateTask(t.id, { startDate: e.target.value })}
                className="ltr-num text-[9px] text-gray-500 border border-transparent hover:border-gray-200 rounded px-0.5 outline-none focus:border-gold"
              />
              <span className="text-[9px] text-gray-300">←</span>
              <input
                type="date"
                value={t.endDate}
                onChange={(e) => onUpdateTask(t.id, { endDate: e.target.value })}
                className="ltr-num text-[9px] text-gray-500 border border-transparent hover:border-gray-200 rounded px-0.5 outline-none focus:border-gold"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={t.percentComplete}
                onChange={(e) =>
                  onUpdateTask(t.id, {
                    percentComplete: Math.max(0, Math.min(100, Number(e.target.value))),
                  })
                }
                title="نسبة الإنجاز"
                className="ltr-num w-9 text-[9px] text-gray-500 border border-transparent hover:border-gray-200 rounded px-0.5 outline-none focus:border-gold mr-auto"
              />
            </div>
          </div>

          {/* status */}
          <div className="flex items-center justify-center gap-1 border-r border-gray-100 px-1">
            <StatusBadge
              statusKey={t.status}
              onChange={(k) => onUpdateTask(t.id, { status: k })}
              small
            />
            <button
              onClick={() => onDeleteTask(t.id)}
              className="opacity-0 group-hover:opacity-100 text-brand-red text-[10px] transition-opacity"
              title="حذف المخرج"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      {phase.visibleTasks.length === 0 && (
        <div
          className="flex items-center justify-center text-[11px] text-gray-400 border-b border-gray-100"
          style={{ height: rowH }}
        >
          لا توجد مخرجات مطابقة للفلتر
        </div>
      )}
    </div>
  )
}

function TimelineRow({ task, rowH, zebra }) {
  const { right, width } = barGeometry(task)
  const actual = taskActual(task)
  const color = (TASK_STATUS[task.status] || {}).color || '#9E9E9E'
  return (
    <div
      className={`relative border-b border-gray-100 ${zebra ? 'bg-graylight/40' : ''}`}
      style={{ height: rowH }}
    >
      {/* gray planned bar */}
      <div
        className="absolute top-1/2 -translate-y-1/2 rounded-full"
        style={{
          right: `${right}%`,
          width: `${width}%`,
          height: 12,
          background: '#9E9E9E',
        }}
      >
        {/* progress fill */}
        <div
          className="h-full rounded-full"
          style={{ width: `${actual}%`, background: color, opacity: 0.9 }}
        />
      </div>
      {/* milestone diamond at the bar start (right edge in RTL) */}
      <div
        className="absolute top-1/2 z-10"
        style={{ right: `${right}%`, transform: 'translate(50%, -50%)' }}
      >
        <Diamond color={color} />
      </div>
    </div>
  )
}

function Diamond({ color }) {
  return (
    <span
      className="inline-block w-3 h-3 rotate-45 rounded-[2px] border border-white shadow"
      style={{ background: color }}
    />
  )
}
