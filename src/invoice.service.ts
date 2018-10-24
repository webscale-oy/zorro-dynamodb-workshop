import { DynamoDB } from 'aws-sdk'
import { v4 } from 'uuid'
import { Invoice } from './invoice'

const INVOICES = 'invoices'
const INVOICES_DATE_INDEX = 'invoices-date-index'

export class InvoiceService {
  private dynamo: DynamoDB.DocumentClient
  readonly config: {}

  constructor( endpoint = 'http://dynamo:8000') {
    this.config = endpoint ? { endpoint } : {}
    this.dynamo = new DynamoDB.DocumentClient({... this.config})
  }

  // 1
  public async getInvoices(companyId: number): Promise<Invoice[]> {
    const { Items } = await this.dynamo.query({
      TableName: INVOICES,
      IndexName: INVOICES_DATE_INDEX,
      KeyConditionExpression: 'companyId = :companyId',
      ExpressionAttributeValues: {
        ':companyId': companyId
      },
      ScanIndexForward: false
    }).promise()
    return Items as Invoice[]
  }

  // 2
  public async createInvoice(companyId: string, invoice: Partial<Invoice>): Promise<Invoice> {
    const newInvoice = Object.assign({ created: Date.now() }, invoice, {companyId, id: v4()})
    await this.dynamo.put({
      TableName: INVOICES,
      Item: newInvoice,
      ReturnValues: 'NONE'
    }).promise()
    return newInvoice as Invoice
  }

  // 3
  public async markInvoicePaid(companyId: string, id: string): Promise<Invoice> {
    const { Attributes } = await this.dynamo.update({
      TableName: INVOICES,
      Key: { companyId, id },
      UpdateExpression: 'set #status = :status',
      ConditionExpression: 'attribute_not_exists(deleted)',
      ExpressionAttributeValues: { ':status': 'paid' },
      ExpressionAttributeNames: { '#status': 'status' },
      ReturnValues: 'ALL_NEW'
    }).promise()
    return Attributes as Invoice
  }

  // 4
  public async getPaidInvoices(companyId: number): Promise<Invoice[]> {
    const { Items } = await this.dynamo.query({
      TableName: INVOICES,
      IndexName: INVOICES_DATE_INDEX,
      KeyConditionExpression: 'companyId = :companyId',
      FilterExpression: '#status = :status',
      ExpressionAttributeValues: {
        ':companyId': companyId,
        ':status': 'paid'
      },
      ExpressionAttributeNames: {
        '#status': 'status'
      }
    }).promise()
    return Items as Invoice[]
  }

  // 5
  public async updateInvoice(companyId: string, id: string,  invoice: Invoice): Promise<Invoice> {
    const { Attributes } = await this.dynamo.put({
      TableName: INVOICES,
      Item: invoice,
      ConditionExpression: 'companyId = :companyId AND id = :id #status = :status AND attribute_not_exists(deleted)',
      ExpressionAttributeValues: { ':status': 'open', ':companyId': companyId, ':id': id },
      ExpressionAttributeNames: { '#status': 'status' },
      ReturnValues: 'ALL_NEW'
    }).promise()
    return Attributes as Invoice
  }

  // 6
  public async deleteInvoice(companyId: string, id: string): Promise<Invoice> {
    const { Attributes } = await this.dynamo.update({
      TableName: INVOICES,
      Key: { companyId, id },
      UpdateExpression: 'set #status = :newStatus',
      ConditionExpression: '#status <> :status',
      ExpressionAttributeValues: { ':status': 'paid', ':newStatus': 'deleted' },
      ExpressionAttributeNames: { '#status': 'status' },
      ReturnValues: 'ALL_NEW'
    }).promise()
    return Attributes as Invoice
  }

  public async createTable() {
    console.log('Boostrapping Invoice table')
    try {
      const dbConfg = Object.assign({}, this.config) // Clone config as dynamoclient modifies the object
      const DB = new DynamoDB(dbConfg)
      const { TableNames } = await DB.listTables().promise()
      if (TableNames!.indexOf(INVOICES) < 0) {
        console.log('Create invoice table')

        await new Promise( resolve => DB.createTable({
          TableName: INVOICES,
          AttributeDefinitions: [
            { AttributeName: 'companyId', AttributeType: 'S' },
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'created', AttributeType: 'N' }
          ],
          KeySchema: [
            { AttributeName: 'companyId', KeyType: 'HASH' },
            { AttributeName: 'id', KeyType: 'RANGE' }
          ],
          LocalSecondaryIndexes: [
            {
              IndexName: INVOICES_DATE_INDEX,
              KeySchema: [
                { AttributeName: "companyId",  KeyType: "HASH" },
                { AttributeName: "created", KeyType: "RANGE" }
              ],
              Projection: {
                ProjectionType: "ALL"
              }
            }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        }, resolve))

      } else {
        console.log('Found dynamo table - no need to create new one')
      }
    } catch (err) {
      console.log('Bootstrapping dynamoDB table  failed', err)
    }
  }
}
