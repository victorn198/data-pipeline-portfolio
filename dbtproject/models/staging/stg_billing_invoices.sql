/*
STAGING: Billing invoices paginated API source cleaning and standardization
*/

with source as (
    select * from {{ source('raw', 'BILLING_INVOICES') }}
),

cleaned as (
    select
        upper(trim(invoice_id::text)) as invoice_id,
        upper(trim(customer_id::text)) as customer_id,
        upper(trim(account_id::text)) as account_id,
        case
            when nullif(trim(invoice_date::text), '') is null then null
            when invoice_date::text ~ '^\d{4}-\d{2}-\d{2}$' then invoice_date::date
            else null
        end as invoice_date,
        case
            when nullif(trim(due_date::text), '') is null then null
            when due_date::text ~ '^\d{4}-\d{2}-\d{2}$' then due_date::date
            else null
        end as due_date,
        case
            when nullif(trim(paid_at::text), '') is null then null
            when paid_at::text ~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$' then paid_at::timestamp
            else null
        end as paid_at,
        coalesce(nullif(trim(amount_due::text), '')::numeric(12, 2), 0) as amount_due,
        coalesce(nullif(trim(amount_paid::text), '')::numeric(12, 2), 0) as amount_paid,
        upper(trim(currency::text)) as currency,
        lower(trim(billing_status::text)) as billing_status,
        lower(trim(payment_method::text)) as payment_method,
        lower(trim(subscription_plan::text)) as subscription_plan,
        source_system,
        source_entity,
        load_batch_id,
        loaded_at,
        record_hash
    from source
    where nullif(trim(invoice_id::text), '') is not null
),

validated as (
    select
        *,
        case
            when customer_id is null or customer_id = '' then 'invalid_customer'
            when invoice_date is null then 'invalid_invoice_date'
            when due_date is null then 'invalid_due_date'
            when amount_due < 0 or amount_paid < 0 then 'invalid_amount'
            when amount_paid > amount_due then 'invalid_overpayment'
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
                partition by invoice_id
                order by loaded_at desc
            ) as rn
        from validated
    ) d
    where rn = 1
)

select
    invoice_id,
    customer_id,
    account_id,
    invoice_date,
    due_date,
    paid_at,
    amount_due,
    amount_paid,
    amount_due - amount_paid as outstanding_amount,
    currency,
    billing_status,
    payment_method,
    subscription_plan,
    source_system,
    source_entity,
    load_batch_id,
    loaded_at,
    record_hash
from deduplicated
where data_quality_flag = 'valid'
