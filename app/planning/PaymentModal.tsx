'use client'

import { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { X, Calendar, Clock, MapPin, ShieldCheck, ChevronLeft, CreditCard, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Atelier } from '@/types'

interface AtelierForPayment extends Atelier {
  price: number
  users?: {
    full_name: string
    email?: string | null
    organisme?: string | null
  } | null
}

interface Props {
  atelier: AtelierForPayment
  onSuccess: () => void
  onClose: () => void
  paypalClientId: string
}

type Step = 'summary' | 'payment'
type Method = 'paypal' | 'card'

const PaypalLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.99l-.318 2.062h3.051c.46 0 .85-.334.922-.788l.038-.225.735-4.653.047-.257c.072-.454.462-.788.922-.788h.581c3.76 0 6.701-1.528 7.559-5.95.36-1.847.174-3.388-.83-4.37z" />
  </svg>
)

export default function PaymentModal({ atelier, onSuccess, onClose, paypalClientId }: Props) {
  const [step, setStep] = useState<Step>('summary')
  const [method, setMethod] = useState<Method>('paypal')

  const isTravail = atelier.theme === 'travail'
  const themeColor = isTravail ? 'var(--travail)' : 'var(--detente)'

  const dateFormatted = (() => {
    try { return format(parseISO(atelier.date), "EEEE d MMMM yyyy", { locale: fr }) }
    catch { return atelier.date }
  })()

  return (
    <PayPalScriptProvider options={{ clientId: paypalClientId, currency: 'EUR', locale: 'fr_FR' }}>
      <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="animate-slide-up bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] relative">
            {step === 'payment' && (
              <button
                onClick={() => setStep('summary')}
                className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Retour
              </button>
            )}
            <span className={`text-sm font-semibold text-[var(--foreground)] ${step === 'summary' ? '' : 'absolute left-1/2 -translate-x-1/2'}`}>
              {step === 'summary' ? 'Confirmer la réservation' : 'Moyen de paiement'}
            </span>
            <button
              onClick={onClose}
              className="ml-auto p-1.5 rounded-lg hover:bg-[var(--background)] text-[var(--muted)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── ÉTAPE 1 : Récapitulatif ── */}
          {step === 'summary' && (
            <>
              <div className="px-6 py-5 flex flex-col gap-4">
                {/* Atelier */}
                <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                  <div className="h-1" style={{ background: themeColor }} />
                  <div className="p-4">
                    <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full text-white mb-2" style={{ background: themeColor }}>
                      {isTravail ? 'Travail' : 'Détente'}
                    </span>
                    <h3 className="font-bold text-[var(--foreground)] mb-3">{atelier.title}</h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2.5 text-sm text-[var(--muted)]">
                        <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: themeColor }} />
                        <span className="capitalize">{dateFormatted}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-[var(--muted)]">
                        <Clock className="w-4 h-4 flex-shrink-0" style={{ color: themeColor }} />
                        <span>{atelier.start_time.slice(0, 5)} – {atelier.end_time.slice(0, 5)}</span>
                      </div>
                      {atelier.location && (
                        <div className="flex items-center gap-2.5 text-sm text-[var(--muted)]">
                          <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: themeColor }} />
                          <span>{atelier.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Animateur */}
                {atelier.users?.full_name && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold" style={{ background: themeColor }}>
                      {atelier.users.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{atelier.users.full_name}</p>
                      <p className="text-xs text-[var(--muted)]">{atelier.users.organisme ?? atelier.users.email ?? 'Animateur'}</p>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                  <span className="text-sm font-medium text-[var(--foreground)]">Total à régler</span>
                  <span className="text-2xl font-bold" style={{ color: themeColor }}>{atelier.price.toFixed(2)} €</span>
                </div>
              </div>

              {/* Footer step 1 */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--background)]">
                <button onClick={onClose} className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                  Annuler
                </button>
                <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Sécurisé
                </div>
                <button
                  onClick={() => setStep('payment')}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  style={{ background: themeColor }}
                >
                  Continuer <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* ── ÉTAPE 2 : Paiement ── */}
          {step === 'payment' && (
            <>
              <div className="px-6 py-5 flex flex-col gap-4">
                {/* Tabs */}
                <div className="grid grid-cols-2 gap-2">
                  {(['card', 'paypal'] as Method[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                        method === m
                          ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                          : 'border-[var(--border)] text-[var(--muted)] hover:bg-[var(--background)]'
                      }`}
                    >
                      {m === 'card' ? <CreditCard className="w-5 h-5" /> : <PaypalLogo className="w-5 h-5" />}
                      {m === 'card' ? 'Carte bancaire' : 'PayPal'}
                    </button>
                  ))}
                </div>

                {/* Info box */}
                {method === 'card' && (
                  <div className="rounded-xl border border-[var(--border)] p-4 flex items-start gap-3 bg-[var(--background)]">
                    <CreditCard className="w-8 h-8 text-[var(--muted)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">Carte bancaire</p>
                      <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">Bientôt disponible — utilisez PayPal pour le moment.</p>
                    </div>
                  </div>
                )}

                {method === 'paypal' && (
                  <div className="rounded-xl border border-[var(--border)] p-4 flex items-start gap-3 bg-[var(--background)]">
                    <div className="w-9 h-9 rounded-lg bg-[#003087] flex items-center justify-center flex-shrink-0">
                      <PaypalLogo className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">Compte PayPal</p>
                      <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                        Après confirmation, vous serez guidé sur PayPal pour finaliser votre paiement de {atelier.price.toFixed(2)} € en toute sécurité.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer step 2 — bouton PayPal intégré */}
              <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-[var(--border)] bg-[var(--background)]">
                <button
                  onClick={() => setStep('summary')}
                  className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex-shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Retour
                </button>

                <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Sécurisé
                </div>

                <div className="flex-shrink-0" style={{ minWidth: 170 }}>
                  {method === 'paypal' && (
                    <PayPalButtons
                      fundingSource="paypal"
                      style={{ height: 40, shape: 'rect', label: 'pay', tagline: false }}
                      createOrder={async () => {
                        const res = await fetch('/api/paypal/create-order', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ price: atelier.price, title: atelier.title }),
                        })
                        const { id } = await res.json()
                        return id
                      }}
                      onApprove={async (data) => {
                        const res = await fetch('/api/paypal/capture-order', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ orderId: data.orderID, atelierId: atelier.id }),
                        })
                        const result = await res.json()
                        if (result.success) onSuccess()
                      }}
                      onError={() => {}}
                    />
                  )}
                  {method === 'card' && (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-[var(--border)] text-[var(--muted)] text-sm font-medium cursor-not-allowed"
                    >
                      Bientôt disponible
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </PayPalScriptProvider>
  )
}
