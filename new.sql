CREATE TABLE IF NOT EXISTS customer_data (
  customer_id INTEGER PRIMARY KEY DEFAULT nextval('customer_id_seq'),
  first_name VARCHAR,
  last_name VARCHAR,
  age INTEGER,
  phone_number BIGINT,
  monthly_salary INTEGER,
  approved_limit INTEGER
);

CREATE SEQUENCE customer_id_seq;

create table if not exists loan_data(
	customer_id integer references customer_data(customer_id),
	loan_id integer,
	loan_amount integer,
	tenure integer,
	interest_rate numeric(4,2),
	monthly_repayment integer,
	EMIs_paid_on_time integer,
	start_date date,
	end_date date
);

select * from customer_data order by customer_id
truncate table loan_data 
truncate table customer_data restart identity cascade;
drop table loan_data
drop table customer_data
select * from loan_data order by customer_id, loan_id


INSERT INTO customer_data (first_name, last_name, age, monthly_salary, approved_limit, phone_number) VALUES 
('prasanna','kumar',21, 13000,100000,9791521808)
select b.customer_id, a.loan_id, b.first_name, b.last_name, b.phone_number, a.loan_amount, a.tenure, a.monthly_repayment from loan_data a inner join customer_data b on a.customer_id = b.customer_id where a.customer_id = 14 and loan_id = 5930

select b.first_name, b.last_name, b.phone_number, a.loan_amount, a.tenure, a.monthly_repayment from loan_data a inner join customer_data b on a.customer_id = b.customer_id where loan_id = 9090 limit 1

SELECT a.customer_id, b.approved_limit, SUM(a.loan_amount) AS loan_amount_active
FROM loan_data a
INNER JOIN customer_data b ON a.customer_id = b.customer_id
WHERE a.customer_id = 90 AND end_date > NOW()
GROUP BY a.customer_id, b.approved_limit;

select * from loan_data where loan_id = 9090
select (sum(EMIs_paid_on_Time)::float / count(*)) * 100 as on_time_payments,count(*) as loan_count, sum(loan_amount) as loan_amount from loan_data where customer_id = 90