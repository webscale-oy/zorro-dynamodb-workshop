import bodyparser from 'body-parser'
import express from 'express'

import { InvoiceService } from './invoice.service'
const invoiceService = new InvoiceService()
const app = express()

app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json())

app.get('/invoices/:companyId', async (req, res) => {
  const { companyId } = req.params
  const invoices = await invoiceService.getInvoices(companyId)
  res.json(invoices)
})

app.get('/invoices/:companyId/paid', async(req, res) => {
  const { companyId } = req.params
  const invoices = await invoiceService.getPaidInvoices(companyId)
  res.json(invoices)
})

app.post('/invoices/:companyId', async (req, res) => {
  const { companyId } = req.params
  const invoice = await invoiceService.createInvoice(companyId, req.body)
  res.json(invoice)
})

app.put('/invoices/:companyId/:invoiceId/paid', async (req, res) => {
  const { companyId, invoiceId } = req.params
  const invoice = await invoiceService.markInvoicePaid(companyId, invoiceId)
  res.json(invoice)
})

app.put('/invoices/:companyId/:invoiceId', async (req, res) => {
  const { companyId, invoiceId } = req.params
  const invoice = await invoiceService.updateInvoice(companyId, invoiceId, req.body)
  res.json(invoice)
})
app.delete('/invoices/:companyId/:invoiceId', async (req, res) => {
  const { companyId, invoiceId } = req.params
  const invoice = await invoiceService.deleteInvoice(companyId, invoiceId)
  res.json(invoice)
})
export { app, invoiceService }
