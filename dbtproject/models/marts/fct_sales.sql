/*
MARTS: Sales Fact Table
Grain: one row per order_id.
*/

{{ config(
    materialized='table',
    unique_key='sales_key',
    schema='marts',
    tags=['marts', 'daily']
) }}

with orders_enhanced as (
    select
        order_id,
        customer_id,
        product_id,
        order_date,
        quantity,
        unit_price,
        total_amount,
        status
    from {{ ref('int_orders_enhanced') }}
),

dim_customer as (
    select customer_key, customer_id
    from {{ ref('dim_customer') }}
),

dim_product as (
    select product_key, product_id
    from {{ ref('dim_product') }}
),

facts as (
    select
        {{ dbt_utils.generate_surrogate_key(['oe.order_id']) }} as sales_key,
        dc.customer_key,
        dp.product_key,

        oe.order_id,
        oe.customer_id,
        oe.product_id,

        oe.order_date,
        extract(year from oe.order_date) as order_year,
        extract(month from oe.order_date) as order_month,
        extract(quarter from oe.order_date) as order_quarter,

        oe.quantity,
        oe.unit_price,
        oe.total_amount as gross_sales_amount,
        case
            when oe.status = 'cancelled' then 0::numeric(10, 2)
            else oe.total_amount
        end as sales_amount,
        case
            when oe.status = 'cancelled' then oe.total_amount
            else 0::numeric(10, 2)
        end as cancelled_sales_amount,
        (oe.status = 'cancelled') as is_cancelled,
        oe.status,

        current_timestamp as created_at
    from orders_enhanced oe
    left join dim_customer dc on oe.customer_id = dc.customer_id
    left join dim_product  dp on oe.product_id  = dp.product_id
)

select * from facts

