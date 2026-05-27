from __future__ import annotations

import logging
import time
from collections import OrderedDict
from contextlib import asynccontextmanager
from datetime import date
import hmac
import os
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Query, Request
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .account_health import AccountHealthService
from .dashboard_service import DashboardService
from .data_source import DataSourceError
from .models import (
    AccountHealthPayload,
    AgentAssistRequest,
    AuditLogPayload,
    DashboardPayload,
    DrilldownDetailPayload,
    DraftStatePayload,
    FilterMetadata,
    Granularity,
    HealthPayload,
    PageName,
    ProposalListPayload,
    ScenarioMode,
    ProposalPreviewPayload,
    ProposalRecord,
    ProposalRequest,
    ProposalStatusUpdate,
    ProposalSuggestionPayload,
    RevenuePayload,
    SemanticLayerPayload,
    SourceHealthPayload,
)
from .proposal_applier import ProposalApplier, ProposalApplyError
from .proposal_engine import ProposalEngine
from .proposal_previewer import ProposalPreviewError, ProposalPreviewer
from .proposal_store import ProposalStore, ProposalStoreError
from .proposal_validator import ProposalValidationError, ProposalValidator
from .repository import SalesRepository
from .revenue import RevenueService
from .semantic_layer import SemanticLayer
from .source_health import SourceHealthService

APP_ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DIR = APP_ROOT / "frontend"
PUBLIC_ASSETS = {
    "desktop_lab.css": FRONTEND_DIR / "desktop_lab.css",
    "desktop_lab.js": FRONTEND_DIR / "desktop_lab.js",
    "styles.css": FRONTEND_DIR / "styles.css",
    "app.js": FRONTEND_DIR / "app.js",
}

logger = logging.getLogger("nextgen_dashboard.security")


def _allowed_origins() -> list[str]:
    raw_value = os.getenv(
        "NEXTGEN_ALLOWED_ORIGINS",
        "http://127.0.0.1:8601,http://localhost:8601",
    )
    origins = [item.strip() for item in raw_value.split(",") if item.strip()]
    return origins or ["http://127.0.0.1:8601", "http://localhost:8601"]


def _agent_mutations_enabled() -> bool:
    return os.getenv("NEXTGEN_ENABLE_AGENT_MUTATIONS", "0").strip() == "1"


def _require_agent_mutation_access(request: Request) -> None:
    if not _agent_mutations_enabled():
        logger.warning("Agent mutation rejected (disabled): %s", request.client.host if request.client else "unknown")
        raise HTTPException(
            status_code=403,
            detail="Agent mutations are disabled in demo mode.",
        )
    expected_token = os.getenv("NEXTGEN_AGENT_TOKEN", "").strip()
    if not expected_token:
        raise HTTPException(
            status_code=503,
            detail="Agent mutations require NEXTGEN_AGENT_TOKEN to be configured.",
        )
    provided_token = request.headers.get("x-nextgen-agent-token", "").strip()
    if not provided_token or not hmac.compare_digest(provided_token, expected_token):
        logger.warning("Agent mutation rejected (bad token): %s", request.client.host if request.client else "unknown")
        raise HTTPException(status_code=403, detail="Invalid agent token.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    _warm_default_dashboard_cache()
    yield


app = FastAPI(
    title="NextGen Analytics Dashboard API",
    version="0.1.0",
    description="Scalable dashboard backend with API-first architecture.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "X-NextGen-Agent-Token"],
)


# ---------------------------------------------------------------------------
# Simple in-memory rate limiter (no external dependency)
# ---------------------------------------------------------------------------
_rate_limit_window: dict[str, list[float]] = {}
_RATE_LIMIT_MAX = int(os.getenv("NEXTGEN_RATE_LIMIT_MAX", "120"))  # requests per window
_RATE_LIMIT_WINDOW_SECONDS = 60


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    now = time.monotonic()
    hits = _rate_limit_window.setdefault(client_ip, [])
    # Purge old entries
    cutoff = now - _RATE_LIMIT_WINDOW_SECONDS
    _rate_limit_window[client_ip] = [t for t in hits if t > cutoff]
    hits = _rate_limit_window[client_ip]
    if len(hits) >= _RATE_LIMIT_MAX:
        logger.warning("Rate limit exceeded for %s", client_ip)
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=429, content={"detail": "Too many requests. Try again later."})
    hits.append(now)
    return await call_next(request)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "same-origin")
    response.headers.setdefault("Cross-Origin-Resource-Policy", "same-origin")
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' https://cdn.plot.ly https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data:; font-src 'self';",
    )
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    return response


