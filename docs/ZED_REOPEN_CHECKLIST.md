# Zed Reopen Checklist

Guia rapido para retomar o projeto sem perder contexto.

Data base: 2026-02-17
Atualizacao: 2026-03-04

## 1) O que ja esta pronto

- Pipeline RAW em PostgreSQL:
- `scripts/loadsampledata.py`
- `fivetran_simulator/extract_customers.py`
- `fivetran_simulator/extract_products.py`
- `fivetran_simulator/extract_orders.py`
- Camadas dbt (`staging`, `intermediate`, `marts`, `snapshots`)
- Auditoria de qualidade:
- `scripts/setup_data_quality_audit.sql`
- Alertas de qualidade:
- `scripts/setup_data_quality_alerting.sql`
- Views operacionais:
- `scripts/setup_operational_monitoring_views.sql`
- Guias Power BI:
- `docs/MEASURE_DICTIONARY.md`
- `docs/POWER_BI_BUILD_LOG.md`
- `docs/TABULAR_EDITOR_2_RUNBOOK.md`

## 2) Ao reabrir no Zed

1. Abrir pasta do projeto: `D:\projects\data-pipeline-portfolio`
2. Confirmar que o banco PostgreSQL esta ativo e acessivel.
3. Rodar validacao rapida:
- `python test_postgres.py`
- `cd dbtproject && dbt test`
4. Abrir `.pbix` e continuar modelagem.
5. Registrar toda medida nova em `docs/MEASURE_DICTIONARY.md`.
6. Registrar a sessao em `docs/POWER_BI_BUILD_LOG.md`.

## 3) Prompt de retomada recomendado

```text
Leia docs/ZED_REOPEN_CHECKLIST.md, PROGRESS_LOG.md e docs/TABULAR_EDITOR_2_RUNBOOK.md e continue o dashboard no Power BI com medidas documentadas.
```
