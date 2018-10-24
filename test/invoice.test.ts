import { agent } from 'supertest'
import { app, invoiceService } from '../src/app'
import { cleanUp, generateTestData, newInvoice } from './helper'
import { Invoice } from '../src/invoice'
const server = agent(app)

const companyA = 'company-A'
const companyB = 'company-B'

describe('Invoice - API', () => {
  beforeAll(async () => {
    await invoiceService.createTable()
    await generateTestData(companyA, invoiceService)
    await generateTestData(companyB, invoiceService)
  })

  afterAll(async () => {
    await cleanUp()
  })


  describe('Test POST /invoices', () => {
    it('should create invoice', () => server
      .post(`/invoices/${companyA}`)
      .send(newInvoice(companyA))
      .expect(200)
      .then(({ body }) => {
        expect(body).toHaveProperty('companyId', companyA)
      })
    )
  })

  describe('Test GET /invoices', () => {
    it('should get invoice in order', () => server
      .get(`/invoices/${companyA}`)
      .send(newInvoice(companyA))
      .expect(200)
      .then(({ body }) => {
        const invoices = body as Invoice[]
        expect(invoices.length).toBeGreaterThan(5)
        expect(invoices.every((current, index) => index > 0 ? current.created < invoices[index - 1].created : true))
          .toBeTruthy()
      })
    )
  })

  describe('Test GET /invoices PAID', () => {
    let testInvoice1, testInvoice2

    beforeAll(async () => {
      const invoice1 = Object.assign({}, newInvoice(companyA), {status: 'paid'})
      const invoice2 = Object.assign({}, newInvoice(companyA), {status: 'paid'})
      testInvoice1 = await invoiceService.createInvoice(companyA, invoice1)
      testInvoice2 = await invoiceService.createInvoice(companyA, invoice2)
    })

    it('should get all PAID invoices', () => server
      .get(`/invoices/${companyA}/paid`)
      .expect(200)
      .then(({ body }) => {
        const invoices = body as Invoice[]
        expect(invoices.length).toEqual(2)
      })
    )
  })

  describe('Test PUT /invoices PAID', () => {
    let testInvoice1: Invoice

    beforeAll(async () => {
      testInvoice1 = await invoiceService.createInvoice(companyA, newInvoice(companyA))
    })

    it('should updated invoice as PAID', () => server
      .put(`/invoices/${companyA}/${testInvoice1.id}/paid`)
      .send(testInvoice1)
      .expect(200)
      .then(({ body }) => {
        expect(body).toHaveProperty('status', 'paid')
      })
    )
    it('paid invoices should contain the updated', () => server
      .get(`/invoices/${companyA}/paid`)
      .send(testInvoice1)
      .expect(200)
      .then(({ body }) => {
        const paid = body.find(i => i.id === testInvoice1.id)
        expect(paid).not.toBeUndefined()
        expect(paid).toHaveProperty('status', 'paid')
      })
    )
  })
})
