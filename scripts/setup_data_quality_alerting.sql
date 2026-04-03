-- =====================================================================
-- Script: setup_data_quality_alerting.sql
-- Description: Creates automatic alerting on top of data quality audits in PostgreSQL.
--              Includes:
--              - Alert table
--              - Alert processing function
--              - Open-alerts view
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS data_quality;

CREATE TABLE IF NOT EXISTS data_quality.data_quality_alerts (
  alert_id BIGSERIAL PRIMARY KEY,
  run_id TEXT NOT NULL UNIQUE,
  alert_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  alert_status TEXT NOT NULL DEFAULT 'OPEN',
  failed_error_rules BIGINT NOT NULL,
  alert_message TEXT NOT NULL,
  failed_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  alert_source TEXT NOT NULL DEFAULT 'sp_process_data_quality_alerts'
);

CREATE OR REPLACE FUNCTION data_quality.sp_process_data_quality_alerts()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_latest_run_id TEXT;
  v_failed_error_rules BIGINT := 0;
  v_existing_alerts BIGINT := 0;
  v_failed_rules JSONB := '[]'::jsonb;
BEGIN
  SELECT run_id INTO v_latest_run_id
  FROM data_quality.data_quality_audit
  ORDER BY checked_at DESC, audit_id DESC
  LIMIT 1;

  IF v_latest_run_id IS NULL THEN
    RETURN 'No audit run found. Nothing to alert.';
  END IF;

  SELECT COUNT(*) INTO v_failed_error_rules
  FROM data_quality.data_quality_audit
  WHERE run_id = v_latest_run_id
    AND status = 'FAIL'
    AND severity = 'ERROR';

  IF v_failed_error_rules = 0 THEN
    RETURN 'Run ' || v_latest_run_id || ': no ERROR failures. No alert created.';
  END IF;

  SELECT COUNT(*) INTO v_existing_alerts
  FROM data_quality.data_quality_alerts
  WHERE run_id = v_latest_run_id;

  IF v_existing_alerts > 0 THEN
    RETURN 'Run ' || v_latest_run_id || ': alert already exists.';
  END IF;

  SELECT COALESCE(
           jsonb_agg(
             jsonb_build_object(
               'rule_name', rule_name,
               'target_object', target_object,
               'severity', severity,
               'error_count', error_count,
               'details', details
             )
           ),
           '[]'::jsonb
         )
  INTO v_failed_rules
  FROM data_quality.data_quality_audit
  WHERE run_id = v_latest_run_id
    AND status = 'FAIL'
    AND severity = 'ERROR';

  INSERT INTO data_quality.data_quality_alerts (
    run_id,
    failed_error_rules,
    alert_message,
    failed_rules
  )
  VALUES (
    v_latest_run_id,
    v_failed_error_rules,
    'Data quality critical failure detected in run ' || v_latest_run_id,
    v_failed_rules
  );

  RETURN 'Run ' || v_latest_run_id || ': alert created with ' || v_failed_error_rules || ' failed ERROR rule(s).';
END;
$$;

CREATE OR REPLACE VIEW data_quality.vw_open_data_quality_alerts AS
SELECT
  alert_id,
  run_id,
  alert_created_at,
  alert_status,
  failed_error_rules,
  alert_message,
  failed_rules
FROM data_quality.data_quality_alerts
WHERE alert_status = 'OPEN'
ORDER BY alert_created_at DESC;

SELECT 'PostgreSQL data quality alerting setup complete.' AS status;