repository = SalesRepository()
revenue_service = RevenueService()
semantic_layer = SemanticLayer()
dashboard_service = DashboardService(
    revenue_service=revenue_service,
    semantic_layer=semantic_layer,
)
source_health_service = SourceHealthService()
account_health_service = AccountHealthService()
proposal_store = ProposalStore()
proposal_engine = ProposalEngine(semantic_layer=semantic_layer)
proposal_validator = ProposalValidator(semantic_layer=semantic_layer)
proposal_applier = ProposalApplier(
    proposal_store=proposal_store,
    semantic_layer=semantic_layer,
)
proposal_previewer = ProposalPreviewer(
    proposal_store=proposal_store,
    semantic_layer=semantic_layer,
)
dashboard_response_cache: OrderedDict[tuple, tuple[float, DashboardPayload]] = OrderedDict()
detail_response_cache: OrderedDict[tuple, tuple[float, DrilldownDetailPayload]] = OrderedDict()
DASHBOARD_CACHE_LIMIT = 48
DETAIL_CACHE_LIMIT = 96
CACHE_TTL_SECONDS = int(os.getenv("NEXTGEN_CACHE_TTL_SECONDS", "300"))


def _dashboard_cache_key(
    page: PageName,
    start_ts,
    end_ts,
    categories: list[str],
    cities: list[str],
    granularity: Granularity,
    drilldown_period_key: str | None,
    scenario_mode: ScenarioMode | None,
) -> tuple:
    return (
        page,
        pd.Timestamp(start_ts).date().isoformat(),
        pd.Timestamp(end_ts).date().isoformat(),
        tuple(sorted(categories)),
        tuple(sorted(cities)),
        granularity,
        drilldown_period_key or "",
        scenario_mode or "",
    )


def _read_dashboard_cache(key: tuple) -> DashboardPayload | None:
    entry = dashboard_response_cache.get(key)
    if entry is None:
        return None
    ts, cached = entry
    if time.monotonic() - ts > CACHE_TTL_SECONDS:
        dashboard_response_cache.pop(key, None)
        return None
    dashboard_response_cache.move_to_end(key)
    return cached.model_copy(deep=True)


def _write_dashboard_cache(key: tuple, payload: DashboardPayload) -> None:
    dashboard_response_cache[key] = (time.monotonic(), payload.model_copy(deep=True))
    dashboard_response_cache.move_to_end(key)
    while len(dashboard_response_cache) > DASHBOARD_CACHE_LIMIT:
        dashboard_response_cache.popitem(last=False)


def _clear_dashboard_cache() -> None:
    dashboard_response_cache.clear()
    detail_response_cache.clear()


def _read_detail_cache(key: tuple) -> DrilldownDetailPayload | None:
    entry = detail_response_cache.get(key)
    if entry is None:
        return None
    ts, cached = entry
    if time.monotonic() - ts > CACHE_TTL_SECONDS:
        detail_response_cache.pop(key, None)
        return None
    detail_response_cache.move_to_end(key)
    return cached.model_copy(deep=True)


def _write_detail_cache(key: tuple, payload: DrilldownDetailPayload) -> None:
    detail_response_cache[key] = (time.monotonic(), payload.model_copy(deep=True))
    detail_response_cache.move_to_end(key)
    while len(detail_response_cache) > DETAIL_CACHE_LIMIT:
        detail_response_cache.popitem(last=False)


