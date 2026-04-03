#!/bin/bash
# =================================================================
# Script: run_pipeline.sh
# Description: Executes the full data pipeline end-to-end.
# =================================================================

set -e

echo "--- Step 1: Loading Sample Data ---"
python scripts/loadsampledata.py
echo "--- Step 1 completed ---"

echo "--- Step 2: Running dbt ---"
cd dbtproject

echo "Running dbt deps..."
dbt deps

echo "Running dbt run..."
dbt run

echo "Running dbt snapshot..."
dbt snapshot

echo "Running dbt test..."
dbt test

echo "Data pipeline execution finished successfully."
