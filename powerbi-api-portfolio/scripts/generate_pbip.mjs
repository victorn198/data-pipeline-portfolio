import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname.replace(/^\/(.:)/, "$1");
const output = join(root, "powerbi", "OpenSourceLandscape");
const modelDir = join(output, "OpenSourceLandscape.SemanticModel");
const reportDir = join(output, "OpenSourceLandscape.Report");
const definitionDir = join(reportDir, "definition");
const pageId = "7a9c20e5d8414f6b93c1";
const themeFile = "OpenSourceClean-4f2a8c1d.json";

const schemas = {
  visual: "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.9.0/schema.json",
  page: "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/page/2.1.0/schema.json",
};

const literal = (value) => ({ expr: { Literal: { Value: value } } });
const color = (value) => ({ solid: { color: literal(`'${value}'`) } });
const column = (property, displayName = property) => ({
  field: {
    Column: {
      Expression: { SourceRef: { Entity: "Repositories" } },
      Property: property,
    },
  },
  queryRef: `Repositories.${property}`,
  nativeQueryRef: displayName,
});
const measure = (property) => ({
  field: {
    Measure: {
      Expression: { SourceRef: { Entity: "Repositories" } },
      Property: property,
    },
  },
  queryRef: `Repositories.${property}`,
  nativeQueryRef: property,
});
const position = (x, y, width, height, z) => ({
  x,
  y,
  z,
  width,
  height,
  tabOrder: z,
});
const titleVco = (text) => ({
  title: [
    {
      properties: {
        show: literal("true"),
        text: literal(`'${text}'`),
        fontColor: color("#172554"),
        fontSize: literal("14D"),
        bold: literal("true"),
        alignment: literal("'left'"),
      },
    },
  ],
});

await rm(output, { recursive: true, force: true });
await mkdir(join(modelDir, "definition", "tables"), { recursive: true });
await mkdir(join(definitionDir, "pages", pageId, "visuals"), { recursive: true });
await mkdir(join(reportDir, "StaticResources", "RegisteredResources"), { recursive: true });

