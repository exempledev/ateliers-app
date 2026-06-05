import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-[var(--border)] shadow-sm',
        onClick && 'cursor-pointer hover:shadow-md hover:border-[var(--primary)] transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  )
}
