from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

Granularity = Literal["Day", "Month", "Quarter", "Year"]
ScenarioMode = Literal["Base", "Conservative", "Upside"]
PageName = Literal["executive", "sales", "revenue", "marketing", "predictive", "customers", "retention", "products", "operations"]
MetricFormat = Literal["currency", "number", "percent"]
TraceStyle = Literal["line", "bar"]
ViewMode = Literal["overview", "drilldown"]
ProposalTarget = Literal["dashboard", "semantic_layer", "page"]
ProposalStatus = Literal["proposed", "approved", "rejected"]
InteractionType = Literal["filter", "detail"]


class FilterMetadata(BaseModel):
    min_date: str
    max_date: str
    default_start_date: str
    default_end_date: str
    categories: list[str]
    cities: list[str]
    data_engine: str = "pandas"


class KpiCard(BaseModel):
    key: str
    title: str
    value: float
    previous_value: float
    delta_pct: float
    formatted_value: str
    formatted_previous_value: str
    delta_label: str


class TrendPoint(BaseModel):
    period_key: str
    period_label: str
    current_value: float
    previous_value: float | None = None
    delta_pct: float
    baseline_value: float | None = None
    anomaly_score: float | None = None
    is_anomaly: bool = False
    is_structural_shift: bool = False
    shift_score: float | None = None
    shift_direction: str | None = None
    is_projection: bool = False
    lower_bound: float | None = None
    upper_bound: float | None = None


class BreakdownPoint(BaseModel):
    label: str
    raw_label: str | None = None
    current_value: float
    previous_value: float
    delta_pct: float
    share_pct: float | None = None
    previous_share_pct: float | None = None
    share_shift_pct: float | None = None
    cumulative_pct: float | None = None
    segment_class: str | None = None


class BreakdownChartPayload(BaseModel):
    title: str
    x_title: str
    y_title: str
    metric_format: MetricFormat = "number"
    analysis_mode: Literal["comparison", "pareto", "donut"] = "comparison"
    current_series_name: str = "Current"
    previous_series_name: str = "Previous"
    cumulative_series_name: str | None = None
    cumulative_y_title: str | None = None
    current_trace_style: TraceStyle = "bar"
    previous_trace_style: TraceStyle = "bar"
    filter_key: Literal["category", "city"] | None = None
    interaction_type: InteractionType | None = None
    interaction_key: str | None = None
    interaction_label: str | None = None
    points: list[BreakdownPoint] = Field(default_factory=list)


class HeatmapPayload(BaseModel):
    title: str
    x_labels: list[str] = Field(default_factory=list)
    y_labels: list[str] = Field(default_factory=list)
    z_values: list[list[float | None]] = Field(default_factory=list)
    metric_format: MetricFormat = "percent"


class TableColumn(BaseModel):
    key: str
    label: str


class TableRow(BaseModel):
    values: dict[str, str] = Field(default_factory=dict)
    interaction_type: InteractionType | None = None
    interaction_key: str | None = None
    interaction_value: str | None = None


class DetailTablePayload(BaseModel):
    title: str
    columns: list[TableColumn] = Field(default_factory=list)
    rows: list[TableRow] = Field(default_factory=list)


class RevenuePayload(BaseModel):
    granularity: Granularity
    start_date: str
    end_date: str
    comparison_rule: str
    cards: list[KpiCard] = Field(default_factory=list)
    trend: list[TrendPoint] = Field(default_factory=list)
    summary: list[str] = Field(default_factory=list)


class HealthPayload(BaseModel):
    status: Literal["ok", "error"]
    message: str


class SourceHealthCard(BaseModel):
    key: str
    title: str
    value: str
    subtitle: str
    status: Literal["ok", "warning", "error", "neutral"] = "neutral"


class SourceHealthPayload(BaseModel):
    status: Literal["ok", "unavailable"]
    title: str = "Source Health"
    subtitle: str
    generated_at: str
    cards: list[SourceHealthCard] = Field(default_factory=list)
    loads_table: DetailTablePayload
    profile_table: DetailTablePayload
    summary: list[str] = Field(default_factory=list)


class AccountHealthCard(BaseModel):
    key: str
    title: str
    value: str
    subtitle: str
    status: Literal["ok", "warning", "error", "neutral"] = "neutral"


class AccountHealthPayload(BaseModel):
    status: Literal["ok", "unavailable"]
    title: str = "Account Health"
    subtitle: str
    generated_at: str
    cards: list[AccountHealthCard] = Field(default_factory=list)
    tier_table: DetailTablePayload
    account_table: DetailTablePayload
    summary: list[str] = Field(default_factory=list)


