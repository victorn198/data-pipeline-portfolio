-- =====================================================================
-- Script: setup_data_quality_audit.sql
-- Description: Creates automated data quality auditing objects in PostgreSQL.
--              Includes:
--              - Audit table
--              - Audit function
--              - Latest-run and latest-rule views
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS data_quality;

CREATE TABLE IF NOT EXISTS data_quality.data_quality_audit (
  audit_id BIGSERIAL PRIMARY KEY,
  run_id TEXT NOT NULL,
  checked_at TIMESTAMP NOT NULL,
  rule_name TEXT NOT NULL,
  target_object TEXT NOT NULL,
  status TEXT NOT NULL,
  error_count BIGINT NOT NULL,
  severity TEXT NOT NULL,
  details TEXT NOT NULL,
  executed_by TEXT NOT NULL DEFAULT CURRENT_USER
);

CREATE OR REPLACE FUNCTION data_quality.sp_run_data_quality_audit()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_run_id TEXT := md5(random()::text || clock_timestamp()::text);
  v_checked_at TIMESTAMP := CURRENT_TIMESTAMP;
  v_error_count BIGINT := 0;
  v_failed_rules BIGINT := 0;
BEGIN
  -- Rule 1: Critical nulls in fact keys/date.
  SELECT COUNT(*) INTO v_error_count
  FROM marts.fct_sales
  WHERE order_id IS NULL
     OR customer_key IS NULL
     OR product_key IS NULL
     OR order_date IS NULL;

  INSERT INTO data_quality.data_quality_audit (
    run_id, checked_at, rule_name, target_object, status, error_count, severity, details
  )
  VALUES (
    v_run_id,
    v_checked_at,
    'critical_null_keys_fact_sales',
    'marts.fct_sales',
    CASE WHEN v_error_count = 0 THEN 'PASS' ELSE 'FAIL' END,
    v_error_count,
    'ERROR',
    'Checks nulls in ORDER_ID, CUSTOMER_KEY, PRODUCT_KEY, ORDER_DATE.'
  );
  v_failed_rules := v_failed_rules + CASE WHEN v_error_count = 0 THEN 0 ELSE 1 END;

  -- Rule 2: Duplicate order_id in fact.
  SELECT COALESCE(SUM(dup_count), 0) INTO v_error_count
  FROM (
    SELECT (COUNT(*) - 1) AS dup_count
    FROM marts.fct_sales
    GROUP BY order_id
    HAVING COUNT(*) > 1
  ) d;

  INSERT INTO data_quality.data_quality_audit (
    run_id, checked_at, rule_name, target_object, status, error_count, severity, details
  )
  VALUES (
    v_run_id,
    v_checked_at,
    'duplicate_order_id_fact_sales',
    'marts.fct_sales',
    CASE WHEN v_error_count = 0 THEN 'PASS' ELSE 'FAIL' END,
    v_error_count,
    'ERROR',
    'Counts duplicate ORDER_ID rows in the fact table.'
  );
  v_failed_rules := v_failed_rules + CASE WHEN v_error_count = 0 THEN 0 ELSE 1 END;

  -- Rule 3: Orphans in fact against dimensions.
  SELECT COUNT(*) INTO v_error_count
  FROM marts.fct_sales f
  LEFT JOIN marts.dim_customer dc ON f.customer_key = dc.customer_key
  LEFT JOIN marts.dim_product dp ON f.product_key = dp.product_key
  WHERE dc.customer_key IS NULL
     OR dp.product_key IS NULL;

  INSERT INTO data_quality.data_quality_audit (
    run_id, checked_at, rule_name, target_object, status, error_count, severity, details
  )
  VALUES (
    v_run_id,
    v_checked_at,
    'orphan_dimension_keys_in_fact_sales',
    'marts.fct_sales',
    CASE WHEN v_error_count = 0 THEN 'PASS' ELSE 'FAIL' END,
    v_error_count,
    'ERROR',
    'Verifies foreign keys in fact exist in customer/product dimensions.'
  );
  v_failed_rules := v_failed_rules + CASE WHEN v_error_count = 0 THEN 0 ELSE 1 END;

  -- Rule 4: Future order dates.
  SELECT COUNT(*) INTO v_error_count
  FROM marts.fct_sales
  WHERE order_date > CURRENT_TIMESTAMP;

  INSERT INTO data_quality.data_quality_audit (
    run_id, checked_at, rule_name, target_object, status, error_count, severity, details
  )
  VALUES (
    v_run_id,
    v_checked_at,
    'future_order_dates_fact_sales',
    'marts.fct_sales',
    CASE WHEN v_error_count = 0 THEN 'PASS' ELSE 'FAIL' END,
    v_error_count,
    'ERROR',
    'Checks order dates greater than current timestamp.'
  );
  v_failed_rules := v_failed_rules + CASE WHEN v_error_count = 0 THEN 0 ELSE 1 END;

  -- Rule 5: Gross amount consistency.
  SELECT COUNT(*) INTO v_error_count
  FROM marts.fct_sales
  WHERE ABS(COALESCE(gross_sales_amount, 0) - ROUND(COALESCE(quantity, 0) * COALESCE(unit_price, 0), 2)) > 0.01;

  INSERT INTO data_quality.data_quality_audit (
    run_id, checked_at, rule_name, target_object, status, error_count, severity, details
  )
  VALUES (
    v_run_id,
    v_checked_at,
    'gross_order_amount_consistency_fact_sales',
    'marts.fct_sales',
    CASE WHEN v_error_count = 0 THEN 'PASS' ELSE 'FAIL' END,
    v_error_count,
    'ERROR',
    'Checks if GROSS_SALES_AMOUNT equals QUANTITY * UNIT_PRICE (tolerance 0.01).'
  );
  v_failed_rules := v_failed_rules + CASE WHEN v_error_count = 0 THEN 0 ELSE 1 END;

  -- Rule 6: Net/cancelled amount reconciliation.
  SELECT COUNT(*) INTO v_error_count
  FROM marts.fct_sales
  WHERE ABS(
      COALESCE(gross_sales_amount, 0)
      - COALESCE(sales_amount, 0)
      - COALESCE(cancelled_sales_amount, 0)
  ) > 0.01;

  INSERT INTO data_quality.data_quality_audit (
    run_id, checked_at, rule_name, target_object, status, error_count, severity, details
  )
  VALUES (
    v_run_id,
    v_checked_at,
    'net_cancelled_reconciliation_fact_sales',
    'marts.fct_sales',
    CASE WHEN v_error_count = 0 THEN 'PASS' ELSE 'FAIL' END,
    v_error_count,
    'ERROR',
    'Checks if GROSS_SALES_AMOUNT equals SALES_AMOUNT plus CANCELLED_SALES_AMOUNT.'
  );
  v_failed_rules := v_failed_rules + CASE WHEN v_error_count = 0 THEN 0 ELSE 1 END;

  -- Rule 7: Customer email validity.
  SELECT COUNT(*) INTO v_error_count
  FROM staging.stg_customers
  WHERE email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';

  INSERT INTO data_quality.data_quality_audit (
    run_id, checked_at, rule_name, target_object, status, error_count, severity, details
  )
  VALUES (
    v_run_id,
    v_checked_at,
    'valid_customer_email_stg_customers',
    'staging.stg_customers',
    CASE WHEN v_error_count = 0 THEN 'PASS' ELSE 'FAIL' END,
    v_error_count,
    'WARN',
    'Checks valid e-mail format in staging customers.'
  );
  v_failed_rules := v_failed_rules + CASE WHEN v_error_count = 0 THEN 0 ELSE 1 END;

  RETURN 'Audit run_id=' || v_run_id || ' completed. Failed rules=' || v_failed_rules;
END;
$$;

CREATE OR REPLACE VIEW data_quality.vw_data_quality_audit_latest AS
WITH ranked AS (
  SELECT
    run_id,
    checked_at,
    rule_name,
    target_object,
    status,
    error_count,
    severity,
    details,
    executed_by,
    ROW_NUMBER() OVER (PARTITION BY rule_name ORDER BY checked_at DESC, audit_id DESC) AS rn
  FROM data_quality.data_quality_audit
)
SELECT
  run_id,
  checked_at,
  rule_name,
  target_object,
  status,
  error_count,
  severity,
  details,
  executed_by
FROM ranked
WHERE rn = 1;

SELECT 'PostgreSQL data quality audit setup complete.' AS status;
