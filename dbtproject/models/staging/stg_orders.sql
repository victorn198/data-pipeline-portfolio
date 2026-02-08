/*
STAGING: Orders Cleaning & Standardization
*/

{{ config(
    materialized='view',
    tags=['staging', 'daily'],
    schema='STAGING'
) }}

with source as (
    select * from {{ source('raw', 'ORDERS') }}
),
cleaned as (
    select
        ORDER_ID::STRING as order_id,
        CUSTOMER_ID::STRING as customer_id,
        PRODUCT_ID::STRING as product_id,
        ORDER_DATE::TIMESTAMP_NTZ as order_date,
        QUANTITY::NUMBER(38, 0) as quantity,
        UNIT_PRICE::NUMBER(10, 2) as unit_price,
        TOTAL_AMOUNT::NUMBER(10, 2) as total_amount,
        STATUS::STRING as status,
        CURRENT_TIMESTAMP as dbt_loaded_at
    from source
    where ORDER_DATE >= to_timestamp_ntz('2023-01-01')
),
validated as (
    select
        *,
        case
            when total_amount > 0 then 'valid'
            when total_amount <= 0 then 'invalid_amount'
            when customer_id is null then 'invalid_customer'
            else 'other_issue'
        end as data_quality_flag
    from cleaned
)
select * from validated
