/*
MARTS: Sales Fact Table
Granularity: 1 row per order_id (assuming stg_orders has unique order_id)
*/

{{ config(
    materialized='incremental',
    incremental_strategy='delete+insert',
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
        oe.total_amount as sales_amount,
        oe.status,

        current_timestamp as created_at
    from orders_enhanced oe
    left join dim_customer dc on oe.customer_id = dc.customer_id
    left join dim_product  dp on oe.product_id  = dp.product_id
)

select * from facts

/*
{% if is_incremental() %}
where order_date >= (select coalesce(max(order_date), '1900-01-01'::date) from {{ this }})
{% endif %}
*/
-- Incremental logic removed to ensure full refresh. The is_incremental() macro was not working as expected.

