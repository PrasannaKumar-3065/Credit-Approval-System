const pool = require('../Postgres/db')
const userRegister =  async (req, res) => {
    try {
        console.log(req.body)
        const { first_name, last_name, age, monthly_income, phone_number } = req.body
        const approved_limit = Math.round(36 * monthly_income / 100000) * 100000
        let query  = await pool.query("select max(customer_id)+1 as customer_id from customer_data")
        const customerId = query.rows[0].customer_id
        query = {
            text:
            'INSERT INTO customer_data (customer_id,first_name, last_name, age, monthly_salary, approved_limit, phone_number) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING customer_id',
            values: [customerId,first_name, last_name, age, monthly_income, approved_limit, phone_number],
        }

        const result = await pool.query(query)

        const customer_id = result.rows[0].customer_id
        const name = `${first_name} ${last_name}`

        res.status(201).json({
            customer_id,
            name,
            age,
            monthly_income,
            approved_limit,
            phone_number,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal Server Errorr' })
        throw err
    }
  }

  module.exports = {
    userRegister
  }