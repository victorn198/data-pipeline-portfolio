# Tabular Editor 2 Runbook (Padrao do Projeto)

Objetivo: aplicar medidas em lote sem erro de compilacao no `sales_dashboard.pbix`.

## Fluxo correto (sempre)

1. Abra o PBIX no Power BI Desktop.
2. Clique em `External tools` -> `Tabular Editor`.
3. No Tabular Editor 2, use a aba `C# Script` (nao usar Expression Editor para script).
4. Execute o script (`Run Script`).
5. Salve no Tabular Editor (`Ctrl+S`).
6. Volte ao Power BI e valide os visuais.

## Regras obrigatorias para script no TE2

- Nao usar local function (`void Upsert(...) {}`), pois o ambiente atual nao compila esse padrao.
- Usar padrao explicito por medida:
  - `FirstOrDefault(...)`
  - `if (m == null) AddMeasure(...)`
  - `m.Expression = ...`
  - `m.DisplayFolder = "03 Sales"` (ou pasta alvo)
  - `m.FormatString = ...` quando necessario

## Template compativel (copiar e adaptar)

```csharp
var t = Model.Tables["Medidas"];
var folder = "03 Sales";

var m = t.Measures.FirstOrDefault(x => x.Name == "Nome da Measure");
if (m == null) m = t.AddMeasure("Nome da Measure", "");
m.Expression =
@"-- DAX aqui";
m.DisplayFolder = folder;
m.FormatString = "0.00%"; // opcional
```

## Checklist pos-script (30 segundos)

1. A measure aparece na tabela `Medidas`.
2. `Display Folder` correto (`01 Ops KPIs`, `02 Data Quality`, `03 Sales`).
3. Formato correto (percentual/moeda).
4. Visual nao ficou `(Blank)` sem motivo.
5. Slicer de data usa `dCalendar[Date]`.

## Erros comuns e causa raiz

- `CS1547` / `CS1525` em `void`/`string`:
  - Script com local function nao suportada no contexto atual.
- `DATEADD` com coluna da fato:
  - Uso de coluna com datas duplicadas (ex.: `fct_sales[ORDER_DATE]`).
  - Solucao: usar `dCalendar[Date]`.
- Card com crescimento em branco:
  - Medida ancorada em maximo da tabela calendario (data sem venda).
  - Solucao: ancorar no ultimo dia com dado no contexto atual (`ALLSELECTED`).
