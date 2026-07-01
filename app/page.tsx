'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Users, Zap, Leaf, ArrowRight, CheckCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[var(--primary-light)] opacity-50 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-[var(--accent-light)] opacity-40 blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
            <motion.div initial="hidden" animate="show" variants={stagger}>
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-sm font-medium mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                  8 ateliers par mois
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-5xl sm:text-6xl font-bold tracking-tight text-[var(--foreground)] mb-5 leading-tight"
              >
                Des ateliers pour
                <br />
                <span className="text-[var(--primary)]">mieux travailler & souffler</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed"
              >
                Chaque semaine, deux ateliers pensés pour vous — un pour booster votre
                productivité, un pour vous ressourcer. Réservez votre place en quelques secondes.
              </motion.p>

              <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href="/inscription"
                  className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-all shadow-sm hover:shadow-md"
                >
                  Créer un compte
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/planning"
                  className="px-8 py-3.5 rounded-xl bg-white border border-[var(--border)] text-[var(--foreground)] font-medium hover:bg-[var(--background)] transition-colors shadow-sm"
                >
                  Voir le planning
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-[var(--border)] bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex justify-center divide-x divide-[var(--border)]">
              {[
                { value: '8', label: 'ateliers par mois' },
                { value: '10–15', label: 'places par atelier' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center px-4 py-2">
                  <p className="text-2xl font-bold text-[var(--primary)]">{value}</p>
                  <p className="text-sm text-[var(--muted)] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Types d'ateliers */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">Deux types d'ateliers</h2>
            <p className="text-[var(--muted)]">Complémentaires, pensés pour votre quotidien professionnel</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative overflow-hidden rounded-2xl bg-[var(--travail-light)] border border-[var(--border)] p-8">
              <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[var(--travail)] opacity-10" />
              <div className="w-11 h-11 rounded-xl bg-[var(--travail)] flex items-center justify-center mb-5">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Ateliers Professionnel</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-5">
                Productivité, organisation, communication, gestion du stress — des outils concrets pour votre quotidien professionnel.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Gestion du temps', 'Communication', 'Leadership', 'Organisation'].map(tag => (
                  <span key={tag} className="px-2.5 py-1 text-xs rounded-full bg-white text-[var(--travail)] font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-[var(--detente-light)] border border-[var(--border)] p-8">
              <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[var(--detente)] opacity-10" />
              <div className="w-11 h-11 rounded-xl bg-[var(--detente)] flex items-center justify-center mb-5">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Ateliers Détente</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-5">
                Relaxation, pleine conscience, cohésion d'équipe — pour recharger les batteries et cultiver le bien-être au travail.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Méditation', 'Team building', 'Yoga', 'Pleine conscience'].map(tag => (
                  <span key={tag} className="px-2.5 py-1 text-xs rounded-full bg-white text-[var(--detente)] font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="bg-white border-y border-[var(--border)] py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">Comment ça marche ?</h2>
              <p className="text-[var(--muted)]">Trois étapes pour rejoindre votre premier atelier</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              {[
                {
                  step: '1',
                  icon: <Users className="w-5 h-5" />,
                  title: 'Créez votre compte',
                  desc: 'Inscrivez-vous en 30 secondes.',
                },
                {
                  step: '2',
                  icon: <Calendar className="w-5 h-5" />,
                  title: 'Choisissez un atelier',
                  desc: 'Consultez le planning de la semaine et réservez votre place en un clic.',
                },
                {
                  step: '3',
                  icon: <CheckCircle className="w-5 h-5" />,
                  title: 'Profitez',
                  desc: 'Recevez votre confirmation par mail et rejoignez l\'atelier.',
                },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="flex flex-col items-center text-center">
                  <div className="relative mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)]">
                      {icon}
                    </div>
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--primary)] text-white text-xs font-bold flex items-center justify-center">
                      {step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-2">{title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <div className="relative overflow-hidden rounded-3xl bg-[var(--primary)] px-8 py-16 text-center">
            <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white opacity-5" />
            <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-white opacity-5" />
            <h2 className="text-3xl font-bold text-white mb-3 relative">Prêt à rejoindre un atelier ?</h2>
            <p className="text-white/70 mb-8 relative max-w-md mx-auto">
              Inscrivez-vous maintenant et réservez votre première session dès cette semaine.
            </p>
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[var(--primary)] font-semibold hover:opacity-95 transition-opacity"
            >
              Commencer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--border)] py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/favicon.ico" alt="Logo" className="w-6 h-6 rounded-lg object-cover" />
              <span className="text-sm font-medium text-[var(--foreground)]">Les Ateliers d'Émergence</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link href="/mentions-legales" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors underline underline-offset-2">
                Mentions légales
              </Link>
              <Link href="/cgu" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors underline underline-offset-2">
                CGU
              </Link>
              <Link href="/cgv" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors underline underline-offset-2">
                CGV
              </Link>
              <p className="text-xs text-[var(--muted)]">© 2025 Les Ateliers d'Émergence · Tous droits réservés.</p>
            </div>
          </div>
        </footer>

      </main>
    </>
  )
}
