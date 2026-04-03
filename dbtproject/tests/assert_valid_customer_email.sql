-- Fails when customer email doesn't match basic email format.

select
    customer_id,
    email
from {{ ref('stg_customers') }}
where email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
