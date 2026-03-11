import { fmt, calcItem, calcTotals, DOC_LABELS } from '../utils'

const ACCENT = {
  proforma: { color: '#4F46E5', gradient: 'linear-gradient(135deg,#4F46E5,#818CF8)' },
  commande: { color: '#B45309', gradient: 'linear-gradient(135deg,#C9A84C,#E4C97A)' },
  facture:  { color: '#065F46', gradient: 'linear-gradient(135deg,#059669,#34D399)' },
}

export default function DocPreview({ docType, data, items, settings }) {
  const label  = DOC_LABELS[docType] || DOC_LABELS.facture
  const accent = ACCENT[docType] || ACCENT.facture
  const { ht, aibAmt, tvaAmt, ttc } = calcTotals(items, settings.tva, settings.aib)
  const filledItems = items.filter(it => it.desc || it.pu)
  const isEmpty = filledItems.length === 0

  const s = {
    wrap:        { fontFamily: "'Sora','Segoe UI',Arial,sans-serif", fontSize: 10, color: '#1C1C1C', background: '#fff', width: '100%', padding: '16px 22px 14px', lineHeight: 1.4 },
    stripe:      { height: 3, background: accent.gradient, marginBottom: 12, borderRadius: 2 },
    header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, paddingBottom: 10, borderBottom: '2px solid #0D1117' },
    logoRow:     { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 },
    logoName:    { fontFamily: 'Georgia,serif', fontSize: 13, fontWeight: 800, color: '#0D1117', letterSpacing: '0.04em' },
    companyName: { fontSize: 11, fontWeight: 700, color: '#0D1117', marginBottom: 2 },
    companyInfo: { fontSize: 8.5, color: '#555', lineHeight: 1.5 },
    titleArea:   { textAlign: 'right' },
    docTitle:    { fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 800, color: accent.color, textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 4 },
    docMeta:     { fontSize: 9, color: '#444', lineHeight: 1.6 },
    addrBlock:   { padding: '6px 8px', borderRadius: 5, background: '#F8F8F5', border: '1px solid #E8E4D9', marginBottom: 8 },
    addrLabel:   { fontSize: 7.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: accent.color, marginBottom: 2 },
    addrName:    { fontSize: 10, fontWeight: 700, color: '#0D1117', marginBottom: 1 },
    addrInfo:    { fontSize: 8.5, color: '#555', lineHeight: 1.45 },
    objectLine:  { fontSize: 9, marginBottom: 6, color: '#374151' },
    table:       { width: '100%', borderCollapse: 'collapse', marginBottom: 6 },
    th:          { background: '#0D1117', color: '#E4C97A', fontSize: 7.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3.5px 5px', textAlign: 'left' },
    thR:         { background: '#0D1117', color: '#E4C97A', fontSize: 7.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3.5px 5px', textAlign: 'right' },
    thC:         { background: '#0D1117', color: '#E4C97A', fontSize: 7.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3.5px 5px', textAlign: 'center' },
    td:          { padding: '3px 5px', fontSize: 9, borderBottom: '1px solid #EFEFEF', color: '#1C1C1C' },
    tdR:         { padding: '3px 5px', fontSize: 9, borderBottom: '1px solid #EFEFEF', textAlign: 'right', fontFamily: 'monospace', color: '#1C1C1C' },
    tdC:         { padding: '3px 5px', fontSize: 9, borderBottom: '1px solid #EFEFEF', textAlign: 'center', color: '#1C1C1C' },
    tdCode:      { padding: '3px 5px', fontSize: 8, borderBottom: '1px solid #EFEFEF', fontFamily: 'monospace', color: '#666' },
    even:        { background: '#FAFAF7' },
    tdAib:       { padding: '3px 5px', fontSize: 8.5, fontStyle: 'italic', color: '#92400E', background: '#FFFBEB', borderBottom: '1px solid #EFEFEF' },
    totalsWrap:  { display: 'flex', justifyContent: 'flex-end', marginBottom: 8 },
    totalsBox:   { minWidth: 200 },
    tRow:        { display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 9, borderBottom: '1px solid #E8E4D9', gap: 20 },
    tRowGrand:   { display: 'flex', justifyContent: 'space-between', padding: '4px 0 1px', fontSize: 11, fontWeight: 800, borderTop: '2px solid #0D1117', gap: 20 },
    tVal:        { fontFamily: 'monospace', fontWeight: 600, textAlign: 'right', minWidth: 80 },
    tValGrand:   { fontFamily: 'monospace', fontWeight: 800, textAlign: 'right', minWidth: 80, color: accent.color },
    footer:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 6, borderTop: '1px solid #E8E4D9', gap: 16 },
    payTitle:    { fontSize: 7.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0D1117', marginBottom: 2 },
    payText:     { fontSize: 8, color: '#555', lineHeight: 1.45, maxWidth: 260 },
  }

  return (
    <div id="doc-to-print" style={s.wrap}>
      <div style={s.stripe} />

      {/* HEADER */}
      <div style={s.header}>
        <div>
          <div style={s.logoRow}>
            <img src="https://i.ibb.co/QvfKJvYz/Whats-App-Image-2026-03-10-at-21-27-25.jpg"
              style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} alt="logo" />
            <span style={s.logoName}>KOUKA</span>
          </div>
          <div style={s.companyName}>{data.sellerName || '—'}</div>
          <div style={s.companyInfo}>
            {data.sellerAddress && <div>{data.sellerAddress}</div>}
            {data.sellerTel     && <div>Tél : {data.sellerTel}</div>}
            {data.sellerEmail   && <div>{data.sellerEmail}</div>}
            {data.sellerIFU     && <div>IFU : {data.sellerIFU}</div>}
            {data.sellerRCCM    && <div>RCCM : {data.sellerRCCM}</div>}
          </div>
        </div>
        <div style={s.titleArea}>
          <div style={s.docTitle}>{label.title}</div>
          <div style={s.docMeta}>
            <div><strong>N° :</strong> {data.docNum || '—'}</div>
            <div><strong>Date :</strong> {data.docDate || '—'}</div>
            {docType === 'proforma' && data.validity && <div><strong>Validité :</strong> {data.validity}</div>}
            {docType === 'facture'  && data.dueDate  && <div><strong>Échéance :</strong> {data.dueDate}</div>}
          </div>
        </div>
      </div>

      {/* FOURNISSEUR / CLIENT */}
      <div style={s.addrBlock}>
        <div style={s.addrLabel}>{docType === 'commande' ? 'Fournisseur' : 'Client'}</div>
        {data.clientName
          ? <>
              <div style={s.addrName}>{data.clientName}</div>
              <div style={s.addrInfo}>
                {data.clientAddress && <div>{data.clientAddress}</div>}
                {data.clientTel     && <div>Tél : {data.clientTel}</div>}
                {data.clientEmail   && <div>{data.clientEmail}</div>}
              </div>
            </>
          : <div style={{ ...s.addrInfo, fontStyle: 'italic', color: '#9CA3AF' }}>Non renseigné</div>
        }
      </div>

      {/* OBJET */}
      {data.object && <div style={s.objectLine}><strong>Objet :</strong> {data.object}</div>}

      {/* TABLE */}
      <table style={s.table}>
        <thead>
          <tr>
            {settings.showCode && <th style={{ ...s.th, width: 52 }}>Code</th>}
            <th style={s.th}>Désignation</th>
            <th style={{ ...s.thC, width: 32 }}>Qté</th>
            <th style={{ ...s.thR, width: 75 }}>P.U (F)</th>
            <th style={{ ...s.thR, width: 80 }}>Montant (F)</th>
          </tr>
        </thead>
        <tbody>
          {isEmpty
            ? <tr><td colSpan={settings.showCode ? 5 : 4} style={{ ...s.td, textAlign: 'center', fontStyle: 'italic', color: '#9CA3AF', padding: '8px' }}>Aucun article ajouté</td></tr>
            : filledItems.map((it, i) => {
                const e = i % 2 === 1
                return (
                  <tr key={it.id || i}>
                    {settings.showCode && <td style={{ ...s.tdCode, ...(e ? s.even : {}) }}>{it.code || '—'}</td>}
                    <td style={{ ...s.td,  ...(e ? s.even : {}) }}>{it.desc || '—'}</td>
                    <td style={{ ...s.tdC, ...(e ? s.even : {}) }}>{it.qty || 1}</td>
                    <td style={{ ...s.tdR, ...(e ? s.even : {}) }}>{it.pu ? Number(it.pu).toLocaleString('fr-FR') : '—'}</td>
                    <td style={{ ...s.tdR, fontWeight: 600, ...(e ? s.even : {}) }}>{it.pu ? Number(calcItem(it)).toLocaleString('fr-FR') : '—'}</td>
                  </tr>
                )
              })
          }
          {settings.aib && (
            <tr>
              <td colSpan={settings.showCode ? 4 : 3} style={s.tdAib}>AIB (1%)</td>
              <td style={{ ...s.tdR, background: '#FFFBEB', fontSize: 8.5, color: '#92400E', borderBottom: '1px solid #EFEFEF' }}>{Number(aibAmt).toLocaleString('fr-FR')}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* TOTAUX */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <div style={s.totalsBox}>
          <div style={s.tRow}><span>Total HT</span><span style={s.tVal}>{fmt(ht)}</span></div>
          {settings.aib && <div style={s.tRow}><span>AIB (1%)</span><span style={s.tVal}>{fmt(aibAmt)}</span></div>}
          {settings.tva && <div style={s.tRow}><span>TVA (18%)</span><span style={s.tVal}>{fmt(tvaAmt)}</span></div>}
          <div style={s.tRowGrand}><span>TOTAL TTC</span><span style={s.tValGrand}>{fmt(ttc)}</span></div>
        </div>
      </div>

      {/* FOOTER : Modalités à gauche, Signature à droite */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 6, borderTop: '1px solid #E8E4D9' }}>
        <div>
          <div style={s.payTitle}>Modalités de paiement</div>
          <div style={s.payText}>{data.paymentTerms || (docType === 'proforma' ? '70% à la commande · 30% à la livraison' : docType === 'commande' ? 'Paiement sous 30 jours à réception de la facture.' : 'Paiement à réception.')}</div>
          {data.note && <div style={{ ...s.payText, fontStyle: 'italic', marginTop: 2 }}>{data.note}</div>}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
          <div style={{ fontSize: 8.5, color: '#555', marginBottom: 50 }}>La Directrice Générale</div>
          <div style={{ width: 100, height: 1, background: '#0D1117', marginBottom: 3, marginLeft: 'auto' }} />
          <div style={{ fontSize: 9, fontWeight: 700, color: '#0D1117' }}>{data.sigName || 'CHAGOURY Malak'}</div>
        </div>
      </div>

    </div>
  )
}