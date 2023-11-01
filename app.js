const express = require('express')

const XLSX = require('xlsx')
require('dotenv').config()
const app = express()
const pool = require('./Postgres/db')
const bodyParser = require('body-parser')
const ingestionRoutes = require('./Routes/IngestionRoutes')
const userRoutes = require('./Routes/UserRoutes')
const creditRoutes = require('./Routes/CreditsRoutes')
const loanRoutes = require('./Routes/LoanRoutes')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


app.post('/customerdata',ingestionRoutes.customerDataIngestion)

app.post('/loandata', ingestionRoutes.loanDataIngestion)

  app.post('/register',userRoutes.userRegister)

  app.post('/checkeligibility', creditRoutes.checkeligibility)

  app.post('/create-loan', loanRoutes.createLoan)

  app.post('/view-loan/:loan_id', loanRoutes.viewLoan)

  app.post("/view-statement/:customer_id/:loan_id",loanRoutes.viewLoanStatement)

const server = app.listen(3030)

