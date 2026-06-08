import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Les Ateliers d'Émergence",
  description: 'Réservez vos ateliers travail & détente',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="h-full" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
