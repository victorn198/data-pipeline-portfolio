/*
STAGING: Support ticket JSON source cleaning and standardization
*/

with source as (
    select * from {{ source('raw', 'SUPPORT_TICKETS') }}
),

cleaned as (
    select
        upper(trim(ticket_id::text)) as ticket_id,
        upper(trim(customer_id::text)) as customer_id,
        case
            when nullif(trim(opened_at::text), '') is null then null
            when opened_at::text ~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$' then opened_at::timestamp
            else null
        end as opened_at,
        case
            when nullif(trim(closed_at::text), '') is null then null
            when closed_at::text ~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$' then closed_at::timestamp
            else null
        end as closed_at,
        lower(trim(issue_type::text)) as issue_type,
        lower(trim(priority::text)) as priority,
        lower(trim(status::text)) as status,
        nullif(trim(satisfaction_score::text), '')::integer as satisfaction_score,
        source_system,
        source_entity,
        load_batch_id,
        loaded_at,
        record_hash
    from source
    where nullif(trim(ticket_id::text), '') is not null
),

validated as (
    select
        *,
        case
            when customer_id is null or customer_id = '' then 'invalid_customer'
            when opened_at is null then 'invalid_opened_at'
            when closed_at is not null and closed_at < opened_at then 'invalid_close_window'
            when satisfaction_score is not null and satisfaction_score not between 1 and 5 then 'invalid_satisfaction_score'
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
                partition by ticket_id
                order by loaded_at desc
            ) as rn
        from validated
    ) d
    where rn = 1
)

select
    ticket_id,
    customer_id,
    opened_at,
    closed_at,
    issue_type,
    priority,
    status,
    satisfaction_score,
    source_system,
    source_entity,
    load_batch_id,
    loaded_at,
    record_hash
from deduplicated
where data_quality_flag = 'valid'
