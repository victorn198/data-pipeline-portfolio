# Report Spec

## Report identity

- Report name: Open Source Data Engineering Landscape
- Semantic model: local PostgreSQL view `mart.vw_powerbi_repositories`
- Audience: hiring managers and prospective analytics clients
- Primary purpose: demonstrate API ingestion, SQL treatment, semantic modeling, DAX, and clear Power BI communication
- Delivery target: local PBIP committed to the portfolio repository

## Scope and decisions

- One FHD page with two inline slicers, one composite KPI strip, one ranking chart, and one detail table.
- Data source is a live snapshot of 100 public GitHub repositories returned by `topic:data-engineering stars:>100`.
- Publishing to Power BI Service is outside this build.
- Design direction: clean, restrained, light surface inspired by the supplied reference without copying its brand.

## Canonical design contract

```yaml
Design Brief:
  generated_by: powerbi-report-design
  contract_version: 1
  mode: greenfield
  design_identity:
    tone: Corporate Cool with a minimal restrained surface
    signature: Single cyan accent on the composite KPI strip and primary ranking bars
  color_map:
    primary: "#087EA4"
    ink: "#172554"
    muted: "#64748B"
    surface: "#F8FAFC"
    container: "#FFFFFF"
    border: "#E2E8F0"
  typography:
    display: Segoe UI Semibold
    body: Segoe UI
  pages:
    - name: Open Source Data Engineering Landscape
      role: landing
      archetype: Analytical Canvas
      layout_variant: B
      variant_rationale: Two low-cardinality slicers fit inline while the 100-repository dataset needs a ranking chart and a precise detail table.
      layout_contract:
        canvas: { width: 1920, height: 1080, margin: 32, gutter: 24, snap: 8 }
        grid:
          columns: 12
          rows: 12
          regions:
            header: [1, 1, 9, 2]
            filters: [9, 1, 13, 2]
            kpis: [1, 2, 13, 4]
            ranking: [1, 4, 6, 13]
            details: [6, 4, 13, 13]
        placements:
          - id: page_title
            region: header
            kind: textbox
            text: Open Source Data Engineering Landscape
          - id: language_filter
            region: filters
            kind: slicer
            purpose: Filter the complete page by primary programming language
            field_bindings: Repositories[Language]
          - id: status_filter
            region: filters
            kind: slicer
            purpose: Filter the complete page by repository activity status
            field_bindings: Repositories[Activity Status]
          - id: portfolio_kpis
            region: kpis
            kind: cardVisual
            purpose: Show repository count, total stars, total forks, and open issues in one coherent KPI strip
            field_bindings: Repositories[# Repositories], Repositories[Total Stars], Repositories[Total Forks], Repositories[# Open Issues]
          - id: stars_by_language
            region: ranking
            kind: barChart
            purpose: Rank programming languages by total community interest
            field_bindings: Category=Repositories[Language]; Y=Repositories[Total Stars]
          - id: repository_details
            region: details
            kind: tableEx
            purpose: Provide precise repository-level evidence behind the summary
            field_bindings: Repositories[Repository], Repositories[Owner], Repositories[Language], Repositories[Stars], Repositories[Forks], Repositories[Open Issues], Repositories[Activity Status]
        space_audit:
          content_cell_count: 132
          placed_cell_count: 124
          empty_cell_pct: 6
          unplaced_regions: []
          largest_region: { name: details, pct_of_content: 48 }
          balance_rationale: The detail table receives the largest area because repository-level proof is central to a portfolio case, while ranking and KPI context remain immediately scannable.
  accessibility:
    contrast: WCAG AA for all text and data marks
    tab_order: title, language filter, status filter, KPI strip, ranking, detail table
    alt_text: Every data visual states its analytical question
```

## Validation

- Validate PBIR structure with `powerbi-report-author validate`.
- Open the PBIP in Power BI Desktop, refresh the PostgreSQL model, and review an FHD screenshot.
- Compare the visible totals with `sql/003_validation_queries.sql`.