def _warm_default_dashboard_cache() -> None:
    if os.getenv("NEXTGEN_SKIP_PREWARM", "0") == "1":
        return
    try:
        meta = repository.filter_metadata()
        start_ts, end_ts = repository.validate_date_range(
            date.fromisoformat(str(meta["default_start_date"])),
            date.fromisoformat(str(meta["default_end_date"])),
        )
        full_df = repository.load_sales_model()
        full_df.attrs["customer_first_purchase"] = repository.customer_first_purchase()
        scoped_df = repository.filter_sales(
            start_date=None,
            end_date=None,
            categories=[],
            cities=[],
        )
        current_df = repository.filter_frame_by_date(scoped_df, start_ts, end_ts)
        semantic_layer.load()
        marketing_df = repository.load_marketing_model()
        for page_name in ("executive", "sales", "revenue", "marketing", "predictive", "customers", "retention", "products", "operations"):
            cache_key = _dashboard_cache_key(
                page=page_name,
                start_ts=start_ts,
                end_ts=end_ts,
                categories=[],
                cities=[],
                granularity="Month",
                drilldown_period_key=None,
                scenario_mode="Base" if page_name == "predictive" else None,
            )
            payload = dashboard_service.build_payload(
                page=page_name,
                scoped_df=scoped_df,
                current_df=current_df,
                start_date=start_ts,
                end_date=end_ts,
                granularity="Month",
                full_df=full_df,
                marketing_df=marketing_df,
                scenario_mode="Base",
            )
            _write_dashboard_cache(cache_key, payload)
    except Exception:
        pass


@app.get("/", include_in_schema=False)
def index() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "desktop_lab.html")


@app.get("/desktop-lab", include_in_schema=False)
def desktop_lab() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "desktop_lab.html")


@app.get("/static/{asset_name}", include_in_schema=False)
def public_asset(asset_name: str) -> FileResponse:
    asset_path = PUBLIC_ASSETS.get(asset_name)
    if asset_path is None or not asset_path.exists():
        raise HTTPException(status_code=404, detail="Asset not found.")
    return FileResponse(asset_path)


@app.get("/api/health", response_model=HealthPayload)
def health_check() -> HealthPayload:
    info = repository.health()
    return HealthPayload(status=info.status, message=info.message)


@app.get("/api/meta/filters", response_model=FilterMetadata)
def filter_metadata() -> FilterMetadata:
    meta = repository.filter_metadata()
    try:
        import polars as _  # noqa: F401

        engine = "pandas + polars-ready"
    except Exception:
        engine = "pandas"

    return FilterMetadata(**meta, data_engine=engine)


@app.get("/api/semantic-layer", response_model=SemanticLayerPayload)
def semantic_layer_endpoint() -> SemanticLayerPayload:
    payload = semantic_layer.load()
    return SemanticLayerPayload(
        metrics=payload["metrics"]["metrics"],
        pages=payload["pages"]["pages"],
    )


@app.get("/api/source-health", response_model=SourceHealthPayload)
def source_health_endpoint() -> SourceHealthPayload:
    return source_health_service.build_payload()


@app.get("/api/source-catalog")
def source_catalog_endpoint() -> dict[str, object]:
    return source_health_service.build_catalog_payload()


@app.get("/api/account-health", response_model=AccountHealthPayload)
def account_health_endpoint() -> AccountHealthPayload:
    return account_health_service.build_payload()


@app.get("/api/agent/suggestions", response_model=ProposalSuggestionPayload)
def list_agent_suggestions(
    page: PageName = Query(default="sales"),
) -> ProposalSuggestionPayload:
    return ProposalSuggestionPayload(
        suggestions=proposal_engine.suggestions_for_page(page)
    )


@app.post("/api/agent/assist", response_model=ProposalSuggestionPayload)
def assist_agent_request(request: AgentAssistRequest) -> ProposalSuggestionPayload:
    suggestions = proposal_engine.assist(
        page=request.page,
        request=request.request,
        limit=request.limit,
    )
    return ProposalSuggestionPayload(suggestions=suggestions)


@app.get("/api/agent/proposals", response_model=ProposalListPayload)
def list_agent_proposals() -> ProposalListPayload:
    return ProposalListPayload(proposals=proposal_store.list_proposals())


