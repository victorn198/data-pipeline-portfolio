# POWER BI Build Log

## 2026-02-19 - Retomada do checkpoint 2026-02-18

### Contexto de entrada

- Fonte de retomada: `PROGRESS_LOG.md` (checkpoint extra de 2026-02-18).
- Pendente principal: concluir 4 paginas do dashboard:
  - `Sales Overview`
  - `Revenue Trends`
  - `Customer Segmentation`
  - `Product Performance`

### Validacoes executadas

- `pbixray` carregado com sucesso para `power_bi/sales_dashboard.pbix`.
- Estrutura do modelo confirmada:
  - Tabelas: `fct_sales`, `dim_customer`, `dim_product`, `kpi_ops`, `dq_latest`, `dq_runs`, `dq_alerts`.
  - Tabela de medidas: `Medidas`.
- Medidas existentes revisadas e usadas como baseline.

### Entregas desta sessao

1. Expansao de medidas em `power_bi/pipeline_operations_measures.dax` cobrindo as 4 paginas pendentes.
2. Criacao de `docs/MEASURE_DICTIONARY.md` para governanca das medidas (descricao e uso).
3. Registro formal desta sessao neste arquivo.

### Medidas adicionadas (resumo)

- Sales Overview:
  - `Sales Amount Previous Period`
  - `Sales Amount MoM %`
  - `Orders Previous Period`
  - `Orders MoM %`
  - `Average Items Per Order`

- Revenue Trends:
  - `Sales Amount MTD`
  - `Sales Amount QTD`
  - `Sales Amount YTD`
  - `Sales Amount Last 30 Days`
  - `Sales Amount Last 90 Days`
  - `Sales Amount 7D Moving Avg`

- Customer Segmentation:
  - `Customers Active Last 30D`
  - `Customers Active Last 90D`
  - `Repeat Customers Count`
  - `Repeat Customer Rate %`
  - `New Customers Count`
  - `Returning Customers Count`

- Product Performance:
  - `Products Sold (Distinct)`
  - `Average Unit Price`
  - `Top Product Sales Amount`
  - `Top Product Name`
  - `Top Category Sales Amount`
  - `Sales Share %`

### Proxima acao recomendada no Desktop

1. Importar/colar as novas medidas no modelo `sales_dashboard.pbix` (tabela `Medidas`).
2. Montar visuais das 4 paginas com slicers padrao por data, categoria e estado.
3. Validar filtros cruzados entre `fct_sales`, `dim_customer` e `dim_product`.
4. Revisar navegacao/tema e fechar pacote final para decisao de versionamento de `power_bi/`.

### Risco/observacao tecnica

- As medidas de inteligencia temporal usam `fct_sales[ORDER_DATE]`.
- Melhor pratica futura: adotar dimensao calendario dedicada marcada como Date Table para padronizar YTD/MTD/QTD.

## 2026-02-22 - Estabilizacao de Sales Overview + execucao em lote via Tabular Editor 2

### Problemas encontrados

- `DATEADD` aplicado direto em `fct_sales[ORDER_DATE]` gerou erro de datas duplicadas.
- Em cenarios de slicer amplo, cards de crescimento ficaram com `(Blank)` ou `0,00%` por referencia em datas de calendario sem venda.
- Tentativa inicial de script com local function em C# Script falhou no ambiente do Tabular Editor 2.

### Decisoes tecnicas aplicadas

1. Tempo e visual:
   - Uso de `dCalendar` como base temporal.
   - Eixo dos graficos migrado para `dCalendar[YearMonth]` (ordenado por `YearMonthSort`).
2. KPI de crescimento:
   - Cards principais migrados para rolling `30D vs previous 30D`.
   - Ancoragem em `EndDateWithData` via `ALLSELECTED(dCalendar[Date])` para usar o ultimo dia com dado no filtro atual.
3. Governanca de medidas:
   - Medidas mantidas na pasta `03 Sales` (sem subpastas novas).
4. Execucao em lote:
   - Script TE2 em `C# Script` com padrao por medida (`FirstOrDefault` + `AddMeasure`).
   - Aplicacao via `Run Script` + `Ctrl+S`.
   - Runbook registrado em `docs/TABULAR_EDITOR_2_RUNBOOK.md`.

### Medidas criadas/ajustadas para o estado atual

- `Sales 30D`
- `Sales Previous 30D`
- `Sales 30D Growth %`
- `Orders 30D`
- `Orders Previous 30D`
- `Orders 30D Growth %`

### Estado da pagina Sales Overview ao final desta sessao

- KPIs renderizando corretamente (sem blank no contexto padrao).
- Visual combinado mensal funcionando:
  - Colunas: `Sales Amount`
  - Linha: `Sales Amount Previous Period`
  - Eixo: `dCalendar[YearMonth]`
- Slicers em ingles:
  - `Date`
  - `Category`
  - `City`

### Proximas acoes

1. Repetir o mesmo padrao temporal (`dCalendar`) na pagina `Revenue Trends`.
2. Completar layout/validacao de `Customer Segmentation`.
3. Completar layout/validacao de `Product Performance`.
4. Fechar revisao visual de navegacao e padrao de filtros.
