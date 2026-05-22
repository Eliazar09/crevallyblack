import jsPDF from 'jspdf'
import type { CartItem } from '../hooks/useCart'
import type { CustomerData } from './whatsapp'

export function generateInvoicePDF(items: CartItem[], customer: CustomerData): void {
  const doc = new jsPDF()
  const date = new Date().toLocaleDateString('es-VE')
  const invoiceNum = `GL-${Date.now().toString().slice(-6)}`

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(26, 60, 10)
  doc.text('GreenLife', 20, 24)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('Bienestar Natural desde Venezuela', 20, 31)
  doc.text(`Factura: ${invoiceNum}`, 20, 38)
  doc.text(`Fecha: ${date}`, 20, 44)

  doc.setDrawColor(212, 184, 106)
  doc.setLineWidth(0.8)
  doc.line(20, 50, 190, 50)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(15, 36, 16)
  doc.text('DATOS DEL CLIENTE', 20, 60)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.text(`Nombre: ${customer.nombre}`, 20, 68)
  doc.text(`Teléfono: ${customer.telefono}`, 20, 75)
  doc.text(`Ciudad: ${customer.ciudad}`, 20, 82)

  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.4)
  doc.line(20, 102, 190, 102)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(15, 36, 16)
  doc.text('PRODUCTOS', 20, 112)

  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('Producto', 20, 120)
  doc.text('Cant.', 130, 120)
  doc.text('Precio', 152, 120)
  doc.text('Subtotal', 172, 120)

  doc.line(20, 123, 190, 123)

  let y = 130
  let total = 0

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(40, 40, 40)

  items.forEach((item) => {
    const sub = item.price * item.quantity
    total += sub
    const label = item.selectedOption ? `${item.name} (${item.selectedOption})` : item.name
    const lines = doc.splitTextToSize(label, 105)
    doc.text(lines, 20, y)
    doc.text(String(item.quantity), 134, y)
    doc.text(`$${item.price}`, 152, y)
    doc.text(`$${sub}`, 172, y)
    y += lines.length > 1 ? 14 : 9
    if (y > 260) {
      doc.addPage()
      y = 20
    }
  })

  doc.setDrawColor(212, 184, 106)
  doc.setLineWidth(0.8)
  doc.line(20, y + 2, 190, y + 2)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(26, 60, 10)
  doc.text(`TOTAL: $${total}`, 172, y + 12, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('Gracias por confiar en GreenLife. Para consultas: +58 412 859 0616', 20, y + 22)

  doc.save(`factura-greenlife-${invoiceNum}.pdf`)
}
