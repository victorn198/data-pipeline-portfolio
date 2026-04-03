# Arquitetura do Projeto de Pipeline de Dados

Este documento descreve a arquitetura atual do pipeline apos a migracao para PostgreSQL.

## Visao Geral

A arquitetura segue o padrao Modern Data Stack com ingestao Python, transformacao dbt e consumo no Power BI.

## Componentes

1. Fonte de Dados (Simulada)
- Descricao: Scripts Python geram dados de exemplo e carregam tabelas RAW.
- Tecnologia: Python + psycopg2.
- Arquivos principais: `scripts/loadsampledata.py`, `fivetran_simulator/*.py`.

2. Data Warehouse
- Descricao: PostgreSQL centraliza dados em camadas RAW, STAGING, INTERMEDIATE e MARTS.
- Tecnologia: PostgreSQL 16.
- Schemas:
- `raw`: landing zone
- `staging`: limpeza e padronizacao
- `intermediate`: enriquecimento
- `marts`: fatos e dimensoes para BI
- `data_quality`: resultados de auditoria
- `monitoring`: views operacionais

3. Transformacao
- Descricao: dbt materializa modelos e snapshots com testes de qualidade.
- Tecnologia: dbt Core + dbt-postgres.
- Caminho: `dbtproject/`.

4. Orquestracao e CI
- Descricao: workflow no GitHub Actions sobe PostgreSQL em container e executa dbt run/snapshot/test.
- Tecnologia: GitHub Actions.
- Caminho: `.github/workflows/dbt_run.yml`.

5. Camada de Apresentacao
- Descricao: Power BI consome tabelas em `marts` e views em `monitoring`.
- Tecnologia: Power BI Desktop.
- Caminho: `power_bi/`.

6. API opcional para consultas
- Descricao: FastAPI expoe endpoint SQL read-only para consultas controladas.
- Tecnologia: FastAPI + psycopg2.
- Caminho: `mcp_tools/mcp_server_fastapi.py`.
