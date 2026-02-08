/*
STAGING: Customers Cleaning & Standardization
*/

{{ config(
    materialized='view',
    tags=['staging', 'daily'],
    schema='STAGING'
) }}

with source as (
    select * from {{ source('raw', 'CUSTOMERS') }}
),
cleaned as (
    select
        CUSTOMER_ID::STRING as customer_id,
        CUSTOMER_NAME::STRING as customer_name,
        EMAIL::STRING as email,
        CITY::STRING as city,
        STATE::STRING as state,
        CREATED_DATE::TIMESTAMP_NTZ as created_date,
        CURRENT_TIMESTAMP as dbt_loaded_at
    from source
)
select * from cleaned
where customer_id is not null
