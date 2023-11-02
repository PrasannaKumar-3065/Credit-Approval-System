const Pool = require('pg').Pool

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    dialect: 'postgres',
    port: process.env.POSTGRES_PORT
})


pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
  })
  const createTables = async () =>{
    await pool.query("CREATE TABLE IF NOT EXISTS customer_data (customer_id INTEGER PRIMARY KEY,first_name VARCHAR,last_name VARCHAR,age INTEGER,phone_number BIGINT,monthly_salary INTEGER,approved_limit INTEGER);")
    await pool.query("create table if not exists loan_data(customer_id integer references customer_data(customer_id),loan_id integer,loan_amount integer,tenure integer,interest_rate numeric(4,2),monthly_repayment integer,EMIs_paid_on_time integer,start_date date,end_date date);")

  }

  const readFile = (filepath)=>{
    const workbook =  XLSX.readFile(filepath)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet,{
        defval: null,
        raw: false, 
        dateNF: 'm/d/yy',
        cellDates: true,
    })
    return data
  }
  const ingestionData = async () =>{
    try {
        let data = readFile('customer_data.xlsx')
        let count = 0
        data.forEach(async element => {
            const query = {
                text: 'INSERT INTO customer_data (customer_id, first_name, last_name, age, phone_number, monthly_salary, approved_limit) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                values: [element.customer_id, element.first_name, element.last_name, element.age, element.phone_number, element.monthly_salary, element.approved_limit],
              }
            await pool.query(query) 
        })
        data = readFile('loan_data.xlsx')
        data.forEach(element => {
          const startDate =
            element.start_date && !isNaN(Date.parse(element.start_date))
              ? new Date(element.start_date).toISOString().split('T')[0]
              : null
          const endDate =
            element.end_date && !isNaN(Date.parse(element.end_date))
              ? new Date(element.end_date).toISOString().split('T')[0]
              : null
    
          const query = {
            text:
              'INSERT INTO loan_data (customer_id, loan_id, loan_amount, tenure, interest_rate, monthly_repayment, EMIs_paid_on_time, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            values: [
              element.customer_id,
              element.loan_id,
              element.loan_amount,
              element.tenure,
              element.interest_rate,
              element.monthly_payment,
              element["EMIs paid on Time"],
              startDate, 
              endDate,   
            ],
          }
    
          pool.query(query)
          count++
        })
        console.log("Datas Ingested.")
    }catch(err){
        console.log("Files Already Ingested.")
    }
  }
  createTables()
  module.exports = pool;
