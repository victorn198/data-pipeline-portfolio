/*
STAGING: Customers Cleaning & Standardization
*/



with source as (
    select * from {{ source('raw', 'CUSTOMERS') }}
),
cleaned as (
    select
        upper(trim(CUSTOMER_ID::text)) as customer_id,
        initcap(trim(CUSTOMER_NAME::text)) as customer_name,
        lower(trim(EMAIL::text)) as email_raw,
        initcap(trim(CITY::text)) as city,
        upper(trim(STATE::text)) as state,
        coalesce(CREATED_DATE::timestamp, current_timestamp) as created_date,
        current_timestamp as dbt_loaded_at
    from source
    where CUSTOMER_ID is not null
),
validated as (
    select
        customer_id,
        customer_name,
        case
            when email_raw ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' then email_raw
            else concat(replace(lower(customer_id), ' ', ''), '@portfolio-company.com')
        end as email,
        nullif(city, '') as city,
        nullif(state, '') as state,
        created_date,
        dbt_loaded_at
    from cleaned
),
deduplicated as (
    select *
    from (
        select
            *,
            row_number() over (
                partition by customer_id
                order by created_date desc, dbt_loaded_at desc
            ) as rn
        from validated
    ) d
    where d.rn = 1
)
select
    customer_id,
    customer_name,
    email,
    city,
    state,
    created_date,
    dbt_loaded_at
from deduplicated