@app.post("/api/agent/proposals", response_model=ProposalRecord)
def create_agent_proposal(
    request: ProposalRequest,
    _: None = Depends(_require_agent_mutation_access),
) -> ProposalRecord:
    try:
        proposal_validator.validate(request.model_dump())
    except ProposalValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    record = proposal_store.create_proposal(request.model_dump())
    return ProposalRecord(**record)


@app.patch("/api/agent/proposals/{proposal_id}", response_model=ProposalRecord)
def update_agent_proposal(
    proposal_id: str,
    request: ProposalStatusUpdate,
    _: None = Depends(_require_agent_mutation_access),
) -> ProposalRecord:
    try:
        record = proposal_store.update_proposal_status(
            proposal_id=proposal_id,
            status=request.status,
            reviewer_note=request.reviewer_note,
        )
    except ProposalStoreError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return ProposalRecord(**record)


@app.get("/api/agent/proposals/{proposal_id}/preview", response_model=ProposalPreviewPayload)
def preview_agent_proposal(proposal_id: str) -> ProposalPreviewPayload:
    try:
        return proposal_previewer.preview(proposal_id)
    except ProposalStoreError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ProposalPreviewError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/agent/proposals/preview", response_model=ProposalPreviewPayload)
def preview_agent_proposal_request(request: ProposalRequest) -> ProposalPreviewPayload:
    try:
        proposal_validator.validate(request.model_dump())
        return proposal_previewer.preview_request(request.model_dump())
    except ProposalValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ProposalPreviewError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/agent/drafts", response_model=DraftStatePayload)
def read_agent_drafts() -> DraftStatePayload:
    state = proposal_store.draft_state()
    return DraftStatePayload(**state)


@app.delete("/api/agent/drafts", response_model=DraftStatePayload)
def clear_agent_drafts(
    _: None = Depends(_require_agent_mutation_access),
) -> DraftStatePayload:
    proposal_store.clear_drafts()
    semantic_layer.refresh()
    _clear_dashboard_cache()
    return DraftStatePayload(page_overrides={}, metric_overrides={})


@app.post("/api/agent/proposals/{proposal_id}/apply-draft", response_model=ProposalRecord)
def apply_agent_proposal_to_draft(
    proposal_id: str,
    _: None = Depends(_require_agent_mutation_access),
) -> ProposalRecord:
    try:
        record = proposal_applier.apply_to_draft(proposal_id)
        _clear_dashboard_cache()
    except ProposalStoreError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ProposalApplyError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return ProposalRecord(**record)


@app.get("/api/agent/audit-log", response_model=AuditLogPayload)
def read_agent_audit_log(
    limit: int = Query(default=50, ge=1, le=500),
) -> AuditLogPayload:
    return AuditLogPayload(events=proposal_store.read_audit_events(limit=limit))


@app.get("/api/revenue", response_model=RevenuePayload)
def revenue_endpoint(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    categories: list[str] | None = Query(default=None),
    cities: list[str] | None = Query(default=None),
    granularity: Granularity = Query(default="Month"),
) -> RevenuePayload:
    try:
        start_ts, end_ts = repository.validate_date_range(start_date, end_date)
    except DataSourceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    scoped_df = repository.filter_sales(
        start_date=None,
        end_date=None,
        categories=categories or [],
        cities=cities or [],
    )
    current_df = repository.filter_frame_by_date(scoped_df, start_ts, end_ts)

    if scoped_df.empty:
        raise HTTPException(
            status_code=404,
            detail="No data found for selected filters.",
        )

    return revenue_service.build_payload(
        scoped_df=scoped_df,
        current_df=current_df,
        start_date=start_ts,
        end_date=end_ts,
        granularity=granularity,
    )


