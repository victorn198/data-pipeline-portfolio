-- =====================================================================
-- Script: setup_operational_monitoring_views.sql
-- Description: Creates monitoring views for the operational analytics dashboard
--              in PostgreSQL.
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS monitoring;

CREATE OR REPLACE VIEW monitoring.vw_raw_table_counts AS
SELECT 'raw.customers_raw' AS table_name, COUNT(*) AS record_count FROM raw.customers_raw
UNION ALL
SELECT 'raw.products_raw' AS table_name, COUNT(*) AS record_count FROM raw.products_raw
UNION ALL
SELECT 'raw.orders_raw' AS table_name, COUNT(*) AS record_count FROM raw.orders_raw;

CREATE OR REPLACE VIEW monitoring.vw_scd2_snapshot_status AS
SELECT
  (SELECT COUNT(*) FROM snapshots.customers_snapshot) AS scd2_total_rows,
  (SELECT COUNT(*) FROM snapshots.customers_snapshot WHERE dbt_valid_to IS NULL) AS scd2_current_rows,
  (SELECT COUNT(*) FROM snapshots.customers_snapshot WHERE dbt_valid_to IS NOT NULL) AS scd2_historical_rows,
  CURRENT_TIMESTAMP AS measured_at;

CREATE OR REPLACE VIEW monitoring.vw_data_quality_latest AS
SELECT
  rule_name,
  target_object,
  status,
  error_count,
  severity,
  checked_at,
  run_id
FROM data_quality.vw_data_quality_audit_latest;

CREATE OR REPLACE VIEW monitoring.vw_data_quality_runs AS
SELECT
  run_id,
  MIN(checked_at) AS run_started_at,
  MAX(checked_at) AS run_finished_at,
  SUM(CASE WHEN status = 'FAIL' THEN 1 ELSE 0 END) AS failed_rules_total,
  SUM(CASE WHEN status = 'FAIL' AND severity = 'ERROR' THEN 1 ELSE 0 END) AS failed_error_rules,
  SUM(CASE WHEN status = 'FAIL' AND severity = 'WARN' THEN 1 ELSE 0 END) AS failed_warn_rules,
  COUNT(*) AS rules_checked
FROM data_quality.data_quality_audit
GROUP BY run_id;

CREATE OR REPLACE VIEW monitoring.vw_open_data_quality_alerts AS
SELECT
  alert_id,
  run_id,
  alert_created_at,
  alert_status,
  failed_error_rules,
  alert_message,
  failed_rules
FROM data_quality.vw_open_data_quality_alerts;

CREATE OR REPLACE VIEW monitoring.vw_pipeline_operational_kpis AS
WITH raw_counts AS (
  SELECT
    MAX(CASE WHEN table_name = 'raw.customers_raw' THEN record_count ELSE NULL END) AS raw_customers,
    MAX(CASE WHEN table_name = 'raw.products_raw' THEN record_count ELSE NULL END) AS raw_products,
    MAX(CASE WHEN table_name = 'raw.orders_raw' THEN record_count ELSE NULL END) AS raw_orders
  FROM monitoring.vw_raw_table_counts
),
latest_run AS (
  SELECT
    run_id,
    run_finished_at,
    failed_rules_total,
    failed_error_rules,
    failed_warn_rules
  FROM (
    SELECT
      run_id,
      run_finished_at,
      failed_rules_total,
      failed_error_rules,
      failed_warn_rules,
      ROW_NUMBER() OVER (ORDER BY run_finished_at DESC, run_id DESC) AS rn
    FROM monitoring.vw_data_quality_runs
  ) d
  WHERE rn = 1
),
open_alerts AS (
  SELECT COUNT(*) AS open_alerts_count
  FROM monitoring.vw_open_data_quality_alerts
),
scd2 AS (
  SELECT scd2_total_rows, scd2_current_rows, scd2_historical_rows
  FROM monitoring.vw_scd2_snapshot_status
)
SELECT
  CURRENT_TIMESTAMP AS measured_at,
  r.raw_customers,
  r.raw_products,
  r.raw_orders,
  s.scd2_total_rows,
  s.scd2_current_rows,
  s.scd2_historical_rows,
  lr.run_id AS latest_dq_run_id,
  lr.run_finished_at AS latest_dq_run_finished_at,
  COALESCE(lr.failed_rules_total, 0) AS latest_dq_failed_rules_total,
  COALESCE(lr.failed_error_rules, 0) AS latest_dq_failed_error_rules,
  COALESCE(lr.failed_warn_rules, 0) AS latest_dq_failed_warn_rules,
  oa.open_alerts_count
FROM raw_counts r
CROSS JOIN scd2 s
LEFT JOIN latest_run lr ON TRUE
CROSS JOIN open_alerts oa;

SELECT 'PostgreSQL operational monitoring views setup complete.' AS status;
