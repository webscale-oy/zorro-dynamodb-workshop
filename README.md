# Zorro invoicing API
This invoicing API for Zorro Inc. Invoicing service for all the just and brave.

## API

* **GET /invoices/:companyId** - Gets all the invoices for the given company latest first 
* **GET /invoices/:companyId/paid** - Gets all PAID invoices for the given company  
* **POST /invoices/:companyId** - Creates new OPEN invoice
* **DELETE /invoices/:companyId/:invoiceId** - Deletes given invoice
* **PUT /invoice/:companyId/:invoiceId** - Updates given invoie
* **PUT /invoice/:companyId/:invoiceId/paid** - Marks invoice paid

## Running

To run the test suite

```bash
docker-compose up
```

To run the live server

```bash
docker-compose -f docker-compose-run.yml -f docker-compose.yml up
```

### Debugging
The dynamoDB admin can found at **http://localhost:5555**
The invoice api is running at **http://localhost:7777**
