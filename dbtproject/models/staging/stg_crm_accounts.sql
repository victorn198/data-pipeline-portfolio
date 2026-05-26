/*
STAGING: CRM account paginated API source cleaning and standardization
*/

with source as (
    select * from {{ source('raw', 'CRM_ACCOUNTS') }}
),

cleaned as (
    select
        upper(trim(account_id::text)) as account_id,
        nullif(trim(account_name::text), '') as account_name,
        lower(trim(industry::text)) as industry,
        nullif(trim(owner::text), '') as owner,
        lower(trim(lifecycle_stage::text)) as lifecycle_stage,
        coalesce(nullif(trim(annual_revenue::text), '')::numeric(14, 2), 0) as annual_revenue,
        coalesce(nullif(trim(employee_count::text), '')::integer, 0) as employee_count,
        case
            when nullif(trim(created_at::text), '') is null then null
            when created_at::text ~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$' then created_at::timestamp
            else null
        end as created_at,
        source_system,
        source_entity,
        load_batch_id,
        loaded_at,
        record_hash
    from source
    where nullif(trim(account_id::text), '') is not null
),

validated as (
    select
        *,
        case
            when account_name is null then 'invalid_account_name'
            when created_at is null then 'invalid_created_at'
            when annual_revenue < 0 then 'invalid_annual_revenue'
            when employee_count < 0 then 'invalid_employee_count'
            else 'valid'
        end as data_quality_flag
    from cleaned
),

deduplicated as (
    select *
    from (
        select
            *,
            row_number() over (
                partition by account_id
                order by loaded_at desc
            ) as rn
        from validated
    ) d
    where rn = 1
)

select
    account_id,
    account_name,
    industry,
    owner,
    lifecycle_stage,
    annual_revenue,
    employee_count,
    created_at,
    source_system,
    source_entity,
    load_batch_id,
    loaded_at,
    record_hash
from deduplicated
where data_quality_flag = 'valid'
