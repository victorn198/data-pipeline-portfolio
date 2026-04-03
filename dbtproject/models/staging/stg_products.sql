/*
STAGING: Products Cleaning & Standardization
*/



with source as (
    select * from {{ source('raw', 'PRODUCTS') }}
),
cleaned as (
    select
        upper(trim(PRODUCT_ID::text)) as product_id,
        trim(PRODUCT_NAME::text) as product_name,
        coalesce(nullif(trim(CATEGORY::text), ''), 'uncategorized') as category,
        UNIT_PRICE::numeric(10, 2) as price_raw,
        STOCK_QUANTITY::numeric(38, 0) as stock_quantity_raw,
        current_timestamp as dbt_loaded_at
    from source
    where PRODUCT_ID is not null
),
validated as (
    select
        product_id,
        case
            when product_name is null or product_name = '' then concat('Unknown Product ', product_id)
            else product_name
        end as product_name,
        category,
        coalesce(price_raw, 0)::numeric(10,2) as price,
        greatest(coalesce(stock_quantity_raw, 0), 0)::numeric(38,0) as stock_quantity,
        dbt_loaded_at
    from cleaned
),
deduplicated as (
    select *
    from (
        select
            *,
            row_number() over (
                partition by product_id
                order by dbt_loaded_at desc
            ) as rn
        from validated
    ) d
    where d.rn = 1
)
select
    product_id,
    product_name,
    category,
    price,
    stock_quantity,
    dbt_loaded_at
from deduplicated
where price > 0
