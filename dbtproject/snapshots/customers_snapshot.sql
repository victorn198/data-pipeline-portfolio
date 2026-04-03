{% snapshot customers_snapshot %}

{{
    config(
      enabled=True,
      target_schema='snapshots',
      strategy='check',
      unique_key='customer_id',
      check_cols=['customer_name', 'email', 'city', 'state'],
      invalidate_hard_deletes=True
    )
}}

-- This query selects the data that will be snapshotted.
select * from {{ ref('stg_customers') }}

{% endsnapshot %}
