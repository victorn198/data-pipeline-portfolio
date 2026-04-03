# PROGRESS_LOG.md

Checkpoint oficial para retomar o projeto sem perda de contexto.
Data de referencia: 2026-02-16.

## Estado atual (confirmado)

- Carga RAW com API real + amplificacao executada com sucesso:
  - `RAW.CUSTOMERS_RAW`: 10000
  - `RAW.PRODUCTS_RAW`: 2000
  - `RAW.ORDERS_RAW`: 100000
- Pipeline dbt validado:
  - `dbt run --full-refresh`: PASS
  - `dbt test`: PASS (39 testes)
- Qualidade validada no Snowflake:
  - Chaves nulas criticas: 0
  - Duplicidades por chave de negocio: 0
  - Orfaos na fato: 0
  - Pedido com data futura: 0
  - Divergencia de `total_amount` vs `quantity * unit_price`: 0

## O que foi implementado nesta fase

1. Integracao real com API (Fake Store) no lugar do simulador local:
- `fivetran_simulator/extract_customers.py`
- `fivetran_simulator/extract_products.py`
- `fivetran_simulator/extract_orders.py`
- `scripts/loadsampledata.py`

2. Escala de volume "empresa" com parametros:
- `FAKESTORE_TARGET_CUSTOMERS` (default 10000)
- `FAKESTORE_TARGET_PRODUCTS` (default 2000)
- `FAKESTORE_TARGET_ORDER_LINES` (default 100000)
- `FAKESTORE_INSERT_BATCH_SIZE` (default 5000)
- `FAKESTORE_RANDOM_SEED` (default 42)

3. Tratamento profissional em staging:
- `dbtproject/models/staging/stg_customers.sql`
- `dbtproject/models/staging/stg_products.sql`
- `dbtproject/models/staging/stg_orders.sql`

4. Testes adicionais de qualidade:
- `dbtproject/tests/assert_no_future_orders.sql`
- `dbtproject/tests/assert_order_amount_consistency.sql`
- `dbtproject/tests/assert_valid_customer_email.sql`

5. Snapshot nativo no Snowflake (SCD2) para clientes:
- Tabela: `ANALYTICS.SNAPSHOTS.CUSTOMERS_SCD2`
- Procedure: `ANALYTICS.SNAPSHOTS.SP_REFRESH_CUSTOMERS_SCD2()`
- Task diaria: `ANALYTICS.SNAPSHOTS.TASK_REFRESH_CUSTOMERS_SCD2_DAILY`
  - Schedule: `USING CRON 55 23 * * * America/Sao_Paulo`
  - Estado: `started`
- Views:
  - `ANALYTICS.SNAPSHOTS.VW_CUSTOMERS_SCD2_CURRENT`
  - `ANALYTICS.SNAPSHOTS.VW_CUSTOMERS_SCD2_HISTORY`

6. Integracao do snapshot nativo ao dbt:
- Source adicionada em `dbtproject/models/schema/schema.yml` (`snapshots_native`)
- Model de staging criado:
  - `dbtproject/models/staging/stg_customers_snapshot_current.sql`

7. Snapshot antigo do dbt desativado para evitar duplicidade de estrategia:
- `dbtproject/snapshots/customers_snapshot.sql` com `enabled=False`

8. Pipeline shell atualizado para nao chamar `dbt snapshot`:
- `scripts/run_pipeline.sh`

9. Aviso deprecado do dbt resolvido:
- Removido `config.send_anonymous_usage_stats` de `dbtproject/profiles.yml`
- Adicionado em `dbtproject/dbt_project.yml`:
  - `flags.send_anonymous_usage_stats: false`

## Como validar rapidamente (comandos)

Na raiz do repo:

```bash
python scripts/loadsampledata.py
```

No diretorio `dbtproject`:

```bash
..\venv\Scripts\dbt.exe run --full-refresh --no-partial-parse
..\venv\Scripts\dbt.exe test --no-partial-parse
```

## Consultas uteis no Snowflake

```sql
select count(*) from ANALYTICS.SNAPSHOTS.CUSTOMERS_SCD2;
select count(*) from ANALYTICS.SNAPSHOTS.VW_CUSTOMERS_SCD2_CURRENT;
select count(*) from ANALYTICS.SNAPSHOTS.VW_CUSTOMERS_SCD2_HISTORY where snapshot_state='historical';
show tasks like 'TASK_REFRESH_CUSTOMERS_SCD2_DAILY' in schema ANALYTICS.SNAPSHOTS;
```

