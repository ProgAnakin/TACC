import jsPDF from 'jspdf'
import type { Case } from '@/types'
import { format } from 'date-fns'
import { ptBR, it, enUS } from 'date-fns/locale'

export type PdfLocale = 'en' | 'it' | 'pt'

interface PdfStrings {
  title: string
  generatedOn: string
  clientSection: string
  name: string
  phone: string
  email: string
  productSection: string
  product: string
  orderNumber: string
  reasonSection: string
  datesSection: string
  entryDate: string
  exitDate: string
  signaturesSection: string
  clientSignature: string
  responsibleSignature: string
  footer: string
}

const STRINGS: Record<PdfLocale, PdfStrings> = {
  en: {
    title: 'TECHNICAL SERVICE RECEIPT',
    generatedOn: 'Generated on',
    clientSection: 'CLIENT DETAILS',
    name: 'Name:',
    phone: 'Phone:',
    email: 'Email:',
    productSection: 'PRODUCT DETAILS',
    product: 'Product:',
    orderNumber: 'Order #:',
    reasonSection: 'REASON FOR SERVICE',
    datesSection: 'DATES',
    entryDate: 'Entry date',
    exitDate: 'Exit date',
    signaturesSection: 'SIGNATURES',
    clientSignature: 'Client Signature',
    responsibleSignature: 'Responsible Signature',
    footer: 'Caderninho Digital — Personal CRM',
  },
  it: {
    title: 'RICEVUTA DI ASSISTENZA TECNICA',
    generatedOn: 'Generato il',
    clientSection: 'DATI CLIENTE',
    name: 'Nome:',
    phone: 'Telefono:',
    email: 'Email:',
    productSection: 'DATI PRODOTTO',
    product: 'Prodotto:',
    orderNumber: 'N° Ordine:',
    reasonSection: 'MOTIVO DELL\'INVIO',
    datesSection: 'DATE',
    entryDate: 'Data di ingresso',
    exitDate: 'Data di uscita',
    signaturesSection: 'FIRME',
    clientSignature: 'Firma del Cliente',
    responsibleSignature: 'Firma del Responsabile',
    footer: 'Caderninho Digital — CRM Personale',
  },
  pt: {
    title: 'COMPROVANTE DE ASSISTÊNCIA TÉCNICA',
    generatedOn: 'Gerado em',
    clientSection: 'DADOS DO CLIENTE',
    name: 'Nome:',
    phone: 'Telefone:',
    email: 'E-mail:',
    productSection: 'DADOS DO PRODUTO',
    product: 'Produto:',
    orderNumber: 'Nº Pedido:',
    reasonSection: 'MOTIVO DO ENVIO',
    datesSection: 'DATAS',
    entryDate: 'Data de entrada',
    exitDate: 'Data de saída',
    signaturesSection: 'ASSINATURAS',
    clientSignature: 'Assinatura do Cliente',
    responsibleSignature: 'Assinatura do Responsável',
    footer: 'Caderninho Digital — CRM Pessoal',
  },
}

const LOCALES = { en: enUS, it: it, pt: ptBR }

