import Navbar from '@/components/layout/Navbar'
import { Building2, Mail, Phone, MapPin } from 'lucide-react'

const espace = {
  name: 'Émergence Labussière',
  address: '96 avenue Emile Labussière, 87100 Limoges',
  phone: '+33 7 82 76 93 41',
  email: 'emergence.labussiere@gmail.com',
  website: 'https://www.emergence-labussiere.fr/fr/',
}

const contacts = [
  {
    name: 'Pascal Charbonnier',
    email: 'form4business87@gmail.com' as string | null,
    phone: '+33 6 50 27 04 40',
  },
  {
    name: 'Jessica Mataele',
    email: 'contact@stratgestion.com',
    phone: '+33 6 42 01 19 06',
  },
]

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Contact</h1>
          <p className="text-[var(--muted)] mt-1">Toutes les informations pour nous joindre</p>
        </div>

        {/* Espace de coworking */}
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden mb-8">
          <div className="h-1.5 bg-[var(--primary)]" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Espace de coworking</p>
                <a
                  href={espace.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-bold text-[var(--foreground)] hover:text-[var(--primary)] hover:underline transition-colors"
                >
                  {espace.name}
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[var(--muted)]" />
                </div>
                <span className="text-sm text-[var(--foreground)]">{espace.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-[var(--muted)]" />
                </div>
                <a href={`tel:${espace.phone}`} className="text-sm text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">{espace.phone}</a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-[var(--muted)]" />
                </div>
                <a href={`mailto:${espace.email}`} className="text-sm text-[var(--primary)] hover:underline">{espace.email}</a>
              </div>
            </div>
          </div>
        </div>

        {/* Contacts */}
        <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Nos contacts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contacts.map((c, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[var(--border)] p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-[var(--primary)]">{c.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[var(--foreground)] truncate">{c.name}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                {c.email && (
                  <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline truncate">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    {c.email}
                  </a>
                )}
                <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-sm text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  {c.phone}
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
