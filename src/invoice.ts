
export interface Invoice {
  id: string
  companyId: string
  created: number
  client: {
    name: string
    address: string
  }
  amount: number
  status: 'open' | 'paid'
  deleted: boolean
}