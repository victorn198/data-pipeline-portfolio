/*
STAGING: Current customer state from native SCD2 snapshot.
Disabled in PostgreSQL migration until a dedicated snapshot-consumption model is required.
*/

{{ config(enabled=false) }}

select
    null::text as customer_id,
    null::text as customer_name,
    null::text as email,
    null::text as city,
    null::text as state,
    null::timestamp as created_date,
    null::timestamp as snapshot_valid_from,
    null::timestamp as snapshot_updated_at,
    null::timestamp as snapshot_loaded_at,
    current_timestamp as dbt_loaded_at
where 1 = 0