class SemanticMetricDefinition(BaseModel):
    label: str
    description: str
    format: str
    aggregation: str
    source_column: str | None = None
    formula_hint: str | None = None
    dimensions: list[str] = Field(default_factory=list)
    allowed_granularities: list[str] = Field(default_factory=list)
    allowed_comparisons: list[str] = Field(default_factory=list)


class SemanticPageDefinition(BaseModel):
    label: str
    subtitle: str
    trend_title_template: str | None = None
    trend_x_title: str | None = None
    current_trace_style: TraceStyle | None = None
    previous_trace_style: TraceStyle | None = None
    insight_note: str | None = None
    interaction_hint: str | None = None
    cards: list[str] = Field(default_factory=list)
    primary_trend_metric: str
    allowed_actions: list[str] = Field(default_factory=list)


class SemanticLayerPayload(BaseModel):
    metrics: dict[str, SemanticMetricDefinition] = Field(default_factory=dict)
    pages: dict[str, SemanticPageDefinition] = Field(default_factory=dict)


class ProposalSuggestion(BaseModel):
    page: PageName
    target: ProposalTarget = "dashboard"
    title: str
    rationale: str
    before: dict[str, object] = Field(default_factory=dict)
    after: dict[str, object] = Field(default_factory=dict)


class ProposalSuggestionPayload(BaseModel):
    suggestions: list[ProposalSuggestion] = Field(default_factory=list)


class AgentAssistRequest(BaseModel):
    page: PageName
    request: str
    limit: int = 4


class ProposalRequest(BaseModel):
    page: PageName | None = None
    target: ProposalTarget = "dashboard"
    title: str
    rationale: str
    before: dict[str, object] = Field(default_factory=dict)
    after: dict[str, object] = Field(default_factory=dict)


class ProposalStatusUpdate(BaseModel):
    status: ProposalStatus
    reviewer_note: str | None = None


class ProposalRecord(ProposalRequest):
    proposal_id: str
    created_at: str
    status: ProposalStatus = "proposed"
    reviewer_note: str | None = None
    updated_at: str | None = None
    applied_to_draft_at: str | None = None


class ProposalListPayload(BaseModel):
    proposals: list[ProposalRecord] = Field(default_factory=list)


class ProposalPreviewChange(BaseModel):
    field: str
    before: object | None = None
    after: object | None = None


class ProposalPreviewPayload(BaseModel):
    proposal: ProposalRecord
    scope_key: str
    current_config: dict[str, object] = Field(default_factory=dict)
    proposed_override: dict[str, object] = Field(default_factory=dict)
    effective_config: dict[str, object] = Field(default_factory=dict)
    changes: list[ProposalPreviewChange] = Field(default_factory=list)


class DraftStatePayload(BaseModel):
    page_overrides: dict[str, dict[str, object]] = Field(default_factory=dict)
    metric_overrides: dict[str, dict[str, object]] = Field(default_factory=dict)


class AuditEvent(BaseModel):
    event_type: str
    created_at: str
    proposal_id: str | None = None
    status: str | None = None
    payload: dict[str, object] = Field(default_factory=dict)


class AuditLogPayload(BaseModel):
    events: list[AuditEvent] = Field(default_factory=list)


class DrilldownDetailPayload(BaseModel):
    page: PageName
    title: str
    subtitle: str | None = None
    table: DetailTablePayload


class DashboardPayload(BaseModel):
    page: PageName
    title: str
    subtitle: str
    insight_note: str | None = None
    interaction_hint: str | None = None
    granularity: Granularity
    start_date: str
    end_date: str
    comparison_rule: str
    cards: list[KpiCard] = Field(default_factory=list)
    trend: list[TrendPoint] = Field(default_factory=list)
    trend_title: str
    trend_x_title: str
    trend_y_title: str
    trend_metric_format: MetricFormat = "currency"
    scenario_mode: ScenarioMode | None = None
    current_series_name: str = "Current"
    previous_series_name: str = "Previous"
    current_trace_style: TraceStyle = "line"
    previous_trace_style: TraceStyle = "line"
    primary_heatmap: HeatmapPayload | None = None
    secondary_chart: BreakdownChartPayload | None = None
    detail_table: DetailTablePayload | None = None
    view_mode: ViewMode = "overview"
    selected_period_label: str | None = None
    summary: list[str] = Field(default_factory=list)
    allowed_actions: list[str] = Field(default_factory=list)
    primary_metric_key: str | None = None

