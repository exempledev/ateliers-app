import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: "Mentions Légales — Les Ateliers d'Émergence",
}

export default function MentionsLegalesPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Mentions Légales</h1>
          <p className="text-sm text-[var(--muted)]">Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique</p>
        </div>

        <Section title="Éditeur du site">
          <Row label="Raison sociale" value="SARL PASCAL CHARBONNIER" />
          <Row label="Forme juridique" value="Société à Responsabilité Limitée (SARL)" />
          <Row label="Capital social" value="1 000 EUR" />
          <Row label="SIRET" value="98358479800018" />
          <Row label="RCS" value="Registre du Commerce et des Sociétés de Limoges" />
          <Row label="Siège social" value="96 avenue Emile Labussière, 87100 Limoges" />
          <Row label="Directeur de publication" value="M. Pascal CHARBONNIER" />
          <Row label="Téléphone" value={<a href="tel:0650270440" className="text-[var(--primary)] hover:underline">06.50.27.04.40</a>} />
          <Row label="Email" value={<a href="mailto:form4business@gmail.com" className="text-[var(--primary)] hover:underline">form4business@gmail.com</a>} />
        </Section>

        <Section title="Hébergeur">
          <Row label="Société" value="Railway Corp" />
          <Row label="Adresse" value="340 Pine Street, Suite 800, San Francisco, CA 94104, États-Unis" />
          <Row label="Site web" value={<a href="https://railway.app" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">https://railway.app</a>} />
        </Section>

        <Section title="Propriété intellectuelle">
          L'ensemble des contenus présents sur le site Les Ateliers d'Émergence (textes, images, logos, graphismes,
          icônes) sont la propriété exclusive de la SARL PASCAL CHARBONNIER ou de leurs auteurs respectifs.
          Toute reproduction, représentation, modification, publication ou adaptation, totale ou partielle, de ces
          éléments, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable de
          la SARL PASCAL CHARBONNIER.
        </Section>

        <Section title="Données personnelles">
          <p>
            Les informations recueillies sur ce site font l'objet d'un traitement informatique destiné à la gestion
            des réservations d'ateliers et à la relation client. Conformément au Règlement Général sur la Protection
            des Données (RGPD — Règlement UE 2016/679), vous disposez d'un droit d'accès, de rectification,
            d'effacement et d'opposition aux données vous concernant.
          </p>
          <p className="mt-3">
            Pour exercer ces droits, contactez-nous à{' '}
            <a href="mailto:form4business@gmail.com" className="text-[var(--primary)] hover:underline">
              form4business@gmail.com
            </a>
            {' '}ou par courrier à : 96 avenue Emile Labussière, 87100 Limoges.
          </p>
          <p className="mt-3">
            Vous pouvez également introduire une réclamation auprès de la{' '}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">
              Commission Nationale de l'Informatique et des Libertés (CNIL)
            </a>.
          </p>
        </Section>

        <Section title="Cookies">
          Le site Les Ateliers d'Émergence utilise des cookies techniques nécessaires au fonctionnement du service
          (gestion de session, authentification). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
          En continuant à naviguer sur ce site, vous acceptez l'utilisation de ces cookies techniques.
        </Section>

        <Section title="Limitation de responsabilité">
          La SARL PASCAL CHARBONNIER s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées
          sur ce site. Toutefois, elle ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations
          mises à disposition. La société décline toute responsabilité pour toute imprécision, inexactitude ou omission
          portant sur des informations disponibles sur le site, ainsi que pour tout dommage résultant d'une intrusion
          frauduleuse d'un tiers.
        </Section>

        <Section title="Droit applicable">
          Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français
          seront seuls compétents.
        </Section>

        <div className="text-center pt-4 pb-8">
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors underline underline-offset-2">
            ← Retour à l'accueil
          </Link>
        </div>
      </main>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-[var(--border)] p-6 mb-6">
      <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">{title}</h2>
      <div className="text-sm text-[var(--muted)] leading-relaxed">{children}</div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2 py-2 border-b border-[var(--border)] last:border-0 text-sm">
      <span className="font-medium text-[var(--foreground)] shrink-0 w-48">{label}</span>
      <span className="text-[var(--muted)]">{value}</span>
    </div>
  )
}
