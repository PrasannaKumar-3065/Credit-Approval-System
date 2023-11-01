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
  createTables()
  module.exports = pool;
