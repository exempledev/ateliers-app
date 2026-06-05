import { cn } from '@/lib/utils'
import type { Theme } from '@/types'

interface BadgeProps {
  theme?: Theme
  label: string
  className?: string
}

export default function Badge({ theme, label, className }: BadgeProps) {
  const styles = {
    travail: 'bg-[var(--travail-light)] text-[var(--travail)]',
    detente: 'bg-[var(--detente-light)] text-[var(--detente)]',
    default: 'bg-[var(--border)] text-[var(--muted)]',
  }

  const style = theme ? styles[theme] : styles.default

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', style, className)}>
      {label}
    </span>
  )
}