## Proximos passos planejados (ainda nao executados)

- [x] Criar auditoria automatica de qualidade no Snowflake (`DATA_QUALITY_AUDIT`).
  - Script: `scripts/setup_data_quality_audit.sql`
  - Objetos: tabela de auditoria, procedure de validacao, view de ultimo status e task horaria
- [x] Criar alerta operacional para falhas de qualidade.
  - Script: `scripts/setup_data_quality_alerting.sql`
  - Objetos: tabela de alertas, procedure de deteccao, view de alertas abertos e task encadeada
- [x] Ajustar carga para modo incremental operacional (sem recriar RAW toda execucao).
  - `scripts/loadsampledata.py` com modos `incremental` (padrao) e `full_refresh`
  - `fivetran_simulator/extract_customers.py` incremental por `CUSTOMER_ID`
  - `fivetran_simulator/extract_products.py` incremental por `PRODUCT_ID`
  - `fivetran_simulator/extract_orders.py` incremental por `ORDER_ID`
- [x] Publicar base operacional para dashboard (Power BI) com metricas de carga, SCD2 e qualidade.
  - Script: `scripts/setup_operational_monitoring_views.sql`
  - Schema de consumo: `ANALYTICS.MONITORING`
  - Guia de publicacao: `power_bi/README.md`
- [x] Documentar setup MCP para desenvolvimento de medidas no Power BI.
  - Guia: `docs/MCP_POWERBI_AGENT_SETUP.md`
  - Estrategia: `pbixray` (metadata local) + `mcpbi` (validacao DAX em modelo vivo)

## Nota de retomada

Na proxima sessao, pedir:
"Leia `PROGRESS_LOG.md` e continue pelos proximos passos planejados."

Checklist de retomada no Zed:
- `docs/ZED_REOPEN_CHECKLIST.md`

---

## Checkpoint extra (2026-02-18) - Power BI em andamento

### O que foi feito hoje

- Sessao MCP `pbixray` foi recarregada e validada.
- Estrutura do modelo operacional foi confirmada:
  - Tabelas principais: `kpi_ops`, `dq_latest`, `dq_runs`, `dq_alerts`, `fct_sales`.
  - Relacionamentos essenciais da fato com dimensoes validados.
- Medidas operacionais e de vendas foram definidas e organizadas no Desktop/Tabular em uma tabela de medidas dedicada:
  - Pastas: `01 Ops KPIs`, `02 Data Quality`, `03 Sales`.
- Pagina `Pipeline Operations` montada com:
  - Cards operacionais (volumes RAW e status DQ).
  - Tabela de qualidade por regra.
  - Tabela de alertas.
  - Serie temporal de runs DQ.
- Estado atual dos dados operacionais observado no dashboard:
  - `Open Alerts Count = 0`.
  - Regras de qualidade no recorte atual sem falhas (valores `FAILED_* = 0` nos runs exibidos).

### Decisao de versionamento (importante)

- Conteudo de `power_bi/` foi mantido fora do Git temporariamente para evitar commit parcial durante a construcao do dashboard.
- Regras adicionadas no `.gitignore` para ignorar artefatos de Power BI ate fechamento da fase.

### Proxima retomada (ordem sugerida)

1. Finalizar as paginas restantes do dashboard:
   - `Sales Overview`
   - `Revenue Trends`
   - `Customer Segmentation`
   - `Product Performance`
2. Revisar padrao visual e navegacao entre paginas.
3. Validar medidas finais com casos de filtro reais.
4. Somente apos fechamento visual/funcional:
   - remover excecao temporaria de `power_bi/` no `.gitignore` (se desejar versionar o conteudo),
   - commitar pacote final do BI.

### Prompt de retomada recomendado

```text
Leia PROGRESS_LOG.md e continue do checkpoint 2026-02-18, finalizando as 4 paginas restantes do dashboard Power BI.
```

---

## Checkpoint extra (2026-02-19) - Preparacao tecnica das 4 paginas de vendas

### O que foi feito hoje

- Sessao `pbixray` recarregada e `power_bi/sales_dashboard.pbix` validado.
- Modelo confirmado com tabelas de negocio (`fct_sales`, `dim_customer`, `dim_product`) e operacionais (`kpi_ops`, `dq_latest`, `dq_runs`, `dq_alerts`).
- Pacote de medidas para as paginas pendentes foi expandido em:
  - `power_bi/pipeline_operations_measures.dax`
