import jsPDF from 'jspdf'
import type { Case } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function generateAssistancePDF(case_: Case) {
  const doc = new jsPDF()
  const margin = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 30

  // Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text('COMPROVANTE DE ASSISTÊNCIA TÉCNICA', pageWidth / 2, y, { align: 'center' })

  y += 4
  doc.setLineWidth(1)
  doc.setDrawColor(30, 30, 30)
  doc.line(margin, y + 4, pageWidth - margin, y + 4)

  y += 14
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(
    `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    pageWidth - margin,
    y,
    { align: 'right' },
  )

  // Client section
  y += 14
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 60, 60)
  doc.text('DADOS DO CLIENTE', margin, y)
  y += 4
  doc.setLineWidth(0.3)
  doc.setDrawColor(180, 180, 180)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 30, 30)
  doc.text(`Nome:`, margin, y)
  doc.setFont('helvetica', 'bold')
  doc.text(case_.client_name, margin + 15, y)

  if (case_.client_phone) {
    y += 8
    doc.setFont('helvetica', 'normal')
    doc.text(`Telefone:`, margin, y)
    doc.setFont('helvetica', 'bold')
    doc.text(case_.client_phone, margin + 23, y)
  }

  if (case_.client_email) {
    y += 8
    doc.setFont('helvetica', 'normal')
    doc.text(`E-mail:`, margin, y)
    doc.setFont('helvetica', 'bold')
    doc.text(case_.client_email, margin + 18, y)
  }

  // Product section
  y += 16
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 60, 60)
  doc.text('DADOS DO PRODUTO', margin, y)
  y += 4
  doc.setLineWidth(0.3)
  doc.setDrawColor(180, 180, 180)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  doc.setFontSize(11)
  doc.setTextColor(30, 30, 30)
  if (case_.product_name) {
    doc.setFont('helvetica', 'normal')
    doc.text(`Produto:`, margin, y)
    doc.setFont('helvetica', 'bold')
    doc.text(case_.product_name, margin + 22, y)
    y += 8
  }

  if (case_.shopify_order) {
    doc.setFont('helvetica', 'normal')
    doc.text(`Nº Pedido:`, margin, y)
    doc.setFont('helvetica', 'bold')
    doc.text(case_.shopify_order, margin + 26, y)
    y += 8
  }

  // Cause section
  if (case_.cause) {
    y += 8
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 60, 60)
    doc.text('MOTIVO DO ENVIO', margin, y)
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
  doc.text('DATAS', margin, y)
  y += 4
  doc.setLineWidth(0.3)
  doc.setDrawColor(180, 180, 180)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 30, 30)
  doc.text(
    `Data de entrada: ${format(new Date(case_.created_at), 'dd/MM/yyyy', { locale: ptBR })}`,
    margin,
    y,
  )
  y += 8
  doc.text(`Data de saída: _________________________________`, margin, y)

  // Signature section
  y += 24
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 60, 60)
  doc.text('ASSINATURAS', margin, y)
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
  doc.text('Assinatura do Cliente', margin + sigWidth / 2, y, { align: 'center' })
  doc.text(
    'Assinatura do Responsável',
    pageWidth - margin - sigWidth / 2,
    y,
    { align: 'center' },
  )

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('Caderninho Digital — CRM Pessoal', pageWidth / 2, pageHeight - 10, {
    align: 'center',
  })

  const filename = `comprovante_${case_.client_name.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(case_.created_at), 'ddMMyyyy')}.pdf`
  doc.save(filename)
}
