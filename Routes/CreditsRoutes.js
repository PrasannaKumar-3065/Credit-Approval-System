const pool = require('../Postgres/db')

const calculateCreditScore = async (customer_id) => {
    try {
      const result = await pool.query("select (sum(EMIs_paid_on_Time)::float / count(*)) * 100 as on_time_payments,count(*) as loan_count, sum(loan_amount) as loan_amount from loan_data where customer_id = $1",[customer_id])
      let onTimePercentage
      const newResult = await pool.query("select a.customer_id, b.approved_limit, sum(a.loan_amount) as loan_amount_active from loan_data a inner join customer_data b on a.customer_id = b.customer_id where a.customer_id = $1 AND end_date > now() group by a.customer_id, b.approved_limit",[customer_id]) 
      let creditScore = 0
      if( newResult.rows[0] && result.rows[0]){
        onTimePercentage = result.rows[0].on_time_payments
        const loanAmount = newResult.rows[0].loan_amount_active
        const approvedLimit = newResult.rows[0].approved_limit

        if (onTimePercentage >= 90) {
          creditScore = 100 
        } else if (onTimePercentage >= 75) {
          creditScore = 80 
        } else if (onTimePercentage >= 50) {
          creditScore = 60 
        } else {
          creditScore = 40
        }

        if(loanAmount > approvedLimit){
          creditScore = 0
        }
      }
      return creditScore
    } catch (error) {
        console.error(error)
        return 0 
    }
  }

  const checkeligibility = async (req, res) => {
    try {
      const { customer_id, loan_amount, interest_rate, tenure } = req.body
      console.log(req.body)
      const creditScore = calculateCreditScore(customer_id)
      const response = {
        customer_id,
        approval: false,
        interest_rate,
        corrected_interest_rate: null,
        tenure,
        monthly_installment: null,
      }
  
      if (creditScore > 50) {
        response.approval = true
      } else if (50 >= creditScore && creditScore > 30) {
        if (interest_rate > 12) {
          response.approval = true
        } else {
          response.corrected_interest_rate = 12 
        }
      } else if (30 >= creditScore && creditScore > 10) {
        if (interest_rate > 16) {
          response.approval = true
        } else {
          response.corrected_interest_rate = 16 
        }
      }
      res.status(200).json(response)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Internal Server Errorr' })
    }
  }

  module.exports = {
    checkeligibility
  }