- Governanca de medidas/documentacao iniciada com:
  - `docs/MEASURE_DICTIONARY.md`
  - `docs/POWER_BI_BUILD_LOG.md`

### Estado atual

- Pagina `Pipeline Operations` continua pronta.
- As 4 paginas restantes continuam pendentes no layout visual do Desktop, mas agora com medidas base preparadas:
  - `Sales Overview`
  - `Revenue Trends`
  - `Customer Segmentation`
  - `Product Performance`

### Proxima retomada (ordem sugerida)

1. Importar/validar as novas medidas no `.pbix` na tabela `Medidas`.
2. Construir os visuais das 4 paginas usando as medidas novas.
3. Validar comportamento de filtros (data, cliente, produto/categoria).
4. Revisar navegacao/tema e fechar pacote para decisao de versionamento de `power_bi/`.

### Prompt de retomada recomendado

```text
Leia PROGRESS_LOG.md e docs/POWER_BI_BUILD_LOG.md e continue finalizando o layout e a validacao das 4 paginas de vendas no Power BI Desktop.
```

---

## Checkpoint extra (2026-02-22) - Sales Overview estabilizada + padrao Tabular Editor 2

### O que foi feito hoje

- Importacao de medidas em `03 Sales` confirmada no modelo `sales_dashboard.pbix`.
- Pagina `Sales Overview` ajustada com nomenclatura em ingles e slicers principais:
  - `Date`
  - `Category`
  - `City` (campo `STATE` foi identificado como ZIP/postal code, nao estado geografico)
- Problemas de calculo temporal resolvidos:
  - Erro de `DATEADD` sobre `fct_sales[ORDER_DATE]` com datas duplicadas.
  - Casos de `(Blank)` e `0,00%` em cards por ancoragem incorreta em datas sem vendas.
- Calendario tecnico consolidado:
  - `dCalendar` marcada como Date Table.
  - Colunas de apoio em `dCalendar`: `YearMonth`, `YearMonthSort`.
  - Ordenacao de `YearMonth` por `YearMonthSort`.
  - Eixo de tendencia migrado para `YearMonth` (mensal), reduzindo ruido diario.
- KPI de crescimento estabilizado para demo executiva:
  - Troca de foco dos cards de `MoM %` para crescimento rolling:
    - `Sales 30D Growth %`
    - `Orders 30D Growth %`
  - Medidas rolling ancoradas no **ultimo dia com dado dentro do filtro atual** (`ALLSELECTED`), evitando blank quando o slicer inclui datas futuras no calendario.

### Medidas consolidadas nesta sessao (03 Sales)

- `Sales 30D`
- `Sales Previous 30D`
- `Sales 30D Growth %`
- `Orders 30D`
- `Orders Previous 30D`
- `Orders 30D Growth %`

### Estado atual da pagina Sales Overview

- Cards funcionando e sem blanks no contexto padrao.
- Visual principal funcionando com:
  - Coluna: `Sales Amount`
  - Linha: `Sales Amount Previous Period`
  - Eixo: `dCalendar[YearMonth]`
- Pendencia opcional de UX:
  - Definir bookmark de abertura com recorte padrao (ex.: ultimos 13 meses) sem travar o slicer.

### Padrao operacional registrado para Tabular Editor 2

- Guia dedicado criado: `docs/TABULAR_EDITOR_2_RUNBOOK.md`
- Scripts em lote devem ser executados na aba `C# Script` (TE2).
- Evitar local function (`void Upsert(...)`) no script, pois gera erro de compilacao no ambiente atual.
- Padrao recomendado: `FirstOrDefault` + `AddMeasure` por medida, definindo:
  - `Expression`
  - `DisplayFolder = "03 Sales"`
  - `FormatString` quando aplicavel
- Fluxo de aplicacao:
  1. `Run Script`
  2. `Ctrl+S` no Tabular Editor
  3. Validacao imediata dos visuais no Desktop

### Proxima retomada (ordem sugerida)

1. Finalizar pagina `Revenue Trends` (layout e validacao com `dCalendar`).
2. Finalizar pagina `Customer Segmentation`.
3. Finalizar pagina `Product Performance`.
4. Revisao final de navegacao/tema e decisao de versionamento de `power_bi/`.

### Prompt de retomada recomendado

