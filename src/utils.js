import { TIMELINE, TASK_STATUS, PROJECT_STATUS } from './data.js'

// Parse 'YYYY-MM-DD' as a local date (avoids TZ shifts)
export function parseDate(s) {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const MS_DAY = 24 * 60 * 60 * 1000

export function daysBetween(a, b) {
  return Math.round((parseDate(b) - parseDate(a)) / MS_DAY)
}

const DOMAIN_START = TIMELINE.start
const DOMAIN_END = TIMELINE.end
const TOTAL_DAYS = daysBetween(DOMAIN_START, DOMAIN_END) || 1

// fraction (0..1) of a date along the fixed timeline domain
export function dateToFraction(dateStr) {
  const f = daysBetween(DOMAIN_START, dateStr) / TOTAL_DAYS
  return Math.max(0, Math.min(1, f))
}

// Bar geometry as percentages. In an RTL container, anchor with `right`.
export function barGeometry(task) {
  const startF = dateToFraction(task.startDate)
  const endF = dateToFraction(task.endDate)
  const right = startF * 100
  const width = Math.max(0.8, (endF - startF) * 100)
  return { right, width }
}

// Month gridline + header positions (as right% offsets) across the domain
export function monthColumns() {
  return TIMELINE.months.map((mo) => {
    const first = `${TIMELINE.year}-${String(mo.m + 1).padStart(2, '0')}-01`
    // last day of that month
    const lastDay = new Date(TIMELINE.year, mo.m + 1, 0).getDate()
    const last = `${TIMELINE.year}-${String(mo.m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    const rightStart = dateToFraction(first) * 100
    const rightEnd = dateToFraction(last) * 100
    return { ...mo, rightStart, widthPct: rightEnd - rightStart }
  })
}

// ---- Percentage roll-ups ----

// Actual completion for a single task (0..100)
export function taskActual(task) {
  if (task.status === 'done') return 100
  if (task.status === 'notStarted') return 0
  return clamp(Number(task.percentComplete) || 0, 0, 100)
}

// Planned completion for a single task as of `today` (0..100)
export function taskPlanned(task, today) {
  const total = daysBetween(task.startDate, task.endDate)
  if (total <= 0) return parseDate(today) >= parseDate(task.endDate) ? 100 : 0
  const elapsed = daysBetween(task.startDate, today)
  return clamp((elapsed / total) * 100, 0, 100)
}

function durationDays(task) {
  return Math.max(1, daysBetween(task.startDate, task.endDate))
}

// Weighted (by planned duration) roll-up across all tasks
export function rollup(phases, today) {
  const tasks = phases.flatMap((p) => p.tasks)
  if (tasks.length === 0) return { planned: 0, actual: 0 }
  let wSum = 0
  let plannedSum = 0
  let actualSum = 0
  for (const t of tasks) {
    const w = durationDays(t)
    wSum += w
    plannedSum += taskPlanned(t, today) * w
    actualSum += taskActual(t) * w
  }
  return {
    planned: Math.round(plannedSum / wSum),
    actual: Math.round(actualSum / wSum),
  }
}

// Derive the project status badge from the planned-vs-actual gap
export function deriveProjectStatus(planned, actual) {
  if (actual >= 100) return 'done'
  const gap = planned - actual
  if (gap <= 5) return 'onPlan'
  if (gap <= 10) return 'minorDelay'
  return 'late'
}

export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n))
}

export function statusColor(statusKey) {
  return (TASK_STATUS[statusKey] || {}).color || '#9E9E9E'
}

export function projectStatusInfo(key) {
  return PROJECT_STATUS[key] || PROJECT_STATUS.onPlan
}
