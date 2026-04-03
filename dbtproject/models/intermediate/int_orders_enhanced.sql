/*
INTERMEDIATE: Enrich orders with customer & product info
Business logic: Join orders with customer & product attributes
*/

{{ config(
    materialized='table',
    tags=['intermediate', 'daily'],
    schema='intermediate'
) }}

with orders as (
    select
        order_id,
        customer_id,
        product_id,
        order_date,
        quantity,
        unit_price,
        total_amount,
        status
    from {{ ref('stg_orders') }}
),
customers as (
    select
        customer_id,
        customer_name,
        email,
        city,
        state,
        created_date
    from {{ ref('stg_customers') }}
),
products as (
    select
        product_id,
        product_name,
        category,
        price,
        stock_quantity
    from {{ ref('stg_products') }}
),
joined as (
    select
        o.order_id,
        o.customer_id,
        c.customer_name,
        c.email,
        c.city,
        c.state,
        c.created_date as customer_created_date,

        o.product_id,
        p.product_name,
        p.category,

        o.order_date,
        o.quantity,
        o.unit_price,
        o.total_amount,
        o.status,

        (current_date - o.order_date::date) as days_since_order,

        current_timestamp as dbt_loaded_at
    from orders o
    left join customers c on o.customer_id = c.customer_id
    left join products  p on o.product_id = p.product_id
)

select * from joined

