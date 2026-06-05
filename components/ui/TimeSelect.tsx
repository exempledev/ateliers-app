'use client'

import { useState, useRef, useEffect } from 'react'
import { Clock } from 'lucide-react'

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

interface Props {
  value: string
  onChange: (value: string) => void
  required?: boolean
  className?: string
}

export default function TimeSelect({ value, onChange, required, className }: Props) {
  const [open, setOpen] = useState(false)
  const [hh, mm] = value ? value.split(':') : ['', '']
  const containerRef = useRef<HTMLDivElement>(null)
  const hourRef = useRef<HTMLDivElement>(null)
  const minRef = useRef<HTMLDivElement>(null)

  // Fermer au clic extérieur
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  // Scroller jusqu'à la valeur sélectionnée à l'ouverture
  useEffect(() => {
    if (!open) return
    setTimeout(() => {
      const scrollTo = (ref: React.RefObject<HTMLDivElement | null>, selector: string) => {
        const el = ref.current?.querySelector(selector) as HTMLElement | null
        if (el) el.scrollIntoView({ block: 'center' })
      }
      scrollTo(hourRef, '[data-selected="true"]')
      scrollTo(minRef, '[data-selected="true"]')
    }, 0)
  }, [open])

  function selectHour(h: string) {
    onChange(`${h}:${mm || '00'}`)
  }

  function selectMinute(m: string) {
    onChange(`${hh || '00'}:${m}`)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      {/* Champ déclencheur */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition hover:border-[var(--primary)]"
      >
        <Clock className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
        <span className={value ? 'text-[var(--foreground)] font-semibold tracking-wide' : 'text-[var(--muted)]'}>
          {value || '-- : --'}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1.5 left-0 bg-white rounded-2xl border border-[var(--border)] shadow-xl overflow-hidden w-44">
          <div className="flex">
            {/* Heures */}
            <div ref={hourRef} className="flex-1 overflow-y-auto max-h-52 py-1 border-r border-[var(--border)]">
              <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-widest text-center py-1.5">HH</p>
              {HOURS.map(h => (
                <button
                  key={h}
                  type="button"
                  data-selected={h === hh}
                  onClick={() => selectHour(h)}
                  className={`w-full py-1.5 text-sm text-center transition-colors ${
                    h === hh
                      ? 'bg-[var(--primary)] text-white font-semibold'
                      : 'text-[var(--foreground)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>

            {/* Minutes */}
            <div ref={minRef} className="flex-1 overflow-y-auto max-h-52 py-1">
              <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-widest text-center py-1.5">MM</p>
              {MINUTES.map(m => (
                <button
                  key={m}
                  type="button"
                  data-selected={m === mm}
                  onClick={() => selectMinute(m)}
                  className={`w-full py-1.5 text-sm text-center transition-colors ${
                    m === mm
                      ? 'bg-[var(--primary)] text-white font-semibold'
                      : 'text-[var(--foreground)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
