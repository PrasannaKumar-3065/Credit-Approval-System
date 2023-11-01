const pool = require('../Postgres/db')
const customerDataIngestion = async(request,response)=>{
    try{
        const workbook =  XLSX.readFile('customer_data.xlsx')
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(worksheet,{
            defval: null,
            raw: false, 
            dateNF: 'mm/dd/yyyy',
            cellDates: true,
        })
        let count = 0
        data.forEach(element => {
            const query = {
                text: 'INSERT INTO customer_data (customer_id, first_name, last_name, age, phone_number, monthly_salary, approved_limit) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                values: [element.customer_id, element.first_name, element.last_name, element.age, element.phone_number, element.monthly_salary, element.approved_limit],
              }
            pool.query(query) 
            count++ 
        })
        response.status(201).send(`Customers added: ${count}`)
    }catch (err){
        res.status(400).json({ error: "Internal Server Errorr" })
    }
}

const loanDataIngestion = async (request, response) => {
    try {
      const workbook = XLSX.readFile('loan_data.xlsx')
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(worksheet, {
        defval: null,
        raw: false,
        dateNF: 'm/d/yy', // Date format to match
        cellDates: true,
      })
  
      console.log(data)
  
      let count = 0
  
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
      response.status(201).send(`Loans added: ${count}`)
    } catch (err) {
      response.status(400).json({ error: "Internal Server Errorr" })
    }
  }

module.exports = {
    customerDataIngestion, 
    loanDataIngestion
}



