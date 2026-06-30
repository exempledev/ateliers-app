'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, User, Calendar, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Notification {
  id: string
  type: 'new_user' | 'reservation' | 'payment'
  title: string
  message: string | null
  is_read: boolean
  created_at: string
  metadata: Record<string, unknown>
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const supabase = createClient()
  const ref = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifications((data ?? []) as Notification[])
  }

  useEffect(() => {
    fetchNotifications()

    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
      }, () => fetchNotifications())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function markAllRead() {
    if (unreadCount === 0) return
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  function handleOpen() {
    setOpen(o => !o)
    if (!open) setTimeout(markAllRead, 1000)
  }

  function getIcon(type: string) {
    switch (type) {
      case 'new_user': return <User className="w-3.5 h-3.5" />
      case 'reservation': return <Calendar className="w-3.5 h-3.5" />
      case 'payment': return <CreditCard className="w-3.5 h-3.5" />
      default: return <Bell className="w-3.5 h-3.5" />
    }
  }

  function getIconStyle(type: string) {
    switch (type) {
      case 'new_user': return 'bg-blue-50 text-blue-500'
      case 'reservation': return 'bg-green-50 text-green-500'
      case 'payment': return 'bg-amber-50 text-amber-600'
      default: return 'bg-[var(--primary-light)] text-[var(--primary)]'
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors ml-1"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-slide-up absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-[var(--border)] shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <h3 className="font-semibold text-sm text-[var(--foreground)]">
              Notifications {unreadCount > 0 && <span className="text-xs font-normal text-[var(--muted)]">({unreadCount} non lues)</span>}
            </h3>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-[var(--border)] text-[var(--muted)] transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-[var(--border)]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="w-8 h-8 text-[var(--muted)] opacity-30 mb-2" />
                <p className="text-sm text-[var(--muted)]">Aucune notification</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`flex items-start gap-3 px-4 py-3 transition-colors ${!n.is_read ? 'bg-[var(--primary-light)]/40' : 'hover:bg-[var(--background)]'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${getIconStyle(n.type)}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">{n.title}</p>
                    {n.message && (
                      <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">{n.message}</p>
                    )}
                    <p className="text-[10px] text-[var(--muted)] mt-1">
                      {format(parseISO(n.created_at), "d MMM à HH:mm", { locale: fr })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] flex-shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