```text
Leia PROGRESS_LOG.md e docs/POWER_BI_BUILD_LOG.md e continue a partir do checkpoint 2026-02-22, finalizando Revenue Trends, Customer Segmentation e Product Performance com padrao dCalendar e Tabular Editor 2.
```

---

## Checkpoint extra (2026-03-03) - Migracao de Snowflake para PostgreSQL

### Objetivo desta sessao

- Remover dependencia de trial Snowflake e manter a mesma arquitetura SQL do projeto.

### O que foi migrado

1. Ingestao RAW (Python):
- `scripts/loadsampledata.py` migrado de `snowflake.connector` para `psycopg2`.
- `fivetran_simulator/extract_customers.py` migrado para PostgreSQL.
- `fivetran_simulator/extract_products.py` migrado para PostgreSQL.
- `fivetran_simulator/extract_orders.py` migrado para PostgreSQL.
- Mantido comportamento incremental por IDs.

2. Infra local:
- `docker-compose.yml` adicionado com `postgres:16`.
- `scripts/setup_postgres.sql` adicionado para criar schemas-base.

3. dbt:
- `dbtproject/profiles.yml` alterado para `type: postgres`.
- SQL de staging adaptado para Postgres:
  - remoção de `QUALIFY`, `IFF`, `REGEXP_LIKE`, `TIMESTAMP_NTZ`, `TRY_TO_TIMESTAMP_NTZ`.
- `dbtproject/models/intermediate/int_orders_enhanced.sql`:
  - `datediff` ajustado para sintaxe Postgres.
- `dbtproject/tests/assert_valid_customer_email.sql`:
  - regex ajustada (`!~`).
- `dbtproject/models/schema/schema.yml`:
  - source `raw` atualizado para Postgres.
  - removida dependencia de source `snapshots_native`.
- `dbtproject/snapshots/customers_snapshot.sql`:
  - `enabled=True` (snapshot dbt reativado).
- `dbtproject/models/staging/stg_customers_snapshot_current.sql`:
  - desabilitado para nao quebrar parsing.
- `dbtproject/models/marts/fct_sales.sql`:
  - incremental strategy ajustada para `delete+insert`.

4. Qualidade e monitoramento SQL:
- `scripts/setup_data_quality_audit.sql` reescrito para PostgreSQL (table + function + view).
- `scripts/setup_data_quality_alerting.sql` reescrito para PostgreSQL (table + function + view).
- `scripts/setup_operational_monitoring_views.sql` reescrito para PostgreSQL (views em `monitoring`).

5. CI e docs:
- `.github/workflows/dbt_run.yml` atualizado para usar service PostgreSQL no GitHub Actions.
- `README.md`, `README.pt.md`, `SETUP_GUIDE.md`, `RUNBOOK.md` atualizados para PostgreSQL.
- `test_snowflake.py` removido e `test_postgres.py` adicionado.
- Arquivo legado inseguro removido: `scripts/scripts/loadsampledata.py` (credenciais hardcoded).

### Novo fluxo recomendado

1. `docker compose up -d`
2. `python scripts/loadsampledata.py --mode full_refresh`
3. `cd dbtproject && dbt deps && dbt run --full-refresh && dbt snapshot && dbt test`
4. Executar scripts SQL de qualidade/monitoramento em `scripts/`.

### Proxima retomada sugerida

1. Validar fim-a-fim local com Postgres (carga + dbt + qualidade + monitoring).
2. Reapontar o Power BI para PostgreSQL (`marts` e `monitoring`).
3. Continuar fechamento visual das paginas pendentes:
   - `Revenue Trends`
   - `Customer Segmentation`
   - `Product Performance`

---

## Checkpoint extra (2026-03-04) - Execucao fim-a-fim validada em PostgreSQL local

### Ambiente desta validacao

- PostgreSQL 16.13 instalado localmente (Windows), porta `5433`.
- Banco: `analytics`
- Usuario: `postgres`

### Execucoes realizadas com sucesso

1. Setup base:
- `scripts/setup_postgres.sql` aplicado.

2. Carga RAW:
- `python scripts/loadsampledata.py --mode full_refresh`
- Resultado:
  - `raw.customers_raw`: 10000
  - `raw.products_raw`: 2000
  - `raw.orders_raw`: 100000

