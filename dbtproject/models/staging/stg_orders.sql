/*
STAGING: Orders Cleaning & Standardization
*/



with source as (
    select * from {{ source('raw', 'ORDERS') }}
),
cleaned as (
    select
        upper(trim(ORDER_ID::text)) as order_id,
        upper(trim(CUSTOMER_ID::text)) as customer_id,
        upper(trim(PRODUCT_ID::text)) as product_id,
        case
            when nullif(trim(ORDER_DATE::text), '') is null then null
            when ORDER_DATE::text ~ '^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}:\d{2}(\.\d{1,6})?([+-]\d{2}:\d{2}|Z)?)?$' then ORDER_DATE::timestamp
            else null
        end as order_date,
        QUANTITY::numeric(38, 0) as quantity_raw,
        UNIT_PRICE::numeric(10, 2) as unit_price_raw,
        TOTAL_AMOUNT::numeric(10, 2) as total_amount_raw,
        lower(trim(STATUS::text)) as status_raw,
        current_timestamp as dbt_loaded_at
    from source
    where ORDER_ID is not null
),
validated as (
    select
        order_id,
        customer_id,
        product_id,
        least(coalesce(order_date, current_timestamp), current_timestamp) as order_date,
        coalesce(quantity_raw, 0)::numeric(38,0) as quantity,
        coalesce(unit_price_raw, 0)::numeric(10,2) as unit_price,
        round(coalesce(quantity_raw, 0) * coalesce(unit_price_raw, 0), 2)::numeric(10,2) as total_amount,
        case
            when status_raw in ('pending','paid','cancelled','shipped','completed') then status_raw
            when status_raw in ('canceled') then 'cancelled'
            else 'pending'
        end as status,
        dbt_loaded_at,
        case
            when coalesce(quantity_raw, 0) <= 0 then 'invalid_quantity'
            when coalesce(unit_price_raw, 0) <= 0 then 'invalid_unit_price'
            when customer_id is null or customer_id = '' then 'invalid_customer'
            when product_id is null or product_id = '' then 'invalid_product'
            else 'valid'
        end as data_quality_flag
    from cleaned
    where least(coalesce(order_date, current_timestamp), current_timestamp) >= timestamp '2023-01-01'
),
deduplicated as (
    select *
    from (
        select
            *,
            row_number() over (
                partition by order_id
                order by order_date desc, dbt_loaded_at desc
            ) as rn
        from validated
    ) d
    where d.rn = 1
)
select *
from deduplicated
where data_quality_flag = 'valid'