const json = (path, payload) =>
  writeFile(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

await json(join(output, "OpenSourceLandscape.pbip"), {
  $schema: "https://developer.microsoft.com/json-schemas/fabric/pbip/pbipProperties/1.0.0/schema.json",
  version: "1.0",
  artifacts: [{ report: { path: "OpenSourceLandscape.Report" } }],
  settings: { enableAutoRecovery: true },
});

await json(join(modelDir, "definition.pbism"), {
  $schema: "https://developer.microsoft.com/json-schemas/fabric/item/semanticModel/definitionProperties/1.0.0/schema.json",
  version: "4.2",
  settings: { qnaEnabled: true },
});
await json(join(modelDir, ".platform"), {
  $schema: "https://developer.microsoft.com/json-schemas/fabric/gitIntegration/platformProperties/2.0.0/schema.json",
  metadata: { type: "SemanticModel", displayName: "Open Source Landscape" },
  config: { version: "2.0", logicalId: "5d78a51b-7d96-4f24-bb87-410bf5dd2b11" },
});

await writeFile(
  join(modelDir, "definition", "database.tmdl"),
  `database OpenSourceLandscape\n\tcompatibilityLevel: 1702\n\tcompatibilityMode: powerBI\n\tlanguage: 1033\n`,
  "utf8",
);
await writeFile(
  join(modelDir, "definition", "model.tmdl"),
  `model Model\n\tculture: en-US\n\tdefaultPowerBIDataSourceVersion: powerBI_V3\n\tsourceQueryCulture: en-US\n\tdiscourageImplicitMeasures\n\nref table Repositories\n`,
  "utf8",
);

const tableTmdl = `/// Public data-engineering repositories collected from the GitHub API; one row per repository.
table Repositories

\t/// Number of distinct repositories in the active filter context.
\tmeasure '# Repositories' = DISTINCTCOUNT(Repositories[Repository ID])
\t\tformatString: #,##0
\t\tdisplayFolder: Metrics

\t/// Sum of GitHub stars, used as a proxy for community interest.
\tmeasure 'Total Stars' = SUM(Repositories[Stars])
\t\tformatString: #,##0
\t\tdisplayFolder: Metrics

\t/// Sum of repository forks in the active filter context.
\tmeasure 'Total Forks' = SUM(Repositories[Forks])
\t\tformatString: #,##0
\t\tdisplayFolder: Metrics

\t/// Sum of currently open issues reported by GitHub.
\tmeasure '# Open Issues' = SUM(Repositories[Open Issues])
\t\tformatString: #,##0
\t\tdisplayFolder: Metrics

\t/// Share of repositories updated during the last 90 days and not archived.
\tmeasure 'Active Repository Rate' = DIVIDE(CALCULATE([# Repositories], Repositories[Activity Status] = "Active"), [# Repositories])
\t\tformatString: 0.0%
\t\tdisplayFolder: Metrics

\tcolumn 'Repository ID'
\t\tdataType: int64
\t\tisHidden
\t\tsummarizeBy: none
\t\tsourceColumn: repository_id

\t/// Public repository name.
\tcolumn Repository
\t\tdataType: string
\t\tsourceColumn: repository_name

\t/// GitHub owner and repository path.
\tcolumn 'Full Name'
\t\tdataType: string
\t\tsourceColumn: repository_full_name

\t/// GitHub user or organization that owns the repository.
\tcolumn Owner
\t\tdataType: string
\t\tsourceColumn: repository_owner

\t/// Primary programming language reported by GitHub.
\tcolumn Language
\t\tdataType: string
\t\tsourceColumn: language

\t/// Number of users who starred the repository.
\tcolumn Stars
\t\tdataType: int64
\t\tsummarizeBy: none
\t\tsourceColumn: stars

\t/// Number of repository forks.
\tcolumn Forks
\t\tdataType: int64
\t\tsummarizeBy: none
\t\tsourceColumn: forks

\t/// Number of currently open issues reported by GitHub.
\tcolumn 'Open Issues'
\t\tdataType: int64
\t\tsummarizeBy: none
\t\tsourceColumn: open_issues

\tcolumn 'Is Archived'
\t\tdataType: boolean
\t\tisHidden
\t\tsourceColumn: is_archived

\t/// Date when the repository was created.
\tcolumn 'Created Date'
\t\tdataType: dateTime
\t\tformatString: Short Date
\t\tsourceColumn: created_date

\t/// Date of the latest repository update recorded by GitHub.
\tcolumn 'Updated Date'
\t\tdataType: dateTime
\t\tformatString: Short Date
\t\tsourceColumn: updated_date

\tcolumn 'Collected Date'
\t\tdataType: dateTime
\t\tisHidden
\t\tformatString: Short Date
\t\tsourceColumn: collected_date

\t/// Number of days since the latest repository update.
\tcolumn 'Days Since Update'
\t\tdataType: int64
\t\tsummarizeBy: none
\t\tsourceColumn: days_since_update

\t/// Governed status: Active, Stale, or Archived.
\tcolumn 'Activity Status'
\t\tdataType: string
\t\tsourceColumn: activity_status

\tpartition Repositories = m
\t\tmode: import
\t\tsource =
\t\t\tlet
\t\t\t\tSource = PostgreSQL.Database("127.0.0.1:5434", "github_bi"),
\t\t\t\tRepositories = Source{[Schema="mart", Item="vw_powerbi_repositories"]}[Data]
\t\t\tin
\t\t\t\tRepositories
`;
await writeFile(join(modelDir, "definition", "tables", "Repositories.tmdl"), tableTmdl, "utf8");

await json(join(reportDir, "definition.pbir"), {
  $schema: "https://developer.microsoft.com/json-schemas/fabric/item/report/definitionProperties/2.0.0/schema.json",
  version: "4.0",
  datasetReference: { byPath: { path: "../OpenSourceLandscape.SemanticModel" } },
});
await json(join(reportDir, ".platform"), {
  $schema: "https://developer.microsoft.com/json-schemas/fabric/gitIntegration/platformProperties/2.0.0/schema.json",
  metadata: { type: "Report", displayName: "Open Source Landscape" },
  config: { version: "2.0", logicalId: "2f2d44ac-0a98-4fd7-863c-f1f030f1c0bf" },
});
await json(join(definitionDir, "version.json"), {
  $schema: "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/versionMetadata/1.0.0/schema.json",
  version: "2.0.0",
});

const theme = {
  $schema: "https://raw.githubusercontent.com/microsoft/powerbi-desktop-samples/main/Report%20Theme%20JSON%20Schema/reportThemeSchema-2.153.json",
  name: themeFile,
  dataColors: ["#087EA4", "#172554", "#64748B", "#38BDF8", "#94A3B8", "#CBD5E1"],
  good: "#15803D",
  neutral: "#D97706",
  bad: "#DC2626",
  background: "#F8FAFC",
  foreground: "#172554",
  tableAccent: "#087EA4",
  textClasses: {
    callout: { fontSize: 28, fontFace: "Segoe UI Semibold", color: "#172554" },
    title: { fontSize: 14, fontFace: "Segoe UI Semibold", color: "#172554" },
    header: { fontSize: 11, fontFace: "Segoe UI Semibold", color: "#172554" },
    label: { fontSize: 10, fontFace: "Segoe UI", color: "#475569" },
  },
  visualStyles: {
    "*": {
      "*": {
        border: [{ show: true, color: { solid: { color: "#E2E8F0" } }, radius: 6 }],
        dropShadow: [{ show: false }],
        padding: [{ top: 8, bottom: 8, left: 8, right: 8 }],
        visualHeader: [{ show: false }],
      },
    },
    cardVisual: {
      "*": {
        value: [{ bold: true, fontColor: { solid: { color: "#172554" } }, "$id": "default" }],
        label: [{ show: true, fontColor: { solid: { color: "#64748B" } }, "$id": "default" }],
        cardCalloutArea: [{ paddingUniform: 10, backgroundFillColor: { solid: { color: "#FFFFFF" } } }],
        title: [{ show: false }],
      },
    },
    tableEx: {
      "*": {
        columnHeaders: [{ autoSizeColumnWidth: true, columnAdjustment: "growToFit", backColor: { solid: { color: "#EFF6FF" } }, fontColor: { solid: { color: "#172554" } }, bold: true }],
        values: [{ backColorPrimary: { solid: { color: "#FFFFFF" } }, backColorSecondary: { solid: { color: "#F8FAFC" } }, fontColorPrimary: { solid: { color: "#334155" } }, fontColorSecondary: { solid: { color: "#334155" } } }],
      },
    },
    textbox: { "*": { padding: [{ top: 0, bottom: 0, left: 0, right: 0 }], background: [{ show: false }], border: [{ show: false }] } },
    barChart: {
      "*": {
        labels: [{ show: true, fontSize: 10, color: { solid: { color: "#172554" } } }],
        valueAxis: [{ show: false, gridlineShow: false, showAxisTitle: false }],
        categoryAxis: [{ show: true, fontSize: 10, labelColor: { solid: { color: "#475569" } }, showAxisTitle: false, innerPadding: 18, gridlineShow: false }],
        legend: [{ show: false }],
      },
    },
  },
};
await json(join(reportDir, "StaticResources", "RegisteredResources", themeFile), theme);

await json(join(definitionDir, "report.json"), {
  $schema: "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/report/3.3.0/schema.json",
  themeCollection: {
    customTheme: {
      name: themeFile,
      reportVersionAtImport: { visual: "2.6.0", report: "3.1.0", page: "2.3.0" },
      type: "RegisteredResources",
    },
  },
  resourcePackages: [
    {
      name: "RegisteredResources",
      type: "RegisteredResources",
      items: [{ name: themeFile, path: themeFile, type: "CustomTheme" }],
    },
  ],
  settings: { useStylableVisualContainerHeader: true },
});
await json(join(definitionDir, "pages", "pages.json"), {
  $schema: "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/pagesMetadata/1.0.0/schema.json",
  pageOrder: [pageId],
  activePageName: pageId,
});
await json(join(definitionDir, "pages", pageId, "page.json"), {
  $schema: schemas.page,
  name: pageId,
  displayName: "Landscape Overview",
  displayOption: "FitToPage",
  height: 1080,
  width: 1920,
  objects: {
    background: [{ properties: { color: color("#F8FAFC"), transparency: literal("0D") } }],
  },
});

const visuals = [
  {
    id: "01a4b8c2d6e0f3a7b9c1",
    payload: {
      $schema: schemas.visual,
      name: "01a4b8c2d6e0f3a7b9c1",
      position: position(32, 24, 1232, 72, 1000),
      visual: {
        visualType: "textbox",
        objects: {
          general: [{ properties: { paragraphs: [
            { textRuns: [{ value: "Open Source Data Engineering Landscape", textStyle: { fontFamily: "Segoe UI Semibold", fontSize: "28pt", color: "#172554", fontWeight: "bold" } }], horizontalTextAlignment: "left" },
            { textRuns: [{ value: "100 public repositories collected from the GitHub API and governed in PostgreSQL", textStyle: { fontFamily: "Segoe UI", fontSize: "11pt", color: "#64748B" } }], horizontalTextAlignment: "left" },
          ] } }],
        },
        visualContainerObjects: { background: [{ properties: { show: literal("false") } }], border: [{ properties: { show: literal("false") } }], padding: [{ properties: { top: literal("0D"), bottom: literal("0D"), left: literal("0D"), right: literal("0D") } }] },
      },
    },
  },
  {
    id: "12b5c9d3e7f1a4b8c0d2",
    payload: {
      $schema: schemas.visual,
      name: "12b5c9d3e7f1a4b8c0d2",
      position: position(1392, 16, 232, 80, 2000),
      visual: {
        visualType: "slicer",
        query: { queryState: { Values: { projections: [column("Language")] } } },
        objects: { data: [{ properties: { mode: literal("'Dropdown'") } }], header: [{ properties: { show: literal("true"), text: literal("'Language'") } }] },
        visualContainerObjects: { padding: [{ properties: { top: literal("8D"), bottom: literal("8D"), left: literal("8D"), right: literal("8D") } }] },
      },
    },
  },
  {
    id: "23c6d0e4f8a2b5c9d1e3",
    payload: {
      $schema: schemas.visual,
      name: "23c6d0e4f8a2b5c9d1e3",
      position: position(1648, 16, 240, 80, 3000),
      visual: {
        visualType: "slicer",
        query: { queryState: { Values: { projections: [column("Activity Status")] } } },
        objects: { data: [{ properties: { mode: literal("'Dropdown'") } }], header: [{ properties: { show: literal("true"), text: literal("'Activity Status'") } }] },
        visualContainerObjects: { padding: [{ properties: { top: literal("8D"), bottom: literal("8D"), left: literal("8D"), right: literal("8D") } }] },
      },
    },
  },
  {
    id: "34d7e1f5a9b3c6d0e2f4",
    payload: {
      $schema: schemas.visual,
      name: "34d7e1f5a9b3c6d0e2f4",
      position: position(32, 120, 1856, 128, 4000),
      visual: {
        visualType: "cardVisual",
        query: { queryState: { Data: { projections: [measure("# Repositories"), measure("Total Stars"), measure("Total Forks"), measure("# Open Issues")] } } },
        objects: {
          cardCalloutArea: [{ properties: { show: literal("true"), paddingUniform: literal("12L"), rectangleRoundedCurve: literal("6L"), backgroundFillColor: color("#FFFFFF"), backgroundTransparency: literal("0D") } }],
          layout: [{ properties: { style: literal("'Table'"), customizeLines: literal("true"), gridlineWidth: literal("1D"), gridlineColor: color("#E2E8F0"), gridlineTransparency: literal("0D") }, selector: { id: "default" } }],
        },
      },
    },
  },
  {
    id: "45e8f2a6b0c4d7e1f3a5",
    payload: {
      $schema: schemas.visual,
      name: "45e8f2a6b0c4d7e1f3a5",
      position: position(32, 280, 704, 760, 5000),
      visual: {
        visualType: "barChart",
        query: {
          queryState: { Category: { projections: [column("Language")] }, Y: { projections: [measure("Total Stars")] } },
          sortDefinition: { sort: [{ field: measure("Total Stars").field, direction: "Descending" }], isDefaultSort: true },
        },
        objects: { dataPoint: [{ properties: { defaultColor: color("#087EA4"), borderShow: literal("false") } }] },
        visualContainerObjects: titleVco("Community Interest by Language"),
        drillFilterOtherVisuals: true,
      },
    },
  },
  {
    id: "56f9a3b7c1d5e8f2a4b6",
    payload: {
      $schema: schemas.visual,
      name: "56f9a3b7c1d5e8f2a4b6",
      position: position(760, 280, 1128, 760, 6000),
      visual: {
        visualType: "tableEx",
        query: {
          queryState: { Values: { projections: [column("Repository"), column("Owner"), column("Language"), column("Stars"), column("Forks"), column("Open Issues"), column("Activity Status")] } },
          sortDefinition: { sort: [{ field: column("Stars").field, direction: "Descending" }], isDefaultSort: true },
        },
        objects: {
          columnHeaders: [{ properties: { columnAdjustment: literal("'growToFit'"), autoSizeColumnWidth: literal("true") } }],
          values: [{ properties: { backColorPrimary: color("#FFFFFF"), backColorSecondary: color("#F8FAFC"), fontColorPrimary: color("#334155"), fontColorSecondary: color("#334155") } }],
        },
        visualContainerObjects: { ...titleVco("Repository Evidence"), stylePreset: [{ properties: { name: literal("'None'") } }] },
      },
    },
  },
];

for (const visual of visuals) {
  const visualDir = join(definitionDir, "pages", pageId, "visuals", visual.id);
  await mkdir(visualDir, { recursive: true });
  await json(join(visualDir, "visual.json"), visual.payload);
}

console.log(`Generated ${output}`);
