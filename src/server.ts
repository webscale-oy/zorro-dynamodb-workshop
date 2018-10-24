import { app, invoiceService } from './app'

invoiceService.createTable()
app.listen(9000, () => console.log('Zorro api running'))