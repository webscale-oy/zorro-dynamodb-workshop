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

app.get('/invoices/:companyId/paid', async (req, res, next) => {
  const { companyId } = req.params
  try {
    const invoices = await invoiceService.getPaidInvoices(companyId)
    res.json(invoices)
  } catch (err) {
    next(err)
  }
})


app.post('/invoices/:companyId', async (req, res, next) => {
  const { companyId } = req.params
  try {
    const invoice = await invoiceService.createInvoice(companyId, req.body)
    res.json(invoice)
  } catch (err) {
    next(err)
  }
})

app.put('/invoices/:companyId/:invoiceId/paid', async (req, res, next) => {
  const { companyId, invoiceId } = req.params
  try {
    const invoice = await invoiceService.markInvoicePaid(companyId, invoiceId)
    res.json(invoice)
  } catch (err) {
    next(err)
  }
})

app.put('/invoices/:companyId/:invoiceId', async (req, res, next) => {
  const { companyId, invoiceId } = req.params
  try {
    const invoice = await invoiceService.updateInvoice(companyId, invoiceId, req.body)
    res.json(invoice)
  } catch (err) {
    next(err)
  }
})
app.delete('/invoices/:companyId/:invoiceId', async (req, res, next) => {
  const { companyId, invoiceId } = req.params
  try {
    const invoice = await invoiceService.deleteInvoice(companyId, invoiceId)
    res.json(invoice)
  } catch (err) {
    next(err)
  }
})

app.use((err, req, res, next) => {
  console.log(`Error ${err.message}`, err)
  if (err.code === 'ConditionalCheckFailedException') {
    res.status(400).send('Invalid input')
  } else {
    res.status(500).send('Ooops something went wrong')
  }
})
export { app, invoiceService }
