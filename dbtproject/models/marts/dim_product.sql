/*
MARTS: Product Dimension
*/

{{ config(
    materialized='table',
    tags=['marts', 'daily'],
    schema='MARTS'
) }}

with products as (
    select
        {{ dbt_utils.generate_surrogate_key(['product_id']) }} as product_key,
        product_id,
        product_name,
        category,
        price,
        stock_quantity,
        current_timestamp as created_at,
        current_timestamp as updated_at
    from {{ ref('stg_products') }}
)

select * from products
