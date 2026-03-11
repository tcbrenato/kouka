import { useState, useRef } from 'react'
import { Plus, Trash2, Download, Printer, RefreshCw } from 'lucide-react'
import DocPreview from '../components/DocPreview'
import { newItem, DEFAULT_SELLER, today, newDocNum, calcItem, calcTotals, fmt, DOC_LABELS } from '../utils'

const DOC_CONFIGS = {
  proforma: {
    clientLabel: 'Client',
    showValidity: true,
    showDueDate: false,
    defaultPayment: '70% à la commande · 30% à la livraison',
    sigDefault: 'Cellule Numérique Digital Creator',
  },
  commande: {
    clientLabel: 'Fournisseur',
    showValidity: false,
    showDueDate: false,
    defaultPayment: 'Paiement sous 30 jours à réception de la facture. Le numéro du bon de commande doit être inscrit sur la facture.',
    sigDefault: 'CHAGOURY Malak — Directrice Générale',
  },
  facture: {
    clientLabel: 'Client',
    showValidity: false,
    showDueDate: true,
    defaultPayment: 'Paiement à réception de la facture.',
    sigDefault: '',
  },
}

export default function DocumentForm({ docType, onBack }) {
  const cfg = DOC_CONFIGS[docType] || DOC_CONFIGS.facture
  const label = DOC_LABELS[docType]

  const [data, setData] = useState({
    sellerName: DEFAULT_SELLER.name,
    sellerAddress: DEFAULT_SELLER.address,
    sellerTel: DEFAULT_SELLER.tel,
    sellerEmail: DEFAULT_SELLER.email,
    sellerRCCM: DEFAULT_SELLER.rccm,
    sellerIFU: DEFAULT_SELLER.ifu,
    docNum: newDocNum(label.prefix),
    docDate: today(),
    validity: '15 jours',
    dueDate: '',
    clientName: '',
    clientAddress: '',
    clientTel: '',
    clientEmail: '',
    object: '',
    paymentTerms: cfg.defaultPayment,
    note: '',
    sigName: cfg.sigDefault,
  })

  const [items, setItems] = useState([newItem(), newItem(), newItem()])

  const [settings, setSettings] = useState({
    tva: true,
    aib: docType === 'commande',
    showCode: docType === 'commande',
  })

  const previewRef = useRef(null)
  const [exporting, setExporting] = useState(false)

  const setField = (k, v) => setData(d => ({ ...d, [k]: v }))
  const setItem = (id, k, v) => setItems(its => its.map(it => it.id === id ? { ...it, [k]: v } : it))
  const addItem = () => setItems(its => [...its, newItem()])
  const removeItem = (id) => setItems(its => its.filter(it => it.id !== id))
  const setSetting = (k, v) => setSettings(s => ({ ...s, [k]: v }))

  const { ht, aibAmt, tvaAmt, ttc } = calcTotals(items, settings.tva, settings.aib)

  const handlePDF = async () => {
    setExporting(true)
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const el = document.getElementById('doc-to-print')
      if (!el) { alert('Aperçu introuvable'); return }
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794,
      })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgW = pageW - 20
      const imgH = imgW * (canvas.height / canvas.width)
      if (imgH <= pageH - 20) {
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, imgW, imgH)
      } else {
        const pageImgH = ((pageH - 20) / imgH) * canvas.height
        let srcY = 0
        while (srcY < canvas.height) {
          if (srcY > 0) pdf.addPage()
          const sliceH = Math.min(pageImgH, canvas.height - srcY)
          const sc = document.createElement('canvas')
          sc.width = canvas.width
          sc.height = sliceH
          sc.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH)
          pdf.addImage(sc.toDataURL('image/png'), 'PNG', 10, 10, imgW, (sliceH / canvas.height) * imgH)
          srcY += sliceH
        }
      }
      pdf.save(`${data.docNum || 'document'}.pdf`)
    } catch (err) {
      alert('Erreur. Lance dabord dans le terminal :\nnpm install html2canvas jspdf')
    } finally {
      setExporting(false)
    }
  }

  const handlePrint = () => {
    const el = document.getElementById('doc-to-print')
    if (!el) return
    const styles = Array.from(document.styleSheets)
      .map(sheet => { try { return Array.from(sheet.cssRules).map(r => r.cssText).join('\n') } catch { return '' } })
      .join('\n')
    const win = window.open('', '_blank', 'width=900,height=700')
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="UTF-8"><title>${data.docNum}</title>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        ${styles}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 210mm; margin: 0; padding: 0; background: white; }
        body { transform-origin: top left; }
        @page { size: A4; margin: 8mm; }
        @media print { body { zoom: 75%; } }
      </style>
      </head><body>
      ${el.outerHTML}
      <script>
        window.onload = () => { setTimeout(() => { window.print(); window.close() }, 800) }
      <\/script>
      </body></html>`)
    win.document.close()
  }

  const resetForm = () => {
    if (window.confirm('Réinitialiser le formulaire ?')) {
      setItems([newItem(), newItem(), newItem()])
      setData(d => ({ ...d, clientName: '', clientAddress: '', clientTel: '', clientEmail: '', object: '', note: '', docNum: newDocNum(label.prefix) }))
    }
  }

  return (
    <div>
      <div className="breadcrumb no-print">
        <span style={{ cursor: 'pointer', color: 'var(--gold)' }} onClick={onBack}>Accueil</span>
        <span className="sep">›</span>
        <strong>{label.title}</strong>
      </div>

      <div className="form-layout">
        <div>
          <div className="form-panel">
            <h2>
              {docType === 'proforma' && '📄 '}
              {docType === 'commande' && '🛒 '}
              {docType === 'facture' && '🧾 '}
              {label.title}
            </h2>

            <div className="form-section">
              <div className="form-section-title">Informations du document</div>
              <div className="form-grid cols-3">
                <div className="form-group">
                  <label>Numéro</label>
                  <input value={data.docNum} onChange={e => setField('docNum', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="text" value={data.docDate} onChange={e => setField('docDate', e.target.value)} />
                </div>
                {cfg.showValidity && (
                  <div className="form-group">
                    <label>Validité</label>
                    <input value={data.validity} onChange={e => setField('validity', e.target.value)} />
                  </div>
                )}
                {cfg.showDueDate && (
                  <div className="form-group">
                    <label>Échéance</label>
                    <input type="text" value={data.dueDate} onChange={e => setField('dueDate', e.target.value)} placeholder="ex : 30 jours" />
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">{docType === 'commande' ? 'Acheteur (vous)' : 'Votre société'}</div>
              <div className="form-grid cols-1">
                <div className="form-group">
                  <label>Raison sociale</label>
                  <input value={data.sellerName} onChange={e => setField('sellerName', e.target.value)} />
                </div>
              </div>
              <div className="form-grid" style={{ marginTop: '0.75rem' }}>
                <div className="form-group">
                  <label>Adresse</label>
                  <input value={data.sellerAddress} onChange={e => setField('sellerAddress', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input value={data.sellerTel} onChange={e => setField('sellerTel', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input value={data.sellerEmail} onChange={e => setField('sellerEmail', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>IFU</label>
                  <input value={data.sellerIFU} onChange={e => setField('sellerIFU', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>RCCM</label>
                  <input value={data.sellerRCCM} onChange={e => setField('sellerRCCM', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">{cfg.clientLabel}</div>
              <div className="form-grid cols-1">
                <div className="form-group">
                  <label>Raison sociale / Nom</label>
                  <input value={data.clientName} onChange={e => setField('clientName', e.target.value)} placeholder={docType === 'commande' ? 'ex : STE LA ROCHE S.A.R.L' : 'Nom du client'} />
                </div>
              </div>
              <div className="form-grid" style={{ marginTop: '0.75rem' }}>
                <div className="form-group">
                  <label>Adresse</label>
                  <input value={data.clientAddress} onChange={e => setField('clientAddress', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input value={data.clientTel} onChange={e => setField('clientTel', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input value={data.clientEmail} onChange={e => setField('clientEmail', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Objet / Référence</label>
                  <input value={data.object} onChange={e => setField('object', e.target.value)} placeholder="Objet de la commande..." />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Articles / Prestations</div>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <label className="toggle-row">
                  <span className="toggle">
                    <input type="checkbox" checked={settings.tva} onChange={e => setSetting('tva', e.target.checked)} />
                    <span className="toggle-track"></span>
                  </span>
                  TVA 18%
                </label>
                <label className="toggle-row">
                  <span className="toggle">
                    <input type="checkbox" checked={settings.aib} onChange={e => setSetting('aib', e.target.checked)} />
                    <span className="toggle-track"></span>
                  </span>
                  AIB 1%
                </label>
                <label className="toggle-row">
                  <span className="toggle">
                    <input type="checkbox" checked={settings.showCode} onChange={e => setSetting('showCode', e.target.checked)} />
                    <span className="toggle-track"></span>
                  </span>
                  Code article
                </label>
              </div>

              <div className="items-table-wrapper">
                <table className="items-table">
                  <thead>
                    <tr>
                      {settings.showCode && <th style={{ width: 90 }}>Code</th>}
                      <th>Désignation</th>
                      <th style={{ width: 60 }}>Qté</th>
                      <th style={{ width: 110 }}>Prix unit. (F)</th>
                      <th style={{ width: 110 }}>Montant (F)</th>
                      <th style={{ width: 36 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr key={it.id}>
                        {settings.showCode && (
                          <td>
                            <input value={it.code} onChange={e => setItem(it.id, 'code', e.target.value)} placeholder="Code" />
                          </td>
                        )}
                        <td>
                          <input value={it.desc} onChange={e => setItem(it.id, 'desc', e.target.value)} placeholder="Description de l'article..." />
                        </td>
                        <td>
                          <input type="number" value={it.qty} onChange={e => setItem(it.id, 'qty', e.target.value)} min="0" style={{ textAlign: 'center' }} />
                        </td>
                        <td>
                          <input type="number" value={it.pu} onChange={e => setItem(it.id, 'pu', e.target.value)} placeholder="0" style={{ textAlign: 'right' }} />
                        </td>
                        <td>
                          <input className="amount-cell" readOnly value={it.pu ? Number(calcItem(it)).toLocaleString('fr-FR') : ''} placeholder="—" style={{ textAlign: 'right' }} />
                        </td>
                        <td>
                          <button className="btn-remove-row" onClick={() => removeItem(it.id)} disabled={items.length === 1}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button className="btn-add-row" onClick={addItem}>
                <Plus size={15} /> Ajouter une ligne
              </button>

              <div className="totals-box">
                <div className="total-row"><span>Sous-total HT</span><span>{fmt(ht)}</span></div>
                {settings.aib && <div className="total-row"><span>AIB (1%)</span><span>{fmt(aibAmt)}</span></div>}
                {settings.tva && <div className="total-row"><span>TVA (18%)</span><span>{fmt(tvaAmt)}</span></div>}
                <div className="total-row grand"><span>TOTAL TTC</span><span>{fmt(ttc)}</span></div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Informations complémentaires</div>
              <div className="form-grid cols-1">
                <div className="form-group">
                  <label>Modalités de paiement</label>
                  <textarea rows={2} value={data.paymentTerms} onChange={e => setField('paymentTerms', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Note / Remarque</label>
                  <textarea rows={2} value={data.note} onChange={e => setField('note', e.target.value)} placeholder="Note additionnelle..." />
                </div>
                <div className="form-group">
                  <label>Nom signataire</label>
                  <input value={data.sigName} onChange={e => setField('sigName', e.target.value)} placeholder="Nom et titre..." />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" onClick={handlePDF} disabled={exporting}>
                <Download size={16} /> {exporting ? 'Génération...' : 'Télécharger PDF'}
              </button>
              <button className="btn btn-dark" onClick={handlePrint}>
                <Printer size={16} /> Imprimer
              </button>
              <button className="btn btn-ghost" onClick={resetForm}>
                <RefreshCw size={14} /> Réinitialiser
              </button>
            </div>
          </div>
        </div>

        <div className="preview-panel no-print">
          <div className="preview-panel-header">
            <h3>Aperçu du document</h3>
          </div>
          <DocPreview
            ref={previewRef}
            docType={docType}
            data={data}
            items={items}
            settings={settings}
          />
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
            L'aperçu se met à jour en temps réel
          </p>
        </div>
      </div>
    </div>
  )
}