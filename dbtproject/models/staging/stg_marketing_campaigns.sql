/*
STAGING: Marketing campaign file source cleaning and standardization
*/

with source as (
    select * from {{ source('raw', 'MARKETING_CAMPAIGNS') }}
),

cleaned as (
    select
        upper(trim(campaign_id::text)) as campaign_id,
        nullif(trim(campaign_name::text), '') as campaign_name,
        lower(trim(channel::text)) as channel,
        case
            when nullif(trim(start_date::text), '') is null then null
            when start_date::text ~ '^\d{4}-\d{2}-\d{2}$' then start_date::date
            else null
        end as start_date,
        case
            when nullif(trim(end_date::text), '') is null then null
            when end_date::text ~ '^\d{4}-\d{2}-\d{2}$' then end_date::date
            else null
        end as end_date,
        coalesce(nullif(trim(budget::text), '')::numeric(12, 2), 0) as budget,
        coalesce(nullif(trim(spend::text), '')::numeric(12, 2), 0) as spend,
        nullif(trim(target_city::text), '') as target_city,
        lower(trim(status::text)) as status,
        source_system,
        source_entity,
        load_batch_id,
        loaded_at,
        record_hash
    from source
    where nullif(trim(campaign_id::text), '') is not null
),

validated as (
    select
        *,
        case
            when start_date is null then 'invalid_start_date'
            when end_date is not null and end_date < start_date then 'invalid_date_window'
            when budget < 0 then 'invalid_budget'
            when spend < 0 then 'invalid_spend'
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
                partition by campaign_id
                order by loaded_at desc
            ) as rn
        from validated
    ) d
    where rn = 1
)

select
    campaign_id,
    campaign_name,
    channel,
    start_date,
    end_date,
    budget,
    spend,
    target_city,
    status,
    source_system,
    source_entity,
    load_batch_id,
    loaded_at,
    record_hash
from deduplicated
where data_quality_flag = 'valid'