export function generateAssistancePDF(case_: Case, locale: PdfLocale = 'en') {
  const t = STRINGS[locale]
  const dateLocale = LOCALES[locale]
  const dateFormat = locale === 'en' ? 'MM/dd/yyyy' : 'dd/MM/yyyy'
  const timeJoiner = locale === 'en' ? 'at' : locale === 'it' ? 'alle' : 'às'

  const doc = new jsPDF()
  const margin = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 30

  // Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text(t.title, pageWidth / 2, y, { align: 'center' })

  y += 4
  doc.setLineWidth(1)
  doc.setDrawColor(30, 30, 30)
  doc.line(margin, y + 4, pageWidth - margin, y + 4)

  y += 14
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(
    `${t.generatedOn}: ${format(new Date(), `${dateFormat} '${timeJoiner}' HH:mm`, { locale: dateLocale })}`,
    pageWidth - margin,
    y,
    { align: 'right' },
  )

  // Client section
  y += 14
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 60, 60)
  doc.text(t.clientSection, margin, y)
  y += 4
  doc.setLineWidth(0.3)
  doc.setDrawColor(180, 180, 180)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 30, 30)
  doc.text(t.name, margin, y)
  doc.setFont('helvetica', 'bold')
  doc.text(case_.client_name, margin + 25, y)

  if (case_.client_phone) {
    y += 8
    doc.setFont('helvetica', 'normal')
    doc.text(t.phone, margin, y)
    doc.setFont('helvetica', 'bold')
    doc.text(case_.client_phone, margin + 25, y)
  }

  if (case_.client_email) {
    y += 8
    doc.setFont('helvetica', 'normal')
    doc.text(t.email, margin, y)
    doc.setFont('helvetica', 'bold')
    doc.text(case_.client_email, margin + 25, y)
  }

  // Product section
  y += 16
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 60, 60)
  doc.text(t.productSection, margin, y)
  y += 4
  doc.setLineWidth(0.3)
  doc.setDrawColor(180, 180, 180)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  doc.setFontSize(11)
  doc.setTextColor(30, 30, 30)
  if (case_.product_name) {
    doc.setFont('helvetica', 'normal')
    doc.text(t.product, margin, y)
    doc.setFont('helvetica', 'bold')
    doc.text(case_.product_name, margin + 30, y)
    y += 8
  }

  if (case_.shopify_order) {
    doc.setFont('helvetica', 'normal')
    doc.text(t.orderNumber, margin, y)
    doc.setFont('helvetica', 'bold')
    doc.text(case_.shopify_order, margin + 30, y)
    y += 8
  }

  // Cause section
  if (case_.cause) {
    y += 8
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 60, 60)
    doc.text(t.reasonSection, margin, y)
    y += 4
    doc.setLineWidth(0.3)
    doc.setDrawColor(180, 180, 180)
    doc.line(margin, y, pageWidth - margin, y)
    y += 8

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 30, 30)
    const causeLines = doc.splitTextToSize(case_.cause, pageWidth - margin * 2)
    doc.text(causeLines, margin, y)
    y += causeLines.length * 6 + 4
  }

  // Dates
  y += 8
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 60, 60)
  doc.text(t.datesSection, margin, y)
  y += 4
  doc.setLineWidth(0.3)
  doc.setDrawColor(180, 180, 180)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 30, 30)
  doc.text(
    `${t.entryDate}: ${format(new Date(case_.created_at), dateFormat, { locale: dateLocale })}`,
    margin,
    y,
  )
  y += 8
  doc.text(`${t.exitDate}: _________________________________`, margin, y)

  // Signature section
  y += 24
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 60, 60)
  doc.text(t.signaturesSection, margin, y)
  y += 4
  doc.setLineWidth(0.3)
  doc.setDrawColor(180, 180, 180)
  doc.line(margin, y, pageWidth - margin, y)
  y += 24

  // Signature lines
  doc.setLineWidth(0.5)
  doc.setDrawColor(80, 80, 80)
  const sigWidth = 75
  doc.line(margin, y, margin + sigWidth, y)
  doc.line(pageWidth - margin - sigWidth, y, pageWidth - margin, y)

  y += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.text(t.clientSignature, margin + sigWidth / 2, y, { align: 'center' })
  doc.text(t.responsibleSignature, pageWidth - margin - sigWidth / 2, y, { align: 'center' })

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(t.footer, pageWidth / 2, pageHeight - 10, { align: 'center' })

  const prefix = locale === 'en' ? 'receipt' : locale === 'it' ? 'ricevuta' : 'comprovante'
  const filename = `${prefix}_${case_.client_name.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(case_.created_at), 'ddMMyyyy')}.pdf`
  doc.save(filename)
}
