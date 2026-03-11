import { FileText, ShoppingCart, Receipt, ArrowRight } from 'lucide-react'

const DOC_TYPES = [
  {
    id: 'proforma',
    icon: FileText,
    label: 'Devis / Pro Forma',
    desc: "Établissez un devis ou une facture pro forma pour votre client avant la commande.",
    accent: 'proforma',
  },
  {
    id: 'commande',
    icon: ShoppingCart,
    label: 'Bon de Commande',
    desc: "Créez un bon de commande officiel pour vos achats auprès de vos fournisseurs.",
    accent: 'commande',
  },
  {
    id: 'facture',
    icon: Receipt,
    label: 'Facture',
    desc: "Générez une facture express pour une vente rapide ou une prestation de service.",
    accent: 'facture',
  },
]

export default function Home({ onSelect }) {
  return (
    <div>
      <div className="home-hero">
        <h1>
          Créez vos documents<br />
          <span>professionnels</span> en quelques clics
        </h1>
        <p>Devis, bons de commande, factures — propres, rapides et exportables en PDF.</p>
      </div>

      <div className="doc-cards">
        {DOC_TYPES.map(({ id, icon: Icon, label, desc, accent }) => (
          <div
            key={id}
            className="doc-card"
            onClick={() => onSelect(id)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onSelect(id)}
          >
            <div className={`doc-card-icon ${accent}`}>
              <Icon size={24} />
            </div>
            <h3>{label}</h3>
            <p>{desc}</p>
            <div className="doc-card-arrow">
              <ArrowRight size={18} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
