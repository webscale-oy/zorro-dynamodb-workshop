import { Invoice } from '../src/invoice'
import { Chance } from 'chance'
import { InvoiceService } from '../src/invoice.service'
import { invoiceService } from '../src/app'
import { DynamoDB } from 'aws-sdk'
const change = new Chance()

export function newInvoice(companyId: string): Partial<Invoice> {
  return {
    companyId,
    status: 'open',
    amount: change.integer({min: 0, max: 20000}),
    client: {
      name: change.name(),
      address: change.address()
    },
    created: change.timestamp()
  }
}

export async function generateTestData(companyId: string, service: InvoiceService) {
  const invoices: Partial<Invoice>[] = []
  for (let i = 0; i < 20; i++) {
    invoices.push(newInvoice(companyId))
  }

  return Promise.all(invoices.map(invoice => invoiceService.createInvoice(companyId, invoice)))
}

export async function cleanUp() {

  const dynamo = new DynamoDB.DocumentClient({ endpoint: 'http://dynamo:8000' })
  const { Items } = await dynamo.scan({ TableName: 'invoices' }).promise()

  const deleteResults = Items!.map( (Item) => {
    return dynamo.delete({ TableName: 'invoices', Key: { companyId: Item.companyId, id: Item.id } }).promise()
  })

  await Promise.all(deleteResults)
  console.log(`Deleted ${Items!.length} entries from dynamo`)
}
