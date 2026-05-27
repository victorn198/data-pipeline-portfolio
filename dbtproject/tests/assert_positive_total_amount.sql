-- dbt singular test: assert_positive_total_amount.sql
-- This test fails if any fact row has non-positive gross amount or negative net amount.

SELECT
    sales_key,
    gross_sales_amount,
    sales_amount
FROM {{ ref('fct_sales') }}
WHERE gross_sales_amount <= 0
   OR sales_amount < 0
