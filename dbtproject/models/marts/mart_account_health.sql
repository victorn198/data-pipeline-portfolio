/*
MARTS: Account Health
Grain: one row per CRM account.

This mart combines company-system signals into an operational account view:
CRM ownership, billed revenue, outstanding balance, support pressure, and
ecommerce activity tied through known customer/account mappings.
*/

{{ config(
    materialized='table',
    tags=['marts', 'daily', 'account_health'],
    schema='marts'
) }}

with accounts as (
    select
        account_id,
        account_name,
        industry,
        owner,
        lifecycle_stage,
        annual_revenue,
        employee_count,
        created_at
    from {{ ref('stg_crm_accounts') }}
),

invoices as (
    select
        invoice_id,
        customer_id,
        account_id,
        invoice_date,
        due_date,
        amount_due,
        amount_paid,
        outstanding_amount,
        billing_status,
        subscription_plan
    from {{ ref('stg_billing_invoices') }}
),

account_customer_map as (
    select distinct
        account_id,
        customer_id
    from invoices
    where account_id is not null
      and customer_id is not null
),

billing_by_account as (
    select
        account_id,
        count(*) as invoice_count,
        count(*) filter (where billing_status in ('open', 'past_due')) as open_invoice_count,
        count(*) filter (where billing_status = 'past_due') as past_due_invoice_count,
        sum(amount_due) as billed_amount,
        sum(amount_paid) as paid_amount,
        sum(outstanding_amount) as outstanding_amount,
        max(invoice_date) as latest_invoice_date,
        max(subscription_plan) as subscription_plan
    from invoices
    group by account_id
),

support_by_account as (
    select
        m.account_id,
        count(*) as ticket_count,
        count(*) filter (where t.status = 'open') as open_ticket_count,
        count(*) filter (where t.priority = 'high') as high_priority_ticket_count,
        avg(t.satisfaction_score::numeric) filter (where t.satisfaction_score is not null) as avg_satisfaction_score,
        max(t.opened_at) as latest_ticket_opened_at
    from {{ ref('stg_support_tickets') }} t
    inner join account_customer_map m
        on t.customer_id = m.customer_id
    group by m.account_id
),

sales_by_account as (
    select
        m.account_id,
        count(distinct s.order_id) as ecommerce_order_count,
        sum(s.sales_amount) as ecommerce_sales_amount,
        max(s.order_date) as latest_order_date
    from {{ ref('fct_sales') }} s
    inner join account_customer_map m
        on s.customer_id = m.customer_id
    group by m.account_id
),

scored as (
    select
        a.account_id,
        a.account_name,
        a.industry,
        a.owner,
        a.lifecycle_stage,
        coalesce(b.subscription_plan, 'unassigned') as subscription_plan,
        a.annual_revenue,
        a.employee_count,
        coalesce(b.invoice_count, 0) as invoice_count,
        coalesce(b.open_invoice_count, 0) as open_invoice_count,
        coalesce(b.past_due_invoice_count, 0) as past_due_invoice_count,
        coalesce(b.billed_amount, 0) as billed_amount,
        coalesce(b.paid_amount, 0) as paid_amount,
        coalesce(b.outstanding_amount, 0) as outstanding_amount,
        coalesce(s.ecommerce_order_count, 0) as ecommerce_order_count,
        coalesce(s.ecommerce_sales_amount, 0) as ecommerce_sales_amount,
        coalesce(t.ticket_count, 0) as ticket_count,
        coalesce(t.open_ticket_count, 0) as open_ticket_count,
        coalesce(t.high_priority_ticket_count, 0) as high_priority_ticket_count,
        coalesce(t.avg_satisfaction_score, 0) as avg_satisfaction_score,
        b.latest_invoice_date,
        s.latest_order_date,
        t.latest_ticket_opened_at,
        greatest(
            0,
            least(
                100,
                100
                - (coalesce(b.past_due_invoice_count, 0) * 18)
                - (coalesce(b.open_invoice_count, 0) * 6)
                - (coalesce(t.open_ticket_count, 0) * 12)
                - (coalesce(t.high_priority_ticket_count, 0) * 8)
                - case
                    when coalesce(t.avg_satisfaction_score, 0) > 0
                     and coalesce(t.avg_satisfaction_score, 0) < 3.5 then 10
                    else 0
                  end
                + case
                    when a.lifecycle_stage = 'customer' then 5
                    else 0
                  end
            )
        )::integer as health_score
    from accounts a
    left join billing_by_account b on a.account_id = b.account_id
    left join support_by_account t on a.account_id = t.account_id
    left join sales_by_account s on a.account_id = s.account_id
),

classified as (
    select
        *,
        case
            when health_score >= 85 then 'healthy'
            when health_score >= 70 then 'watch'
            else 'risk'
        end as health_tier,
        case
            when past_due_invoice_count > 0 then 'billing_risk'
            when open_ticket_count > 0 or high_priority_ticket_count > 0 then 'support_risk'
            when lifecycle_stage <> 'customer' then 'commercial_follow_up'
            else 'stable'
        end as primary_risk_driver,
        current_timestamp as created_at
    from scored
)

select * from classified
