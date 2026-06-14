import React, { useState, useRef, useEffect } from 'react'
import { TASK_STATUS, TASK_STATUS_ORDER } from './data.js'

// ---------- Inline editable text ----------
export function EditableText({ value, onChange, className = '', multiline = false, placeholder = '' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef(null)

  useEffect(() => setDraft(value), [value])
  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus()
      ref.current.select?.()
    }
  }, [editing])

  const commit = () => {
    setEditing(false)
    if (draft !== value) onChange(draft)
  }

  if (editing) {
    const Tag = multiline ? 'textarea' : 'input'
    return (
      <Tag
        ref={ref}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !multiline) commit()
          if (e.key === 'Escape') {
            setDraft(value)
            setEditing(false)
          }
        }}
        className={`bg-white/95 border border-gold/70 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-gold/50 ${className}`}
        rows={multiline ? 2 : undefined}
      />
    )
  }
  return (
    <span
      onClick={() => setEditing(true)}
      title="انقر للتعديل"
      className={`cursor-text hover:bg-gold/10 rounded px-1 -mx-1 transition-colors ${className} ${
        !value ? 'text-gray-400' : ''
      }`}
    >
      {value || placeholder}
    </span>
  )
}

// ---------- Editable bulleted list ----------
export function EditableList({ items, onChange, accent = '#7CB342' }) {
  const update = (i, v) => {
    const next = [...items]
    next[i] = v
    onChange(next)
  }
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const add = () => onChange([...items, 'عنصر جديد'])

  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 group text-[13px] leading-relaxed">
          <span
            className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: accent }}
          />
          <span className="flex-1">
            <EditableText value={it} onChange={(v) => update(i, v)} multiline className="w-full" />
          </span>
          <button
            onClick={() => remove(i)}
            className="opacity-0 group-hover:opacity-100 text-brand-red text-xs px-1 transition-opacity shrink-0"
            title="حذف"
          >
            ✕
          </button>
        </li>
      ))}
      <li>
        <button
          onClick={add}
          className="text-xs text-navy-mid hover:text-navy-dark font-medium flex items-center gap-1 mt-1"
        >
          <span className="text-base leading-none">＋</span> إضافة عنصر
        </button>
      </li>
    </ul>
  )
}

// ---------- Status badge with dropdown ----------
export function StatusBadge({ statusKey, onChange, small = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const info = TASK_STATUS[statusKey] || TASK_STATUS.notStarted

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`rounded-full font-medium text-white whitespace-nowrap transition-transform hover:scale-[1.03] ${
          small ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1'
        }`}
        style={{ background: info.color }}
        title="انقر لتغيير الحالة"
      >
        {info.label}
      </button>
      {open && (
        <div className="absolute z-30 mt-1 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[130px]">
          {TASK_STATUS_ORDER.map((key) => {
            const s = TASK_STATUS[key]
            return (
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
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---------- Circular progress (KPI) ----------
export function CircularProgress({ value, color, label, size = 96 }) {
  const stroke = 9
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value))
  const offset = c - (pct / 100) * c
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E6EAED" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset .5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="ltr-num text-xl font-bold" style={{ color }}>
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      <span className="text-[11px] text-gray-600 text-center leading-tight">{label}</span>
    </div>
  )
}

// ---------- Small icon button ----------
export function IconBtn({ onClick, title, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`text-gray-400 hover:text-navy-dark w-5 h-5 inline-flex items-center justify-center rounded transition-colors ${className}`}
    >
      {children}
    </button>
  )
}
