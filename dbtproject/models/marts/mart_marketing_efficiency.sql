/*
MARTS: Marketing Efficiency
Grain: one row per marketing campaign.

Campaign attribution is intentionally conservative for this portfolio dataset:
orders are attributed by campaign city and active campaign date window, and
orders that match multiple campaigns are split evenly across those campaigns.
*/

{{ config(
    materialized='table',
    tags=['marts', 'daily', 'marketing_efficiency'],
    schema='marts'
) }}

with campaigns as (
    select
        campaign_id,
        campaign_name,
        channel,
        start_date,
        coalesce(end_date, current_date) as end_date,
        budget,
        spend,
        target_city,
        status
    from {{ ref('stg_marketing_campaigns') }}
),

sales as (
    select
        s.order_id,
        s.customer_id,
        s.order_date::date as order_date,
        c.city,
        s.sales_amount
    from {{ ref('fct_sales') }} s
    left join {{ ref('dim_customer') }} c
      on s.customer_key = c.customer_key
    where s.sales_amount > 0
),

eligible_sales as (
    select
        c.campaign_id,
        s.order_id,
        s.customer_id,
        s.sales_amount,
        count(*) over (partition by s.order_id) as campaign_matches
    from campaigns c
    inner join sales s
      on lower(s.city) = lower(c.target_city)
     and s.order_date between c.start_date and c.end_date
),

sales_by_campaign as (
    select
        campaign_id,
        count(distinct order_id) as attributed_orders_count,
        count(distinct customer_id) as attributed_customers_count,
        sum(sales_amount / nullif(campaign_matches, 0))::numeric(12, 2) as attributed_revenue
    from eligible_sales
    group by campaign_id
),

final as (
    select
        c.campaign_id,
        c.campaign_name,
        c.channel,
        c.start_date,
        c.end_date,
        c.target_city,
        c.status,
        c.budget,
        c.spend,
        coalesce(s.attributed_orders_count, 0) as attributed_orders_count,
        coalesce(s.attributed_customers_count, 0) as attributed_customers_count,
        coalesce(s.attributed_revenue, 0)::numeric(12, 2) as attributed_revenue,
        (coalesce(s.attributed_revenue, 0) / nullif(c.spend, 0))::numeric(12, 2) as roas,
        (c.spend / nullif(c.budget, 0) * 100.0)::numeric(12, 2) as budget_utilization_pct,
        (c.spend / nullif(s.attributed_customers_count, 0))::numeric(12, 2) as acquisition_cost_proxy,
        current_timestamp as created_at
    from campaigns c
    left join sales_by_campaign s
      on c.campaign_id = s.campaign_id
)

select * from final