3. Pipeline dbt:
- `dbt deps`: PASS
- `dbt run --full-refresh --no-partial-parse --threads 1`: PASS
- `dbt snapshot --no-partial-parse --threads 1`: PASS
- `dbt test --no-partial-parse --threads 1`: PASS (`33` testes)

4. Observabilidade:
- Scripts aplicados:
  - `scripts/setup_data_quality_audit.sql`
  - `scripts/setup_data_quality_alerting.sql`
  - `scripts/setup_operational_monitoring_views.sql`
- Execucao manual:
  - `select data_quality.sp_run_data_quality_audit();` -> `Failed rules=0`
  - `select data_quality.sp_process_data_quality_alerts();` -> sem alertas de erro
- KPI operacional verificado:
  - `monitoring.vw_pipeline_operational_kpis` com `open_alerts_count = 0`

### Ajustes tecnicos finais aplicados na sessao

- `dbtproject/profiles.yml`: fallback de porta ajustado para `5433` no ambiente local.
- `dbtproject/models/schema/schema.yml`: identifiers de source RAW em minusculo (`customers_raw`, `products_raw`, `orders_raw`).
- schemas de models em minusculo (`staging`, `intermediate`, `marts`) para compatibilidade com Postgres.
- `dbtproject/dbt_project.yml`: `staging` materializado como `table` para evitar travamentos por lock/recomputacao durante build.

### Proxima retomada sugerida

1. Reapontar dataset do Power BI para PostgreSQL (`marts` e `monitoring`).
2. Validar refresh no Power BI e consistencia de medidas.
3. Finalizar layout das paginas pendentes:
   - `Revenue Trends`
   - `Customer Segmentation`
   - `Product Performance`

---

## Checkpoint extra (2026-03-04) - Limpeza critica, hardening e padronizacao

### Limpeza aplicada

- Removido arquivo sensivel legado: `.env.snowflake`.
- Removido artefato externo sem relacao com o projeto: `openapi.json`.
- Removido launcher legado: `script_uvicorn.txt`.
- `.gitignore` limpo de entradas Snowflake obsoletas.

### Hardening e otimizacao tecnica

- `mcp_tools/mcp_server_fastapi.py` migrado de Snowflake para PostgreSQL.
- Endpoint `/execute_sql` agora:
  - usa variaveis `POSTGRES_*`
  - usa cursor `RealDictCursor`
  - restringe consultas para `SELECT`/`WITH` (read-only)
  - retorna `row_count` + `data` com tratamento de erro consistente
- `scripts/run_pipeline.sh` normalizado (mensagens ASCII e execucao limpa).

### Documentacao atualizada para estado real (PostgreSQL)

- `README.md`
- `README.pt.md`
- `RUNBOOK.md`
- `SETUP_GUIDE.md`
- `power_bi/README.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_LINEAGE.md`
- `docs/DEPLOYMENT.md`
- `docs/ZED_REOPEN_CHECKLIST.md`

### Resultado operacional apos limpeza

- `python test_postgres.py`: PASS
- `dbt debug`: PASS
- `dbt run --threads 1`: PASS
- `dbt test --threads 1`: PASS (33/33)

### Observacao

- O projeto agora esta coerente com PostgreSQL fim-a-fim em codigo, operacao e documentacao.

---

## Checkpoint extra (2026-03-07) - Dashboard programavel multi-fonte + IA

### Entrega principal

Novo modulo `programmable_dashboard/` implementado para demonstrar analytics por codigo, complementar ao Power BI:

- `app.py`: dashboard Streamlit com filtros, KPIs e graficos.
- `data_source.py`: acesso de dados agnostico a banco (via `DATABASE_URL`) ou arquivos locais.
- `analytics.py`: camada numerica (KPIs, tendencia mensal, top dimensoes).
- `hf_analyzer.py`: analise narrativa via Hugging Face com fallback local.

### Funcionalidades de engenharia

- Troca de banco sem alterar regras de negocio (SQLAlchemy + env vars).
- Modo local para demos offline (`DASHBOARD_SOURCE_MODE=local`).
- Exportador do banco para arquivos locais:
  - `scripts/export_dashboard_local_data.py`
- Runner dedicado:
  - `scripts/run_programmable_dashboard.ps1`

### Configuracao adicionada

- `.env.example` atualizado com variaveis de dashboard e IA.
- `requirements.txt` atualizado com:
  - `streamlit==1.39.0`
  - `plotly==5.24.1`
  - `SQLAlchemy==2.0.35`

### Validacao executada

