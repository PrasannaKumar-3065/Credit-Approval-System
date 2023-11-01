const pool = require('../Postgres/db')
const createLoan = async (req, res) => {
    try {
      const { customer_id, loan_amount, interest_rate, tenure } =req.body;
      const isEligible = true
      let query  = await pool.query("select max(loan_id)+1 as loan_id from loan_data")
      const loan_id = query.rows[0].loan_id
      if (!isEligible) {
        res.status(500).json({
          loan_id: loan_id,
          customer_id: customer_id,
          loan_approved: false,
          message: 'Loan not approved. Customer is not eligible.',
          monthly_installment: null,
        });
        return;
      }

      const monthly_installment = Math.round((loan_amount * (interest_rate / 12) * Math.pow(1 + interest_rate / 12, tenure)) /(Math.pow(1 + interest_rate / 12, tenure) - 1))
  
      pool.query("insert into loan_data (customer_id, loan_id, loan_amount, interest_rate, tenure, monthly_repayment) values($1,$2,$3,$4,$5,$6)",[customer_id, loan_id, loan_amount, interest_rate, tenure, monthly_installment]);
      res.status(201).json({
        loan_id: loan_id,
        customer_id: customer_id,
        loan_approved: true,
        message: 'Loan approved and processed successfully',
        monthly_installment: monthly_installment,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Errorr' });
    }
  }


const viewLoan = async (req, res) => {
    const loanid = req.params.loan_id
    try{
      const query = await pool.query("select b.first_name, b.last_name, b.phone_number, a.loan_amount, a.tenure, a.monthly_repayment from loan_data a inner join customer_data b on a.customer_id = b.customer_id where loan_id = $1 limit 1",[loanid])
      if(query.rows && query.rows.length > 0){
        res.status(201).json({ loan_data: query.rows[0]})
      }
      else{
        res.status(500).json({ error: 'No loans found under id:'+loanid })
      }
    }catch(err){
      console.error(err)
      res.status(500).json({ error: 'Internal Server Errorr' })
    }
  }

  const viewLoanStatement = async(req, res)=>{
    const customerId = req.params.customer_id
    const loanId = req.params.loan_id
    try{
      const query = await pool.query("select b.customer_id, a.loan_id, b.phone_number, a.loan_amount as principal, a.interest_rate, a.tenure as repayments_left, a.monthly_repayment as monthly_installment from loan_data a inner join customer_data b on a.customer_id = b.customer_id where a.customer_id = $1 and loan_id = $2",[customerId,loanId])
      console.log(query.rows)
      if(query.rows && query.rows.length > 0){
        res.status(201).json({ statement_details: query.rows})
      }
      else{
        res.status(500).json({ error: 'No loans found under loan id:'+loanId+' and customer id:'+customerId })
      }
    }catch(err){
      res.status(500).json({error: "Internal Server Errorr"})
      throw err
    }
  }

  module.exports = {
    createLoan,
    viewLoan,
    viewLoanStatement
  }