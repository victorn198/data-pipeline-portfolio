/*
STAGING: Products Cleaning & Standardization
*/

{{ config(
    materialized='view',
    tags=['staging', 'daily'],
    schema='STAGING'
) }}

with source as (
    select * from {{ source('raw', 'PRODUCTS') }}
),
cleaned as (
    select
        PRODUCT_ID::STRING as product_id,
        PRODUCT_NAME::STRING as product_name,
        CATEGORY::STRING as category,
        UNIT_PRICE::NUMBER(10, 2) as price,
        STOCK_QUANTITY::NUMBER(38, 0) as stock_quantity,
        CURRENT_TIMESTAMP as dbt_loaded_at
    from source
)
select * from cleaned
where product_id is not null
  and price > 0