- `python -m compileall programmable_dashboard` -> PASS
- Health check database mode -> PASS
- Carregamento `marts.fct_sales + dims` -> PASS
- Export local `scripts/export_dashboard_local_data.py` -> PASS
- Leitura em modo local (`data/local`) -> PASS

### Documentacao atualizada

- `docs/PROGRAMMABLE_DASHBOARD.md`
- `README.md`
- `README.pt.md`

---

## Checkpoint extra (2026-03-08) - Frente programada desacoplada de Power BI

### Decisao

- Esta frente passa a ser 100% programada e independente de Power BI.
- O Power BI segue em trilha separada.

### Stack de futuro escolhida

- Interface: `streamlit`
- Visualizacao: `plotly`
- Dados: `sqlalchemy` + `pandas`
- IA: `huggingface_hub` + `litellm` (provider-agnostic)

### Ajustes tecnicos aplicados

- `programmable_dashboard/hf_analyzer.py` refatorado para `AI_PROVIDER` (`huggingface` ou `litellm`).
- `programmable_dashboard/app.py` atualizado para novo analisador.
- `.env.example` expandido com variaveis `AI_*`.
- `requirements.txt` atualizado com `litellm==1.74.9`.
- Documentacao criada/atualizada:
  - `docs/AI_INTERFACE_STACK.md`
  - `docs/PROGRAMMABLE_DASHBOARD.md`
  - `README.md`
  - `README.pt.md`

### Validacao

- `python -m compileall programmable_dashboard` -> PASS
- smoke test do analisador IA (fallback) -> PASS

---

## Checkpoint extra (2026-03-08) - Design system extraido de screenshots (3 temas)

### Objetivo desta sessao

- Converter 3 referencias visuais em um design system reutilizavel sem aplicar tema ainda no app.

### Entregas implementadas

1. Pacote de design system criado em `programmable_dashboard/design_system/`:
- `theme_01_channel_analytics.tokens.json`
- `theme_01_channel_analytics.css`
- `theme_02_controllr_glass.tokens.json`
- `theme_02_controllr_glass.css`
- `theme_03_morning_frost.tokens.json`
- `theme_03_morning_frost.css`
- `SCREENSHOT_TO_CODE_NOTES.md`
- `README.md`

2. Loader tecnico adicionado:
- `programmable_dashboard/theme.py`
  - `list_theme_names()`
  - `read_theme_tokens(theme_name)`
  - `apply_theme(theme_name)`

3. Exports do pacote atualizados:
- `programmable_dashboard/__init__.py`

4. Documentacao atualizada:
- `docs/PROGRAMMABLE_DASHBOARD.md`

### Status

- Design system pronto para aplicar tema por tema quando solicitado.
- Nenhum tema foi ativado por padrao no `app.py` nesta etapa.

---

## Checkpoint extra (2026-03-08) - screenshot-to-code com Gemini + refactor de UX no app

### Objetivo desta sessao

- Usar `abi/screenshot-to-code` de forma real com Gemini e corrigir a UX do dashboard programavel.

### Entregas implementadas

1. Integracao screenshot-to-code:
- Repo clonado em `tools/screenshot-to-code`.
- Runner de extracao criado:
  - `scripts/extract_design_with_s2c.py`
- Referencias de design geradas a partir de 3 screenshots:
  - `programmable_dashboard/design_system/s2c_output/s2c_reference_01.html`
  - `programmable_dashboard/design_system/s2c_output/s2c_reference_02.html`
  - `programmable_dashboard/design_system/s2c_output/s2c_reference_03.html`

2. Dashboard UX refatorado:
- `programmable_dashboard/app.py` reescrito com:
  - navegacao lateral por pagina (substitui tabs horizontais),
  - filtros dedicados por pagina,
  - estilo dos graficos Plotly alinhado ao tema ativo.

3. Ajustes de tema visual:
- `programmable_dashboard/design_system/theme_02_controllr_glass.css` ajustado para:
  - menu lateral estilo navegacao,
  - selecao visual ativa no radio de paginas.

4. Documentacao:
- `docs/PROGRAMMABLE_DASHBOARD.md` atualizado com:
  - novo modelo de navegacao/filtros por pagina,
  - comando oficial de extracao screenshot-to-code.

### Validacao

- `python -m compileall programmable_dashboard/app.py` -> PASS
- `python -m compileall scripts/extract_design_with_s2c.py` -> PASS
