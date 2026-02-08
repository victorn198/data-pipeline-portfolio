/*
MARTS: Customer Dimension
Current snapshot (can evolve to SCD2 later)
*/

{{ config(
    materialized='table',
    tags=['marts', 'daily'],
    schema='MARTS'
) }}

with customers as (
    select
        {{ dbt_utils.generate_surrogate_key(['customer_id']) }} as customer_key,
        customer_id,
        customer_name,
        email,
        city,
        state,
        created_date,
        current_timestamp as created_at,
        current_timestamp as updated_at,
        true as is_active
    from {{ ref('stg_customers') }}
)

select * from customers
