# Data Lineage e Arquitetura

Este documento descreve o fluxo de dados do projeto na arquitetura PostgreSQL.

## Diagrama (DOT)

```dot
digraph G {
  bgcolor="#f5f7fb";
  rankdir="LR";
  node [shape=box, style="rounded,filled", fillcolor="#ffffff", fontname="Arial"];
  edge [fontname="Arial", fontsize=10];

  subgraph cluster_source {
    label="Fonte de Dados";
    style="filled";
    color="lightgrey";
    node [fillcolor="#d7f5d2"];
    sim [label="Fivetran Simulator\n(Python)"];
  }

  subgraph cluster_dw {
    label="Data Warehouse\n(PostgreSQL)";
    style="filled";
    color="lightblue";
    node [fillcolor="#d6e8ff"];
    raw [label="raw"];
    staging [label="staging"];
    intermediate [label="intermediate"];
    marts [label="marts"];
    monitoring [label="monitoring"];
  }

  subgraph cluster_dbt {
    label="Transformacao";
    style="filled";
    color="lightyellow";
    node [fillcolor="#fff3bf"];
    dbt [label="dbt Core"];
  }

  subgraph cluster_consume {
    label="Consumo";
    style="filled";
    color="lightgreen";
    node [fillcolor="#d8f3dc"];
    pbi [label="Power BI"];
    api [label="FastAPI SQL API\n(opcional)"];
  }

  sim -> raw [label="ingestao RAW"];
  raw -> dbt [label="sources"];
  dbt -> staging [label="modelos staging"];
  staging -> intermediate [label="joins/enriquecimento"];
  intermediate -> marts [label="fato + dimensoes"];
  marts -> monitoring [label="views operacionais"];
  marts -> pbi [label="dashboard executivo"];
  monitoring -> pbi [label="KPIs operacionais"];
  marts -> api [label="consulta read-only"];
}
```

## Fluxo resumido

1. `scripts/loadsampledata.py` e extratores em `fivetran_simulator/` carregam `raw.orders_raw`, `raw.customers_raw` e `raw.products_raw`.
2. dbt le as fontes RAW e materializa camadas `staging`, `intermediate` e `marts`.
3. Scripts SQL criam auditoria em `data_quality` e views de operacao em `monitoring`.
4. Power BI conecta no PostgreSQL e consome `marts` + `monitoring`.
5. API FastAPI (opcional) permite consultas SQL read-only para suporte de analise.