@app.get("/api/dashboard/detail", response_model=DrilldownDetailPayload)
def dashboard_detail_endpoint(
    page: PageName = Query(default="sales"),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    categories: list[str] | None = Query(default=None),
    cities: list[str] | None = Query(default=None),
    granularity: Granularity = Query(default="Month"),
    scenario_mode: ScenarioMode = Query(default="Base"),
    drilldown_key: str = Query(...),
    drilldown_value: str = Query(...),
) -> DrilldownDetailPayload:
    try:
        start_ts, end_ts = repository.validate_date_range(start_date, end_date)
    except DataSourceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    category_values = categories or []
    city_values = cities or []
    cache_key = (
        page,
        pd.Timestamp(start_ts).date().isoformat(),
        pd.Timestamp(end_ts).date().isoformat(),
        tuple(sorted(category_values)),
        tuple(sorted(city_values)),
        granularity,
        scenario_mode,
        drilldown_key,
        drilldown_value,
    )
    cached_payload = _read_detail_cache(cache_key)
    if cached_payload is not None:
        return cached_payload

    full_df = repository.load_sales_model()
    full_df.attrs["customer_first_purchase"] = repository.customer_first_purchase()
    marketing_df = repository.load_marketing_model() if page == "marketing" else None
    scoped_df = repository.filter_sales(
        start_date=None,
        end_date=None,
        categories=category_values,
        cities=city_values,
    )
    if scoped_df.empty:
        raise HTTPException(status_code=404, detail="No data found for selected filters.")

    current_df = repository.filter_frame_by_date(scoped_df, start_ts, end_ts)
    try:
        payload = dashboard_service.build_detail_payload(
            page=page,
            scoped_df=scoped_df,
            current_df=current_df,
            start_date=start_ts,
            end_date=end_ts,
            granularity=granularity,
            drilldown_key=drilldown_key,
            drilldown_value=drilldown_value,
            full_df=full_df,
            scenario_mode=scenario_mode,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    _write_detail_cache(cache_key, payload)
    return payload


@app.get("/api/dashboard", response_model=DashboardPayload)
def dashboard_endpoint(
    page: PageName = Query(default="sales"),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    categories: list[str] | None = Query(default=None),
    cities: list[str] | None = Query(default=None),
    granularity: Granularity = Query(default="Month"),
    scenario_mode: ScenarioMode = Query(default="Base"),
    drilldown_period_key: str | None = Query(default=None),
) -> DashboardPayload:
    try:
        start_ts, end_ts = repository.validate_date_range(start_date, end_date)
    except DataSourceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    category_values = categories or []
    city_values = cities or []
    cache_key = _dashboard_cache_key(
        page=page,
        start_ts=start_ts,
        end_ts=end_ts,
        categories=category_values,
        cities=city_values,
        granularity=granularity,
        drilldown_period_key=drilldown_period_key,
        scenario_mode=scenario_mode if page == "predictive" else None,
    )
    cached_payload = _read_dashboard_cache(cache_key)
    if cached_payload is not None:
        return cached_payload

    full_df = repository.load_sales_model()
    full_df.attrs["customer_first_purchase"] = repository.customer_first_purchase()
    marketing_df = repository.load_marketing_model() if page == "marketing" else None
    scoped_df = repository.filter_sales(
        start_date=None,
        end_date=None,
        categories=category_values,
        cities=city_values,
    )

    if scoped_df.empty:
        raise HTTPException(
            status_code=404,
            detail="No data found for selected filters.",
        )

    current_df = repository.filter_frame_by_date(scoped_df, start_ts, end_ts)

    if page == "sales" and drilldown_period_key:
        try:
            payload = dashboard_service.build_sales_drilldown_payload(
                scoped_df=scoped_df,
                global_start=start_ts,
                global_end=end_ts,
                source_granularity=granularity,
                period_key=drilldown_period_key,
            )
            _write_dashboard_cache(cache_key, payload)
            return payload
        except Exception as exc:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid drilldown period: {exc}",
            ) from exc

    payload = dashboard_service.build_payload(
        page=page,
        scoped_df=scoped_df,
        current_df=current_df,
        start_date=start_ts,
        end_date=end_ts,
        granularity=granularity,
        full_df=full_df,
        marketing_df=marketing_df,
        scenario_mode=scenario_mode,
    )
    _write_dashboard_cache(cache_key, payload)
    return payload

