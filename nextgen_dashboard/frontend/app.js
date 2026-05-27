/* --- Security: escape untrusted strings before innerHTML insertion --- */
function escapeHTML(str) {
  if (str == null) return "";
  const s = String(str);
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

const PAGES = [
  {
    key: "executive",
    label: "Executive Scorecard",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="11" width="3" height="7"/><rect x="10.5" y="7" width="3" height="11"/><rect x="17" y="4" width="3" height="14"/><circle cx="18.5" cy="4" r="1.3"/></svg>`,
  },
  {
    key: "sales",
    label: "Sales Overview",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="11" width="3" height="7"/><rect x="10.5" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg>`,
  },
  {
    key: "revenue",
    label: "Revenue Trends",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="4,16 9,11 13,14 20,7"/><circle cx="20" cy="7" r="1.6"/></svg>`,
  },
  {
    key: "marketing",
    label: "Marketing Efficiency",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="7" cy="8" r="3"/><circle cx="17" cy="16" r="3"/><path d="M9.5 9.5 14.5 14.5"/><path d="M5 18h4"/><path d="M12 18h7"/></svg>`,
  },
  {
    key: "predictive",
    label: "Predictive Outlook",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 18h16"/><path d="M6 16l4-5 4 2 4-6"/><circle cx="10" cy="11" r="1.4"/><circle cx="14" cy="13" r="1.4"/><circle cx="18" cy="7" r="1.4"/></svg>`,
  },
  {
    key: "customers",
    label: "Customer Segmentation",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3.5 19c.6-2.7 2.9-4.2 5.5-4.2s4.8 1.5 5.4 4.2"/><path d="M13.8 19c.4-1.8 1.8-3 3.7-3 1.8 0 3.2 1.1 3.6 3"/></svg>`,
  },
  {
    key: "retention",
    label: "Retention Cohorts",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 5h14v14H5z"/><path d="M9 5v14"/><path d="M14 5v14"/><path d="M5 10h14"/><path d="M5 15h14"/></svg>`,
  },
  {
    key: "products",
    label: "Product Performance",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3 20 7.5 12 12 4 7.5 12 3Z"/><path d="M4 7.5V16.5L12 21V12"/><path d="M20 7.5V16.5L12 21"/></svg>`,
  },
  {
    key: "operations",
    label: "Order Flow Operations",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 8h4l2 3h6"/><path d="M6 16h4l2-3h6"/><circle cx="4" cy="8" r="1.5"/><circle cx="4" cy="16" r="1.5"/><circle cx="20" cy="11.5" r="1.5"/></svg>`,
  },
];

const QUICK_ACTIONS = {
  default: [
    {
      label: "Clarify comparison",
      prompt: "clarify how the current period is compared to the previous one",
    },
    {
      label: "Improve chart",
      prompt: "make the chart easier to read and choose the better visual style",
    },
  ],
  sales: [
    {
      label: "Explain drilldown",
      prompt: "make the drilldown interaction clearer on this sales page",
    },
    {
      label: "Use line chart",
      prompt: "use a line chart for the current series on this page",
    },
    {
      label: "Clarify comparison",
      prompt: "clarify the comparison logic on this sales page",
    },
  ],
  executive: [
    {
      label: "Explain certified KPIs",
      prompt: "explain the certified executive KPIs and their reading order",
    },
    {
      label: "Clarify net sales",
      prompt: "clarify the difference between net sales and gross sales",
    },
  ],
  revenue: [
    {
      label: "Make trend easier",
      prompt: "make the revenue trend easier to read and explain the comparison",
    },
    {
      label: "Use bar-led chart",
      prompt: "use a bar chart for the current revenue series",
    },
    {
      label: "Clarify subtitle",
      prompt: "clarify how revenue is compared against the previous period",
    },
  ],
  marketing: [
    {
      label: "Explain ROAS",
      prompt: "explain ROAS and the attribution caveat on this marketing page",
    },
    {
      label: "Focus channel mix",
      prompt: "highlight which marketing channel deserves attention first",
    },
  ],
  predictive: [
    {
      label: "Explain forecast",
      prompt: "explain the forecasting method and the confidence range on this predictive page",
    },
    {
      label: "Focus next actions",
      prompt: "make the next-step watchlist and business actions clearer on this predictive page",
    },
    {
      label: "Highlight driver risk",
      prompt: "highlight which projected category drivers deserve attention first",
    },
  ],
  customers: [
    {
      label: "Prioritize retention",
      prompt: "prioritize retention and repeat rate on this customer page",
    },
    {
      label: "Explain repeat rate",
      prompt: "clarify the comparison logic and explain repeat rate",
    },
    {
      label: "Use line chart",
      prompt: "use a line chart for customer trend analysis",
    },
  ],
  retention: [
    {
      label: "Explain maturity",
      prompt: "clarify why some cohort cells are blank and how maturity works",
    },
    {
      label: "Focus on M1",
      prompt: "make month 1 retention the primary read on this page",
    },
    {
      label: "Explain cohorts",
      prompt: "explain how acquisition cohorts are defined on this page",
    },
  ],
  products: [
    {
      label: "Highlight mix risk",
      prompt: "highlight category concentration risk on this product page",
    },
    {
      label: "Clarify comparison",
      prompt: "clarify the comparison logic on this product page",
    },
    {
      label: "Use bar-led chart",
      prompt: "use a bar chart for the current product trend",
    },
  ],
  operations: [
    {
      label: "Show reading order",
      prompt: "show the operational reading order for this page",
    },
    {
      label: "Clarify comparison",
      prompt: "clarify the comparison logic on this operations page",
    },
    {
      label: "Use line chart",
      prompt: "use a line chart for the operational trend",
    },
  ],
};

const state = {
  meta: null,
  activePage: "executive",
  drilldownPeriodKey: null,
  currentPayload: null,
  currentTrendData: [],
  filterControls: {},
  semanticLayer: null,
  suggestions: [],
  suggestionPage: null,
  proposals: [],
  proposalPreview: null,
  drafts: { page_overrides: {}, metric_overrides: {} },
  auditEvents: [],
  drawerOpen: false,
  governanceLoaded: false,
  dashboardCache: new Map(),
  focusDetailCache: new Map(),
  prefetchToken: 0,
  dashboardRequestToken: 0,
  focusRequestToken: 0,
  dashboardAbortController: null,
  focusAbortController: null,
  loadingTimer: null,
  currentFocusDetail: null,
  filterReloadTimer: null,
  surfaceSkin: "glass",
  uiPreferencesKey: "nextgen-dashboard-ui-preferences",
};

const elements = {
  nav: document.getElementById("sidebar-nav"),
  healthPill: document.getElementById("health-pill"),
  pageTitle: document.getElementById("page-title"),
  pageSubtitle: document.getElementById("page-subtitle"),
  startDate: document.getElementById("start-date"),
  endDate: document.getElementById("end-date"),
  categories: document.getElementById("categories"),
  categoriesControl: document.getElementById("categories-control"),
  cities: document.getElementById("cities"),
  citiesControl: document.getElementById("cities-control"),
  granularity: document.getElementById("granularity"),
  granularityPills: document.getElementById("granularity-pills"),
  scenarioMode: document.getElementById("scenario-mode"),
  scenarioPills: document.getElementById("scenario-pills"),
  trendViewBlock: document.getElementById("trend-view-block"),
  scenarioViewBlock: document.getElementById("scenario-view-block"),
  cardsGrid: document.getElementById("cards-grid"),
  secondaryPanel: document.getElementById("secondary-panel"),
  secondaryTitle: document.getElementById("secondary-title"),
  secondaryChart: document.getElementById("secondary-chart"),
  detailPanel: document.getElementById("detail-panel"),
  detailTitle: document.getElementById("detail-title"),
  detailTable: document.getElementById("detail-table"),
  focusPanel: document.getElementById("focus-panel"),
  focusTitle: document.getElementById("focus-title"),
  focusMeta: document.getElementById("focus-meta"),
  focusSubtitle: document.getElementById("focus-subtitle"),
  focusTable: document.getElementById("focus-table"),
  focusClear: document.getElementById("focus-clear"),
  storyPanel: document.getElementById("story-panel"),
  storyHighlight: document.getElementById("story-highlight"),
  storySupport: document.getElementById("story-support"),
  primaryMetric: document.getElementById("primary-metric"),
  primaryMetricDescription: document.getElementById("primary-metric-description"),
  metricConstraints: document.getElementById("metric-constraints"),
  allowedActions: document.getElementById("allowed-actions"),
  comparisonRule: document.getElementById("comparison-rule"),
  trendTitle: document.getElementById("trend-title"),
  backOverview: document.getElementById("back-overview"),
  assistantToggle: document.getElementById("assistant-toggle"),
  assistantClose: document.getElementById("assistant-close"),
  assistantOverlay: document.getElementById("assistant-overlay"),
  assistantDrawer: document.getElementById("assistant-drawer"),
  assistantRequest: document.getElementById("assistant-request"),
  assistantStatus: document.getElementById("assistant-status"),
  runAssistant: document.getElementById("run-assistant"),
  clearAssistant: document.getElementById("clear-assistant"),
  quickActions: document.getElementById("quick-actions"),
  suggestionsList: document.getElementById("suggestions-list"),
  proposalForm: document.getElementById("proposal-form"),
  proposalTitle: document.getElementById("proposal-title"),
  proposalTarget: document.getElementById("proposal-target"),
  proposalRationale: document.getElementById("proposal-rationale"),
  proposalAfter: document.getElementById("proposal-after"),
  proposalQueue: document.getElementById("proposal-queue"),
  proposalPreview: document.getElementById("proposal-preview"),
  draftState: document.getElementById("draft-state"),
  clearDrafts: document.getElementById("clear-drafts"),
  auditLog: document.getElementById("audit-log"),
  previewProposalBtn: document.getElementById("preview-proposal"),
  surfaceSkin: document.getElementById("surface-skin"),
};

function selectedValues(selectElement) {
  return Array.from(selectElement.selectedOptions).map((opt) => opt.value);
}

function fillSelectOptions(selectElement, items) {
  selectElement.innerHTML = "";
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    selectElement.appendChild(option);
  });
}

function setSelectValues(selectElement, values) {
  const next = new Set(values);
  Array.from(selectElement.options).forEach((option) => {
    option.selected = next.has(option.value);
  });
}

function loadUiPreferences() {
  try {
    const raw = window.localStorage.getItem(state.uiPreferencesKey);
    if (!raw) return;
    const prefs = JSON.parse(raw);
    if (prefs.surfaceSkin === "desktop" || prefs.surfaceSkin === "glass") {
      state.surfaceSkin = prefs.surfaceSkin;
    }
  } catch (_) {}
}

function saveUiPreferences() {
  try {
    window.localStorage.setItem(state.uiPreferencesKey, JSON.stringify({
      surfaceSkin: state.surfaceSkin,
    }));
  } catch (_) {}
}

function applySurfaceSkin(nextSkin = state.surfaceSkin) {
  state.surfaceSkin = nextSkin === "desktop" ? "desktop" : "glass";
  document.body.dataset.surfaceSkin = state.surfaceSkin;
  if (elements.surfaceSkin && elements.surfaceSkin.value !== state.surfaceSkin) {
    elements.surfaceSkin.value = state.surfaceSkin;
  }
  saveUiPreferences();
}

function closeAllMultiSelects(exceptId = null) {
  Object.entries(state.filterControls).forEach(([id, control]) => {
    if (exceptId && id === exceptId) {
      return;
    }
    control.dropdown.classList.add("hidden");
    control.trigger.classList.remove("open");
    control.container.classList.remove("is-open");
    control.search.value = "";
    renderMultiSelect(control.select);
  });
}

function renderMultiSelect(selectElement) {
  const control = state.filterControls[selectElement.id];
  if (!control) {
    return;
  }

  const query = control.search.value.trim().toLowerCase();
  const options = Array.from(selectElement.options);
  const selected = options.filter((option) => option.selected).map((option) => option.value);

  control.value.innerHTML = "";
  if (!selected.length) {
    const placeholder = document.createElement("span");
    placeholder.className = "multi-select-placeholder";
    placeholder.textContent = control.placeholder;
    control.value.appendChild(placeholder);
  } else {
    selected.slice(0, 2).forEach((value) => {
      const chip = document.createElement("span");
      chip.className = "multi-select-chip";
      chip.textContent = value;
      control.value.appendChild(chip);
    });
    if (selected.length > 2) {
      const moreChip = document.createElement("span");
      moreChip.className = "multi-select-chip more";
      moreChip.textContent = `+${selected.length - 2} more`;
      control.value.appendChild(moreChip);
    }
  }

  const filtered = options.filter((option) => option.value.toLowerCase().includes(query));
  control.options.innerHTML = "";
  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "multi-select-empty";
    empty.textContent = "No matching options.";
    control.options.appendChild(empty);
    return;
  }

  filtered.forEach((option) => {
    const row = document.createElement("label");
    row.className = "multi-select-option";
    row.innerHTML = `
      <input type="checkbox" ${option.selected ? "checked" : ""} />
      <span>${option.value}</span>
    `;
    const checkbox = row.querySelector("input");
    checkbox.addEventListener("change", () => {
      option.selected = checkbox.checked;
      renderMultiSelect(selectElement);
      selectElement.dispatchEvent(new Event("change", { bubbles: true }));
    });
    control.options.appendChild(row);
  });
}

function setupMultiSelect(selectElement, containerElement, placeholder) {
  containerElement.innerHTML = `
    <button type="button" class="multi-select-trigger">
      <span class="multi-select-value"></span>
      <span class="multi-select-caret" aria-hidden="true">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor">
          <path d="M2.25 4.5 6 8.25 9.75 4.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </button>
    <div class="multi-select-dropdown hidden">
      <input type="search" class="multi-select-search" placeholder="Search" />
      <div class="multi-select-actions-row">
        <button type="button" data-action="all" class="secondary-btn">Select all</button>
        <button type="button" data-action="clear" class="secondary-btn">Clear</button>
      </div>
      <div class="multi-select-options"></div>
    </div>
  `;

  const control = {
    container: containerElement,
    trigger: containerElement.querySelector(".multi-select-trigger"),
    value: containerElement.querySelector(".multi-select-value"),
    dropdown: containerElement.querySelector(".multi-select-dropdown"),
    search: containerElement.querySelector(".multi-select-search"),
    options: containerElement.querySelector(".multi-select-options"),
    placeholder,
    select: selectElement,
  };

  state.filterControls[selectElement.id] = control;

  control.trigger.addEventListener("click", () => {
    const isOpen = !control.dropdown.classList.contains("hidden");
    closeAllMultiSelects(selectElement.id);
    control.search.value = "";
    renderMultiSelect(selectElement);
    control.dropdown.classList.toggle("hidden", isOpen);
    control.trigger.classList.toggle("open", !isOpen);
    control.container.classList.toggle("is-open", !isOpen);
    if (!isOpen) {
      control.search.focus();
    }
  });

  control.search.addEventListener("input", () => {
    renderMultiSelect(selectElement);
  });

  control.dropdown
    .querySelector('[data-action="all"]')
    .addEventListener("click", () => {
      setSelectValues(selectElement, Array.from(selectElement.options).map((option) => option.value));
      renderMultiSelect(selectElement);
      selectElement.dispatchEvent(new Event("change", { bubbles: true }));
    });

  control.dropdown
    .querySelector('[data-action="clear"]')
    .addEventListener("click", () => {
      setSelectValues(selectElement, []);
      renderMultiSelect(selectElement);
      selectElement.dispatchEvent(new Event("change", { bubbles: true }));
    });

  renderMultiSelect(selectElement);
}

function syncCustomFilters() {
  [elements.categories, elements.cities].forEach((selectElement) => {
    renderMultiSelect(selectElement);
  });
}
function syncGranularityPills() {
  if (!elements.granularityPills) {
    return;
  }
  const active = elements.granularity.value;
  elements.granularityPills
    .querySelectorAll(".granularity-pill")
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.granularity === active,
      );
    });
}

function syncScenarioPills() {
  if (!elements.scenarioPills) {
    return;
  }
  const active = elements.scenarioMode.value;
  elements.scenarioPills
    .querySelectorAll(".granularity-pill")
    .forEach((button) => {
      button.classList.toggle("active", button.dataset.scenario === active);
    });
}


function formatPercent(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
function metricPresentation(metricFormat) {
  const isPercentMetric = metricFormat === "percent";
  return {
    isPercentMetric,
    valueFormat: isPercentMetric
      ? ".2f"
      : metricFormat === "number"
        ? ",.0f"
        : ",.2f",
    valueSuffix: isPercentMetric ? "%" : "",
    axisTickFormat: isPercentMetric
      ? ".0f"
      : metricFormat === "number"
        ? ",.0f"
        : ",.2f",
  };
}

function forecastScenarioName(scenarioMode) {
  if (scenarioMode === "Conservative") {
    return "Conservative Forecast";
  }
  if (scenarioMode === "Upside") {
    return "Upside Forecast";
  }
  return "Base Forecast";
}


function pageLabel(pageKey = state.activePage) {
  return PAGES.find((page) => page.key === pageKey)?.label || pageKey;
}

function showAgentStatus(message, variant = "info") {
  elements.assistantStatus.textContent = message;
  elements.assistantStatus.className = `assistant-status ${variant}`;
}

function openAssistantDrawer() {
  if (!elements.assistantDrawer.classList.contains("hidden")) {
    elements.assistantDrawer.classList.add("open");
    elements.assistantOverlay.classList.add("visible");
    document.body.classList.add("drawer-open");
    state.drawerOpen = true;
    if (!state.governanceLoaded) {
      loadGovernanceData().catch((error) => showAgentStatus(error.message, "error"));
    }
    ensureAssistantSuggestions().catch((error) => showAgentStatus(error.message, "error"));
    return;
  }

  elements.assistantDrawer.classList.remove("hidden");
  elements.assistantOverlay.classList.remove("hidden");
  requestAnimationFrame(() => {
    elements.assistantDrawer.classList.add("open");
    elements.assistantOverlay.classList.add("visible");
  });
  document.body.classList.add("drawer-open");
  state.drawerOpen = true;
  if (!state.governanceLoaded) {
    loadGovernanceData().catch((error) => showAgentStatus(error.message, "error"));
  }
  ensureAssistantSuggestions().catch((error) => showAgentStatus(error.message, "error"));
}

function closeAssistantDrawer() {
  if (elements.assistantDrawer.classList.contains("hidden")) {
    return;
  }

  elements.assistantDrawer.classList.remove("open");
  elements.assistantOverlay.classList.remove("visible");
  document.body.classList.remove("drawer-open");
  state.drawerOpen = false;

  window.setTimeout(() => {
    if (!state.drawerOpen) {
      elements.assistantDrawer.classList.add("hidden");
      elements.assistantOverlay.classList.add("hidden");
    }
  }, 220);
}

async function ensureAssistantSuggestions() {
  if (state.suggestionPage === state.activePage && state.suggestions.length) {
    return;
  }
  await requestAssistantSuggestions(elements.assistantRequest.value);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Request failed (${response.status}): ${errorBody}`);
  }
  return response.json();
}

async function sendJson(url, method, body) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Request failed (${response.status}): ${errorBody}`);
  }
  return response.json();
}

async function loadHealth() {
  try {
    const payload = await fetchJson("/api/health");
    elements.healthPill.textContent = payload.message;
    elements.healthPill.classList.toggle("error", payload.status !== "ok");
  } catch (error) {
    elements.healthPill.textContent = "Health check failed";
    elements.healthPill.classList.add("error");
  }
}

async function loadFilterMetadata() {
  const meta = await fetchJson("/api/meta/filters");
  state.meta = meta;

  elements.startDate.value = meta.default_start_date;
  elements.endDate.value = meta.default_end_date;
  syncGranularityPills();
  syncScenarioPills();

  elements.startDate.min = meta.min_date;
  elements.startDate.max = meta.max_date;
  elements.endDate.min = meta.min_date;
  elements.endDate.max = meta.max_date;

  fillSelectOptions(elements.categories, meta.categories);
  fillSelectOptions(elements.cities, meta.cities);

  setupMultiSelect(elements.categories, elements.categoriesControl, "All categories");
  setupMultiSelect(elements.cities, elements.citiesControl, "All cities");
}

async function loadSemanticLayer() {
  const payload = await fetchJson("/api/semantic-layer");
  state.semanticLayer = payload;
}
function buildSidebar() {
  elements.nav.innerHTML = "";
  PAGES.forEach((page) => {
    const btn = document.createElement("button");
    btn.className = "nav-btn";
    btn.dataset.page = page.key;
    btn.innerHTML = `${page.icon}<span>${page.label}</span>`;
    btn.addEventListener("click", async () => {
      state.activePage = page.key;
      state.drilldownPeriodKey = null;
      state.proposalPreview = null;
      state.suggestions = [];
      state.suggestionPage = null;
      elements.assistantRequest.value = "";
      setActiveNavButton();
      renderQuickActions();
      renderSuggestions();
      renderProposalPreview();
      await loadDashboard();
      if (state.drawerOpen) {
        await requestAssistantSuggestions("");
      }
    });
    elements.nav.appendChild(btn);
  });
  setActiveNavButton();
}

function setActiveNavButton() {
  const buttons = elements.nav.querySelectorAll(".nav-btn");
  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === state.activePage);
  });
}

function buildDashboardQuery(pageOverride = state.activePage, drilldownOverride = state.drilldownPeriodKey) {
  const params = new URLSearchParams();
  params.set("page", pageOverride);
  params.set("start_date", elements.startDate.value);
  params.set("end_date", elements.endDate.value);
  params.set("granularity", elements.granularity.value);
  if (pageOverride === "predictive" && elements.scenarioMode) {
    params.set("scenario_mode", elements.scenarioMode.value);
  }

  selectedValues(elements.categories).forEach((value) => {
    params.append("categories", value);
  });
  selectedValues(elements.cities).forEach((value) => {
    params.append("cities", value);
  });

  if (pageOverride === "sales" && drilldownOverride) {
    params.set("drilldown_period_key", drilldownOverride);
  }

  return params.toString();
}

function readDashboardCache(query) {
  if (!state.dashboardCache.has(query)) {
    return null;
  }
  const payload = state.dashboardCache.get(query);
  state.dashboardCache.delete(query);
  state.dashboardCache.set(query, payload);
  return payload;
}

function writeDashboardCache(query, payload) {
  if (state.dashboardCache.has(query)) {
    state.dashboardCache.delete(query);
  }
  state.dashboardCache.set(query, payload);
  while (state.dashboardCache.size > 24) {
    const firstKey = state.dashboardCache.keys().next().value;
    state.dashboardCache.delete(firstKey);
  }
}

function clearDashboardCache() {
  state.dashboardCache.clear();
  state.focusDetailCache.clear();
}

function readFocusDetailCache(query) {
  if (!state.focusDetailCache.has(query)) {
    return null;
  }
  const payload = state.focusDetailCache.get(query);
  state.focusDetailCache.delete(query);
  state.focusDetailCache.set(query, payload);
  return payload;
}

function writeFocusDetailCache(query, payload) {
  if (state.focusDetailCache.has(query)) {
    state.focusDetailCache.delete(query);
  }
  state.focusDetailCache.set(query, payload);
  while (state.focusDetailCache.size > 24) {
    const firstKey = state.focusDetailCache.keys().next().value;
    state.focusDetailCache.delete(firstKey);
  }
}

function setDashboardLoading(isLoading) {
  [elements.cardsGrid, elements.storyPanel, elements.secondaryPanel, elements.detailPanel, elements.focusPanel]
    .filter(Boolean)
    .forEach((element) => element.classList.toggle("is-loading", isLoading && !element.classList.contains("hidden")));
  const trendPanel = document.getElementById("trend-chart")?.closest(".chart-panel");
  if (trendPanel) {
    trendPanel.classList.toggle("is-loading", isLoading);
  }
}

function scheduleLoadingState() {
  if (state.loadingTimer) {
    window.clearTimeout(state.loadingTimer);
  }
  state.loadingTimer = window.setTimeout(() => {
    setDashboardLoading(true);
  }, 120);
}

function clearLoadingState() {
  if (state.loadingTimer) {
    window.clearTimeout(state.loadingTimer);
    state.loadingTimer = null;
  }
  setDashboardLoading(false);
}

function isPredictiveScenarioOnlyUpdate(previousPayload, nextPayload) {
  return Boolean(
    previousPayload &&
      nextPayload &&
      previousPayload.page === "predictive" &&
      nextPayload.page === "predictive" &&
      previousPayload.start_date === nextPayload.start_date &&
      previousPayload.end_date === nextPayload.end_date &&
      previousPayload.scenario_mode !== nextPayload.scenario_mode &&
      previousPayload.trend?.length === nextPayload.trend?.length
  );
}

function prefetchPredictiveScenarios() {
  if (state.activePage !== "predictive") {
    return;
  }
  ["Base", "Conservative", "Upside"]
    .filter((scenario) => scenario !== elements.scenarioMode.value)
    .forEach((scenario, index) => {
      window.setTimeout(() => {
        const params = new URLSearchParams(buildDashboardQuery("predictive", null));
        params.set("scenario_mode", scenario);
        const query = params.toString();
        if (state.dashboardCache.has(query)) {
          return;
        }
        fetchJson(`/api/dashboard?${query}`)
          .then((payload) => writeDashboardCache(query, payload))
          .catch(() => {});
      }, 140 * (index + 1));
    });
}

function prefetchDashboardPages() {
  if (state.currentPayload?.view_mode === "drilldown") {
    return;
  }

  const token = ++state.prefetchToken;
  const pagesToPrefetch = PAGES.map((page) => page.key).filter(
    (pageKey) => pageKey !== state.activePage,
  );

  pagesToPrefetch.forEach((pageKey, index) => {
    window.setTimeout(() => {
      if (token !== state.prefetchToken || document.hidden) {
        return;
      }
      const query = buildDashboardQuery(pageKey, null);
      if (state.dashboardCache.has(query)) {
        return;
      }
      fetchJson(`/api/dashboard?${query}`)
        .then((payload) => {
          writeDashboardCache(query, payload);
        })
        .catch(() => {});
    }, 120 * (index + 1));
  });

  prefetchPredictiveScenarios();
}

function renderCards(cards) {
  elements.cardsGrid.innerHTML = "";
  cards.forEach((card) => {
    const wrapper = document.createElement("article");
    wrapper.className = "kpi-card glass-card";

    const trendClass = card.delta_pct >= 0 ? "up" : "down";
    wrapper.innerHTML = `
      <p class="kpi-title">${card.title}</p>
      <p class="kpi-value">${card.formatted_value}</p>
      <div class="kpi-footer">
        <span>Prev: ${card.formatted_previous_value}</span>
        <span class="delta-chip ${trendClass}">${formatPercent(card.delta_pct)}</span>
      </div>
    `;
    elements.cardsGrid.appendChild(wrapper);
  });
}

function uniqueNarrative(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item) {
      return false;
    }
    const normalized = item.trim();
    if (!normalized || seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

function renderStory(payload) {
  const supportLimit = payload.page === "predictive" ? 2 : 3;
  const narrative = uniqueNarrative([
    payload.summary?.[0],
    payload.insight_note,
    payload.summary?.[1],
    payload.summary?.[2],
    payload.interaction_hint,
  ]);

  if (!narrative.length) {
    elements.storyPanel.classList.add("hidden");
    elements.storyHighlight.textContent = "";
    elements.storySupport.innerHTML = "";
    return;
  }

  elements.storyPanel.classList.remove("hidden");
  elements.storyHighlight.textContent = narrative[0];
  elements.storySupport.innerHTML = "";

  narrative.slice(1, 1 + supportLimit).forEach((line) => {
    const note = document.createElement("div");
    note.className = "story-note supporting";
    note.textContent = line;
    elements.storySupport.appendChild(note);
  });
}

function renderSemanticMeta(payload) {
  elements.primaryMetric.innerHTML = "";
  elements.allowedActions.innerHTML = "";
  elements.metricConstraints.innerHTML = "";
  elements.primaryMetricDescription.textContent = "";

  const metricDefinitions = state.semanticLayer?.metrics || {};
  const metricDefinition = payload.primary_metric_key
    ? metricDefinitions[payload.primary_metric_key]
    : null;

  const primaryChip = document.createElement("span");
  primaryChip.className = "semantic-chip";
  primaryChip.textContent =
    metricDefinition?.label ||
    payload.trend_y_title ||
    payload.primary_metric_key ||
    "Not defined";
  elements.primaryMetric.appendChild(primaryChip);

  elements.primaryMetricDescription.textContent =
    metricDefinition?.description || "";

  const constraintGroups = [
    ...(metricDefinition?.allowed_granularities || []).map(
      (item) => `granularity: ${item}`,
    ),
    ...(metricDefinition?.allowed_comparisons || []).map(
      (item) => `comparison: ${item}`,
    ),
  ];

  const constraints = constraintGroups.length
    ? constraintGroups
    : ["governed metric"];
  constraints.forEach((constraint) => {
    const chip = document.createElement("span");
    chip.className = "semantic-chip subtle";
    chip.textContent = constraint;
    elements.metricConstraints.appendChild(chip);
  });

  const actions = payload.allowed_actions?.length
    ? payload.allowed_actions
    : ["overview_only"];

  actions.forEach((action) => {
    const chip = document.createElement("span");
    chip.className = "semantic-chip subtle";
    chip.textContent = action.replaceAll("_", " ");
    elements.allowedActions.appendChild(chip);
  });
}

function renderQuickActions() {
  elements.quickActions.innerHTML = "";
  const actions = [
    ...(QUICK_ACTIONS[state.activePage] || []),
    ...(QUICK_ACTIONS.default || []),
  ];

  actions.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quick-action-btn";
    button.textContent = action.label;
    button.addEventListener("click", async () => {
      openAssistantDrawer();
      elements.assistantRequest.value = action.prompt;
      await requestAssistantSuggestions(action.prompt);
    });
    elements.quickActions.appendChild(button);
  });
}

function renderSuggestionChangeTags(suggestion) {
  const fields = Object.keys(suggestion.after || {}).filter(
    (field) => field !== "metric_key",
  );
  if (!fields.length) {
    return "";
  }
  return `
    <div class="agent-change-list">
      ${fields
        .map(
          (field) =>
            `<span class="agent-change-tag">${field.replaceAll("_", " ")}</span>`,
        )
        .join("")}
    </div>
  `;
}
function renderSuggestions() {
  elements.suggestionsList.innerHTML = "";
  if (!state.suggestions.length) {
    elements.suggestionsList.innerHTML =
      '<div class="empty-state">No governed suggestions matched this request. Try a simpler change request.</div>';
    return;
  }

  state.suggestions.forEach((suggestion) => {
    const card = document.createElement("article");
    card.className = "agent-card";
    card.innerHTML = `
      <div class="agent-meta-row">
        <span class="agent-tag">${suggestion.target.replaceAll("_", " ")}</span>
        <span class="agent-tag">${pageLabel(suggestion.page)}</span>
      </div>
      <h3>${suggestion.title}</h3>
      <p>${suggestion.rationale}</p>
      ${renderSuggestionChangeTags(suggestion)}
      <div class="agent-card-actions">
        <button type="button" data-action="preview">Preview</button>
        <button type="button" data-action="queue">Add to review queue</button>
        <button type="button" data-action="advanced" class="secondary-btn">Open in advanced editor</button>
      </div>
    `;

    card
      .querySelector('[data-action="preview"]')
      .addEventListener("click", async () => {
        await previewSuggestion(suggestion);
      });

    card
      .querySelector('[data-action="queue"]')
      .addEventListener("click", async () => {
        await createProposalFromSuggestion(suggestion);
      });

    card
      .querySelector('[data-action="advanced"]')
      .addEventListener("click", () => {
        elements.proposalTitle.value = suggestion.title;
        elements.proposalTarget.value = suggestion.target;
        elements.proposalRationale.value = suggestion.rationale;
        elements.proposalAfter.value = JSON.stringify(suggestion.after, null, 2);
        showAgentStatus(
          "Suggestion loaded into the advanced editor.",
          "success",
        );
      });

    elements.suggestionsList.appendChild(card);
  });
}

function renderProposalQueue() {
  elements.proposalQueue.innerHTML = "";
  if (!state.proposals.length) {
    elements.proposalQueue.innerHTML =
      '<div class="empty-state">No proposals in review yet.</div>';
    return;
  }

  state.proposals
    .slice()
    .reverse()
    .forEach((proposal) => {
      const card = document.createElement("article");
      card.className = "agent-card";
      const statusClass =
        proposal.status === "approved"
          ? "approved"
          : proposal.status === "rejected"
            ? "rejected"
            : "";
      card.innerHTML = `
      <div class="agent-meta-row">
        <span class="agent-tag ${statusClass}">${proposal.status}</span>
        <span class="agent-tag">${proposal.target.replaceAll("_", " ")}</span>
        <span class="agent-tag">${proposal.page ? pageLabel(proposal.page) : "Semantic Layer"}</span>
      </div>
      <h3>${proposal.title}</h3>
      <p>${proposal.rationale}</p>
      <div class="agent-card-actions">
        <button type="button" data-action="preview">Preview</button>
        <button type="button" data-action="approve">Approve</button>
        <button type="button" data-action="reject">Reject</button>
        ${proposal.status === "approved" && !proposal.applied_to_draft_at ? '<button type="button" data-action="apply-draft">Apply to draft</button>' : ""}
        ${proposal.applied_to_draft_at ? '<span class="agent-tag approved">applied to draft</span>' : ""}
      </div>
    `;

      card
        .querySelector('[data-action="preview"]')
        .addEventListener("click", async () => {
          await previewProposal(proposal.proposal_id);
        });

      card
        .querySelector('[data-action="approve"]')
        .addEventListener("click", async () => {
          await updateProposalStatus(proposal.proposal_id, "approved");
        });

      card
        .querySelector('[data-action="reject"]')
        .addEventListener("click", async () => {
          await updateProposalStatus(proposal.proposal_id, "rejected");
        });

      const applyDraftButton = card.querySelector(
        '[data-action="apply-draft"]',
      );
      if (applyDraftButton) {
        applyDraftButton.addEventListener("click", async () => {
          await applyProposalToDraft(proposal.proposal_id);
        });
      }

      elements.proposalQueue.appendChild(card);
    });
}

function renderProposalPreview() {
  elements.proposalPreview.innerHTML = "";
  if (!state.proposalPreview) {
    elements.proposalPreview.innerHTML =
      '<div class="empty-state">Preview a suggestion or a queued proposal to inspect the exact governed change before applying it.</div>';
    return;
  }

  const preview = state.proposalPreview;
  const wrapper = document.createElement("article");
  wrapper.className = "agent-card";
  const changes = preview.changes?.length
    ? preview.changes
        .map(
          (change) => `
        <div class="preview-change">
          <span class="agent-tag">${change.field}</span>
          <p>Before: ${JSON.stringify(change.before)}</p>
          <p>After: ${JSON.stringify(change.after)}</p>
        </div>
      `,
        )
        .join("")
    : '<div class="empty-state">No effective changes detected for this proposal.</div>';

  wrapper.innerHTML = `
    <div class="agent-meta-row">
      <span class="agent-tag">${preview.proposal.target.replaceAll("_", " ")}</span>
      <span class="agent-tag">${preview.scope_key}</span>
    </div>
    <h3>${preview.proposal.title}</h3>
    <p>${preview.proposal.rationale}</p>
    <div class="preview-change-list">${changes}</div>
  `;
  elements.proposalPreview.appendChild(wrapper);
}

function renderDraftState() {
  elements.draftState.innerHTML = "";
  const pageEntries = Object.entries(state.drafts?.page_overrides || {});
  const metricEntries = Object.entries(state.drafts?.metric_overrides || {});

  if (!pageEntries.length && !metricEntries.length) {
    elements.draftState.innerHTML =
      '<div class="empty-state">No active draft overrides.</div>';
    return;
  }

  pageEntries.forEach(([pageKey, override]) => {
    const item = document.createElement("article");
    item.className = "agent-card";
    item.innerHTML = `
      <div class="agent-meta-row">
        <span class="agent-tag">page draft</span>
        <span class="agent-tag">${pageLabel(pageKey)}</span>
      </div>
      <p>${Object.keys(override).join(", ")}</p>
    `;
    elements.draftState.appendChild(item);
  });

  metricEntries.forEach(([metricKey, override]) => {
    const item = document.createElement("article");
    item.className = "agent-card";
    item.innerHTML = `
      <div class="agent-meta-row">
        <span class="agent-tag">metric draft</span>
        <span class="agent-tag">${metricKey}</span>
      </div>
      <p>${Object.keys(override).join(", ")}</p>
    `;
    elements.draftState.appendChild(item);
  });
}

function renderAuditLog() {
  elements.auditLog.innerHTML = "";
  if (!state.auditEvents.length) {
    elements.auditLog.innerHTML =
      '<div class="empty-state">No audit events yet.</div>';
    return;
  }

  state.auditEvents
    .slice()
    .reverse()
    .forEach((event) => {
      const item = document.createElement("article");
      item.className = "agent-card";
      const timestamp = event.created_at
        ? new Date(event.created_at).toLocaleString()
        : "Unknown time";
      item.innerHTML = `
      <div class="agent-meta-row">
        <span class="agent-tag">${event.event_type.replaceAll("_", " ")}</span>
        ${event.status ? `<span class="agent-tag">${event.status}</span>` : ""}
      </div>
      <p>${event.proposal_id || "No proposal id"}</p>
      <p class="agent-timestamp">${timestamp}</p>
    `;
      elements.auditLog.appendChild(item);
    });
}
async function loadGovernanceData() {
  const [proposalsPayload, draftsPayload, auditPayload] = await Promise.all([
    fetchJson("/api/agent/proposals"),
    fetchJson("/api/agent/drafts"),
    fetchJson("/api/agent/audit-log"),
  ]);

  state.proposals = proposalsPayload.proposals;
  state.drafts = draftsPayload;
  state.auditEvents = auditPayload.events;
  state.governanceLoaded = true;

  renderProposalQueue();
  renderProposalPreview();
  renderDraftState();
  renderAuditLog();
}

async function requestAssistantSuggestions(request = "") {
  const trimmedRequest = request.trim();
  try {
    const payload = await sendJson("/api/agent/assist", "POST", {
      page: state.activePage,
      request: trimmedRequest,
      limit: 4,
    });
    state.suggestions = payload.suggestions;
    state.suggestionPage = state.activePage;
    renderSuggestions();

    if (trimmedRequest) {
      if (payload.suggestions.length) {
        showAgentStatus(
          `Found ${payload.suggestions.length} governed suggestion(s) for \"${trimmedRequest}\".`,
          "success",
        );
      } else {
        showAgentStatus(
          "No governed suggestions matched that request. Try a simpler instruction.",
          "error",
        );
      }
    } else {
      showAgentStatus(
        `Showing default governed suggestions for ${pageLabel()}.`,
        "info",
      );
    }
  } catch (error) {
    state.suggestions = [];
    state.suggestionPage = null;
    renderSuggestions();
    showAgentStatus(error.message, "error");
  }
}

async function previewSuggestion(suggestion) {
  try {
    state.proposalPreview = await sendJson(
      "/api/agent/proposals/preview",
      "POST",
      {
        page: suggestion.page,
        target: suggestion.target,
        title: suggestion.title,
        rationale: suggestion.rationale,
        before: suggestion.before || {},
        after: suggestion.after || {},
      },
    );
    renderProposalPreview();
    showAgentStatus("Preview generated for the selected suggestion.", "success");
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }
    showAgentStatus(error.message, "error");
  }
}

async function createProposalFromSuggestion(suggestion) {
  try {
    await sendJson("/api/agent/proposals", "POST", {
      page: suggestion.page,
      target: suggestion.target,
      title: suggestion.title,
      rationale: suggestion.rationale,
      before: suggestion.before || {},
      after: suggestion.after || {},
    });
    await loadGovernanceData();
    showAgentStatus("Suggestion added to the review queue.", "success");
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }
    showAgentStatus(error.message, "error");
  } finally {
    if (requestToken === state.focusRequestToken) {
      state.focusAbortController = null;
    }
  }
}

async function updateProposalStatus(proposalId, status) {
  try {
    await sendJson(`/api/agent/proposals/${proposalId}`, "PATCH", {
      status,
      reviewer_note: `${status} from dashboard UI`,
    });
    await loadGovernanceData();
    showAgentStatus(`Proposal ${status}.`, "success");
  } catch (error) {
    showAgentStatus(error.message, "error");
  }
}

async function applyProposalToDraft(proposalId) {
  try {
    await sendJson(`/api/agent/proposals/${proposalId}/apply-draft`, "POST", {});
    await loadSemanticLayer();
    await loadDashboard();
    await previewProposal(proposalId);
    await requestAssistantSuggestions(elements.assistantRequest.value);
    showAgentStatus(
      "Approved proposal applied to draft and reflected in the page.",
      "success",
    );
  } catch (error) {
    showAgentStatus(error.message, "error");
  }
}

async function previewProposal(proposalId) {
  try {
    state.proposalPreview = await fetchJson(
      `/api/agent/proposals/${proposalId}/preview`,
    );
    renderProposalPreview();
    showAgentStatus("Preview generated for the selected proposal.", "success");
  } catch (error) {
    showAgentStatus(error.message, "error");
  }
}

async function previewProposalForm() {
  let afterPayload = {};
  try {
    if (elements.proposalAfter.value.trim()) {
      afterPayload = JSON.parse(elements.proposalAfter.value);
    }
  } catch (error) {
    showAgentStatus(`Invalid proposal JSON: ${error.message}`, "error");
    return;
  }

  try {
    state.proposalPreview = await sendJson(
      "/api/agent/proposals/preview",
      "POST",
      {
        page: state.activePage,
        target: elements.proposalTarget.value,
        title: elements.proposalTitle.value || "Form Preview",
        rationale:
          elements.proposalRationale.value ||
          "Unsaved preview from current form.",
        before: {
          cards: state.currentPayload?.cards?.map((card) => card.key) || [],
          primary_metric_key: state.currentPayload?.primary_metric_key || null,
        },
        after: afterPayload,
      },
    );
    renderProposalPreview();
    showAgentStatus("Preview generated from the advanced editor.", "success");
  } catch (error) {
    showAgentStatus(error.message, "error");
  }
}

async function clearDrafts() {
  try {
    const response = await fetch("/api/agent/drafts", { method: "DELETE" });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Request failed (${response.status}): ${errorBody}`);
    }
    state.proposalPreview = null;
    await loadSemanticLayer();
    await loadDashboard();
    await requestAssistantSuggestions(elements.assistantRequest.value);
    showAgentStatus("Draft overrides cleared.", "success");
  } catch (error) {
    showAgentStatus(error.message, "error");
  }
}
function clearFocusDetail() {
  state.currentFocusDetail = null;
  renderFocusDetail(null);
}

function focusMetaLabel(payload) {
  if (!payload || state.activePage !== "predictive") {
    return "";
  }
  return `Scenario: ${elements.scenarioMode.value}`;
}

async function loadFocusDetail(drilldownKey, drilldownValue) {
  if (!drilldownKey || !drilldownValue) {
    return;
  }
  const query = new URLSearchParams(buildDashboardQuery());
  query.set("drilldown_key", drilldownKey);
  query.set("drilldown_value", drilldownValue);
  const cacheKey = query.toString();
  const requestToken = ++state.focusRequestToken;
  try {
    let payload = readFocusDetailCache(cacheKey);
    if (!payload) {
      if (state.focusAbortController) {
        state.focusAbortController.abort();
      }
      state.focusAbortController = new AbortController();
      elements.focusPanel.classList.remove("hidden");
      elements.focusPanel.classList.add("is-loading");
      payload = await fetchJson(`/api/dashboard/detail?${cacheKey}`, { signal: state.focusAbortController.signal });
      writeFocusDetailCache(cacheKey, payload);
    }
    if (requestToken !== state.focusRequestToken) {
      return;
    }
    state.currentFocusDetail = payload;
    renderFocusDetail(payload);
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }
    showAgentStatus(error.message, "error");
  } finally {
    if (requestToken === state.focusRequestToken) {
      elements.focusPanel.classList.remove("is-loading");
      state.focusAbortController = null;
    }
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function middleEllipsis(value, lead = 30, tail = 18) {
  const text = String(value || "");
  if (text.length <= lead + tail + 3) {
    return text;
  }
  return `${text.slice(0, lead).trimEnd()}...${text.slice(-tail).trimStart()}`;
}

function formatTableCellValue(columnKey, rawValue) {
  const text = String(rawValue ?? "");
  if (columnKey === "product") {
    return {
      className: "long-text-cell",
      html: `<span class="cell-long-text" title="${escapeHtml(text)}">${escapeHtml(middleEllipsis(text, 34, 22))}</span>`,
    };
  }
  if (columnKey === "customer") {
    return {
      className: "long-text-cell medium",
      html: `<span class="cell-long-text" title="${escapeHtml(text)}">${escapeHtml(middleEllipsis(text, 24, 16))}</span>`,
    };
  }
  return { className: "", html: escapeHtml(text) };
}


function parseTableSortValue(rawValue) {
  const text = String(rawValue ?? "").trim();
  if (!text) {
    return { kind: "string", value: "" };
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const dateValue = Date.parse(text);
    if (!Number.isNaN(dateValue)) {
      return { kind: "number", value: dateValue };
    }
  }

  const numericCandidate = text
    .replace(/,/g, "")
    .replace(/\s*pp$/i, "")
    .replace(/%/g, "")
    .replace(/[^0-9.+-]/g, "");
  if (numericCandidate && /^[-+]?\d*\.?\d+$/.test(numericCandidate)) {
    return { kind: "number", value: Number(numericCandidate) };
  }

  return { kind: "string", value: text.toLowerCase() };
}

function sortTableRows(rows, sortKey, sortDirection) {
  if (!sortKey || !sortDirection) {
    return rows.slice();
  }
  return rows.slice().sort((leftRow, rightRow) => {
    const left = parseTableSortValue(leftRow.values?.[sortKey] ?? "");
    const right = parseTableSortValue(rightRow.values?.[sortKey] ?? "");
    let comparison = 0;
    if (left.kind === "number" && right.kind === "number") {
      comparison = left.value - right.value;
    } else {
      comparison = String(left.value).localeCompare(String(right.value));
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });
}

function inferDefaultTableSort(tablePayload) {
  const preferredKeys = [
    "forecast_selected",
    "revenue",
    "sales",
    "share",
    "forecast_share",
    "customers",
    "orders",
    "latest_month",
    "current",
    "size",
  ];
  const availableKeys = new Set((tablePayload.columns || []).map((column) => column.key));
  const preferred = preferredKeys.find((key) => availableKeys.has(key));
  if (preferred) {
    return { sortKey: preferred, sortDirection: "desc" };
  }
  return { sortKey: "", sortDirection: "" };
}

function describeTableSort(tablePayload, sortKey, sortDirection) {
  if (!sortKey || !sortDirection) {
    return "";
  }
  const column = (tablePayload.columns || []).find((item) => item.key === sortKey);
  if (!column) {
    return "";
  }
  return `Sorted by ${column.label} ${sortDirection === "asc" ? "ascending" : "descending"}`;
}

function rowsToCsv(columns, rows) {
  const escapeCsv = (value) => {
    const text = String(value ?? "");
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };
  const lines = [
    columns.map((column) => escapeCsv(column.label)).join(","),
    ...rows.map((row) => columns.map((column) => escapeCsv(row.values?.[column.key] ?? "")).join(",")),
  ];
  return lines.join("\n");
}

function downloadTableCsv(tablePayload, rows) {
  const csv = rowsToCsv(tablePayload.columns || [], rows || []);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const slug = String(tablePayload.title || "detail")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "detail";
  link.href = url;
  link.download = `${slug}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function filterTableRows(rows, searchTerm) {
  const normalized = String(searchTerm || "").trim().toLowerCase();
  if (!normalized) {
    return rows.slice();
  }
  return rows.filter((row) =>
    Object.values(row.values || {}).some((value) =>
      String(value ?? "").toLowerCase().includes(normalized),
    ),
  );
}

function renderTableMarkup(tablePayload, container, pageSize = 10) {
  const rows = tablePayload.rows || [];
  const tableSignature = [
    tablePayload.title || "",
    tablePayload.columns.map((column) => column.key).join("|"),
    rows.length,
  ].join("::");
  if (container.dataset.tableSignature !== tableSignature) {
    container.dataset.tableSignature = tableSignature;
    container.dataset.page = "1";
    container.dataset.search = "";
    const defaultSort = inferDefaultTableSort(tablePayload);
    container.dataset.sortKey = defaultSort.sortKey;
    container.dataset.sortDirection = defaultSort.sortDirection;
  }

  const renderPage = () => {
    const searchTerm = container.dataset.search || "";
    const sortKey = container.dataset.sortKey || "";
    const sortDirection = container.dataset.sortDirection || "";
    const filteredRows = filterTableRows(rows, searchTerm);
    const sortedRows = sortTableRows(filteredRows, sortKey, sortDirection);
    const sortDescription = describeTableSort(tablePayload, sortKey, sortDirection);
    const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
    let page = Math.min(
      Math.max(Number(container.dataset.page || "1"), 1),
      totalPages,
    );
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageRows = sortedRows.slice(start, end);
    const toolbar = `
      <div class="table-toolbar">
        <div class="table-search-wrap">
          <input type="search" class="table-search" placeholder="Search rows" value="${escapeHtml(searchTerm)}" />
        </div>
        <div class="table-toolbar-actions">
          <div class="table-toolbar-meta-wrap">
            <div class="table-toolbar-meta">${filteredRows.length} matching row${filteredRows.length === 1 ? "" : "s"}</div>
            ${sortDescription ? `<div class="table-sort-hint">${escapeHtml(sortDescription)}</div>` : ""}
          </div>
          <button type="button" class="secondary-btn table-export-btn">Export filtered CSV</button>
        </div>
      </div>
    `;
    const thead = `
      <thead>
        <tr>${tablePayload.columns
          .map((column) => {
            const headerClass = ["product", "customer"].includes(column.key)
              ? ' long-text-cell-header'
              : "";
            const isSorted = sortKey === column.key;
            const indicator = isSorted ? (sortDirection === "asc" ? "^" : "v") : "";
            return `<th class="sortable-header-cell${headerClass}"><button type="button" class="sortable-header${isSorted ? " sorted" : ""}" data-sort-key="${escapeHtml(column.key)}"><span>${escapeHtml(column.label)}</span><span class="sort-indicator">${indicator}</span></button></th>`;
          })
          .join("")}</tr>
      </thead>
    `;
    const tbody = pageRows.length
      ? `
      <tbody>
        ${pageRows
          .map((row) => {
            const interactionType = row.interaction_type || "";
            const interactionKey = row.interaction_key || "";
            const interactionValue = row.interaction_value || "";
            const rowClass = interactionType === "detail" ? "detail-row-interactive" : "";
            return `<tr class="${rowClass}" data-interaction-type="${escapeHtml(interactionType)}" data-interaction-key="${escapeHtml(interactionKey)}" data-interaction-value="${escapeHtml(interactionValue)}">${tablePayload.columns
              .map((column) => {
                const cell = formatTableCellValue(column.key, row.values[column.key] ?? "");
                const classAttr = cell.className ? ` class="${cell.className}"` : "";
                return `<td${classAttr}>${cell.html}</td>`;
              })
              .join("")}</tr>`;
          })
          .join("")}
      </tbody>
    `
      : `<tbody><tr><td colspan="${tablePayload.columns.length}"><div class="empty-state table-empty-state">No matching rows for the current search.</div></td></tr></tbody>`;

    const pager = filteredRows.length > pageSize
      ? `<div class="table-pager"><span class="table-pager-meta">Rows ${filteredRows.length ? start + 1 : 0}-${Math.min(end, filteredRows.length)} of ${filteredRows.length}</span><div class="table-pager-actions"><span class="table-pager-page">Page ${page} of ${totalPages}</span><button type="button" class="secondary-btn table-pager-btn" data-page-action="prev" ${page === 1 ? "disabled" : ""}>Prev</button><button type="button" class="secondary-btn table-pager-btn" data-page-action="next" ${page === totalPages ? "disabled" : ""}>Next</button></div></div>`
      : "";

    container.innerHTML = `${toolbar}<table class="detail-table">${thead}${tbody}</table>${pager}`;
    container.dataset.page = String(page);

    const searchInput = container.querySelector(".table-search");
    if (searchInput) {
      searchInput.addEventListener("input", (event) => {
        container.dataset.search = event.target.value || "";
        container.dataset.page = "1";
        renderPage();
      });
    }

    const exportButton = container.querySelector(".table-export-btn");
    if (exportButton) {
      exportButton.addEventListener("click", () => {
        downloadTableCsv(tablePayload, sortedRows);
      });
    }

    container
      .querySelectorAll('.sortable-header[data-sort-key]')
      .forEach((button) => {
        button.addEventListener("click", () => {
          const nextSortKey = button.dataset.sortKey || "";
          const currentSortKey = container.dataset.sortKey || "";
          const currentDirection = container.dataset.sortDirection || "";
          if (currentSortKey === nextSortKey) {
            container.dataset.sortDirection = currentDirection === "desc" ? "asc" : currentDirection === "asc" ? "" : "desc";
            if (!container.dataset.sortDirection) {
              container.dataset.sortKey = "";
            }
          } else {
            container.dataset.sortKey = nextSortKey;
            container.dataset.sortDirection = "desc";
          }
          container.dataset.page = "1";
          renderPage();
        });
      });

    container
      .querySelectorAll('tr[data-interaction-type="detail"]')
      .forEach((row) => {
        row.addEventListener("click", () => {
          loadFocusDetail(row.dataset.interactionKey, row.dataset.interactionValue);
        });
      });

    container
      .querySelectorAll('[data-page-action]')
      .forEach((button) => {
        button.addEventListener("click", () => {
          page += button.dataset.pageAction === "next" ? 1 : -1;
          page = Math.max(1, Math.min(page, totalPages));
          container.dataset.page = String(page);
          renderPage();
          container.scrollTop = 0;
        });
      });
  };

  renderPage();
}

function renderFocusDetail(payload) {
  if (!payload || !payload.table || !payload.table.rows?.length) {
    elements.focusPanel.classList.add("hidden");
    elements.focusTitle.textContent = "Focus Detail";
    elements.focusMeta.textContent = "";
    elements.focusMeta.classList.add("hidden");
    elements.focusSubtitle.textContent = "";
    elements.focusTable.innerHTML = "";
    elements.focusClear.classList.add("hidden");
    return;
  }

  elements.focusPanel.classList.remove("hidden");
  elements.focusTitle.textContent = payload.title;
  const meta = focusMetaLabel(payload);
  elements.focusMeta.textContent = meta;
  elements.focusMeta.classList.toggle("hidden", !meta);
  elements.focusSubtitle.textContent = payload.subtitle || "";
  elements.focusClear.classList.remove("hidden");
  renderTableMarkup(payload.table, elements.focusTable, 12);
}

function bindSecondaryChartInteraction(chartPayload) {
  const chartEl = document.getElementById("secondary-chart");
  if (!chartEl || typeof chartEl.on !== "function") {
    return;
  }
  if (typeof chartEl.removeAllListeners === "function") {
    chartEl.removeAllListeners("plotly_click");
  }

  if (chartPayload?.interaction_type === "detail" && chartPayload?.interaction_key) {
    chartEl.style.cursor = "pointer";
    chartEl.on("plotly_click", (eventData) => {
      const point = eventData?.points?.[0];
      if (!point) {
        return;
      }
      const selectedPoint = chartPayload.points[point.pointIndex];
      const rawLabel = selectedPoint?.raw_label || selectedPoint?.label;
      if (!rawLabel) {
        return;
      }
      loadFocusDetail(chartPayload.interaction_key, rawLabel);
    });
    return;
  }

  if (!chartPayload?.filter_key) {
    chartEl.style.cursor = "default";
    return;
  }

  chartEl.style.cursor = "pointer";
  chartEl.on("plotly_click", (eventData) => {
    const point = eventData?.points?.[0];
    if (!point) {
      return;
    }
    const selectedPoint = chartPayload.points[point.pointIndex];
    const rawLabel = selectedPoint?.raw_label || selectedPoint?.label;
    if (!rawLabel) {
      return;
    }
    const selectElement =
      chartPayload.filter_key === "category"
        ? elements.categories
        : chartPayload.filter_key === "city"
          ? elements.cities
          : null;
    if (!selectElement) {
      return;
    }

    const current = selectedValues(selectElement);
    const next = current.length === 1 && current[0] === rawLabel ? [] : [rawLabel];
    setSelectValues(selectElement, next);
    syncCustomFilters();
    scheduleFilterReload();
  });
}

function renderSecondaryChart(chartPayload, options = {}) {
  if (!chartPayload || !chartPayload.points?.length) {
    elements.secondaryPanel.classList.add("hidden");
    if (typeof Plotly !== "undefined") {
      Plotly.purge("secondary-chart");
    }
    return;
  }

  elements.secondaryPanel.classList.remove("hidden");
  elements.secondaryTitle.textContent = chartPayload.title;

  const x = chartPayload.points.map((point) => point.label);
  const scenarioOnly = Boolean(options.scenarioOnly);
  const secondaryChartEl = document.getElementById("secondary-chart");
  const current = chartPayload.points.map((point) => point.current_value);
  const previous = chartPayload.points.map((point) => point.previous_value);
  const custom = chartPayload.points.map((point) => [
    point.current_value,
    point.previous_value,
    point.delta_pct,
    point.raw_label || point.label,
    point.share_pct,
    point.previous_share_pct,
    point.share_shift_pct,
    point.cumulative_pct,
    point.segment_class,
  ]);
  const { isPercentMetric, valueFormat, valueSuffix, axisTickFormat } =
    metricPresentation(chartPayload.metric_format);
  const hasShareShift = chartPayload.points.some(
    (point) => point.share_shift_pct !== null && point.share_shift_pct !== undefined,
  );
  const shareShiftLine = hasShareShift ? "Share Shift: %{customdata[6]:+.2f} pp<br>" : "";

  if (chartPayload.analysis_mode === "donut") {
    const values = chartPayload.points.map((point) => point.share_pct ?? 0);
    if (scenarioOnly && secondaryChartEl?.data?.length === 1 && secondaryChartEl.data[0]?.type === "pie") {
      Plotly.update(
        "secondary-chart",
        {
          labels: [x],
          values: [values],
          customdata: [custom],
        },
        {},
        [0],
      );
      bindSecondaryChartInteraction(chartPayload);
      return;
    }
    Plotly.react(
      "secondary-chart",
      [
        {
          type: "pie",
          hole: 0.56,
          labels: x,
          values,
          customdata: custom,
          marker: { colors: ["#67b8ff", "#f7b267", "#5fd3bc"] },
          sort: false,
          textinfo: "label+percent",
          hovertemplate:
            "<b>%{label}</b><br>" +
            "Revenue Share: %{percent}<br>" +
            `Current Revenue: %{customdata[0]:${valueFormat}}${valueSuffix}<br>` +
            `Previous Revenue: %{customdata[1]:${valueFormat}}${valueSuffix}<br>` +
            shareShiftLine +
            "Delta: %{customdata[2]:+.2f}%<extra></extra>",
        },
      ],
      {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(22, 49, 84, 0.58)",
        margin: { l: 24, r: 24, t: 24, b: 24 },
        showlegend: true,
        legend: {
          orientation: "h",
          x: 0.5,
          y: 1.12,
          xanchor: "center",
          yanchor: "top",
          font: { color: "#c5d9f5" },
        },
      },
      { responsive: true, displaylogo: false },
    );

    bindSecondaryChartInteraction(chartPayload);
    return;
  }

  if (chartPayload.analysis_mode === "pareto") {
    const cumulative = chartPayload.points.map((point) => point.cumulative_pct || 0);
    if (scenarioOnly && secondaryChartEl?.data?.length === 2) {
      Plotly.update(
        "secondary-chart",
        {
          x: [x, x],
          y: [current, cumulative],
          customdata: [custom, custom],
          name: [
            chartPayload.current_series_name,
            chartPayload.cumulative_series_name || "Cumulative Share",
          ],
        },
        {},
        [0, 1],
      );
      bindSecondaryChartInteraction(chartPayload);
      return;
    }
    const paretoBar = {
      type: "bar",
      name: chartPayload.current_series_name,
      x,
      y: current,
      marker: { color: "rgba(103,184,255,0.82)" },
      customdata: custom,
      hovertemplate:
        "<b>%{customdata[3]}</b><br>" +
        `Revenue: %{y:${valueFormat}}${valueSuffix}<br>` +
        "Share: %{customdata[4]:.2f}%<br>" +
        shareShiftLine +
        "Cumulative: %{customdata[7]:.2f}%<br>" +
        "ABC Class: %{customdata[8]}<br>" +
        `Previous: %{customdata[1]:${valueFormat}}${valueSuffix}<br>` +
        "Delta: %{customdata[2]:+.2f}%<extra></extra>",
    };

    const cumulativeTrace = {
      type: "scatter",
      mode: "lines+markers",
      name: chartPayload.cumulative_series_name || "Cumulative Share",
      x,
      y: cumulative,
      yaxis: "y2",
      line: { color: "#f7b267", width: 3 },
      marker: { size: 7, color: "#f7b267" },
      customdata: custom,
      hovertemplate:
        "<b>%{customdata[3]}</b><br>" +
        "Cumulative Share: %{y:.2f}%<br>" +
        "ABC Class: %{customdata[8]}<extra></extra>",
    };

    Plotly.react(
      "secondary-chart",
      [paretoBar, cumulativeTrace],
      {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(22, 49, 84, 0.58)",
        margin: { l: 86, r: 72, t: 24, b: 92 },
        xaxis: {
          title: { text: chartPayload.x_title, standoff: 12 },
          color: "#c5d9f5",
          tickangle: -24,
          automargin: true,
          tickfont: { size: 11 },
          gridcolor: "rgba(130, 175, 226, 0.16)",
        },
        yaxis: {
          title: { text: chartPayload.y_title, standoff: 12 },
          color: "#c5d9f5",
          automargin: true,
          tickfont: { size: 11 },
          gridcolor: "rgba(130, 175, 226, 0.16)",
          separatethousands: !isPercentMetric,
          tickformat: axisTickFormat,
          ticksuffix: valueSuffix,
        },
        yaxis2: {
          title: { text: chartPayload.cumulative_y_title || "Cumulative Share", standoff: 12 },
          overlaying: "y",
          side: "right",
          range: [0, 100],
          color: "#f7b267",
          tickfont: { size: 11 },
          tickformat: ".0f",
          ticksuffix: "%",
          zeroline: false,
        },
        legend: {
          orientation: "h",
          x: 1,
          y: 1.12,
          xanchor: "right",
          yanchor: "top",
          font: { color: "#c5d9f5" },
        },
        shapes: [
          {
            type: "line",
            xref: "paper",
            x0: 0,
            x1: 1,
            yref: "y2",
            y0: 80,
            y1: 80,
            line: { color: "rgba(247,178,103,0.4)", width: 1.5, dash: "dash" },
          },
        ],
      },
      { responsive: true, displaylogo: false },
    );

    bindSecondaryChartInteraction(chartPayload);
    return;
  }

  const currentTrace =
    chartPayload.current_trace_style === "line"
      ? {
          type: "scatter",
          mode: "lines+markers",
          name: chartPayload.current_series_name,
          x,
          y: current,
          line: { color: "#67b8ff", width: 3 },
          marker: { size: 6 },
          customdata: custom,
          hovertemplate:
            "<b>%{customdata[3]}</b><br>" +
            `${chartPayload.current_series_name}: %{y:${valueFormat}}${valueSuffix}<br>` +
            `${chartPayload.previous_series_name}: %{customdata[1]:${valueFormat}}${valueSuffix}<br>` +
            shareShiftLine +
            "Delta: %{customdata[2]:+.2f}%<extra></extra>",
        }
      : {
          type: "bar",
          name: chartPayload.current_series_name,
          x,
          y: current,
          marker: { color: "rgba(103,184,255,0.82)" },
          customdata: custom,
          hovertemplate:
            "<b>%{customdata[3]}</b><br>" +
            `${chartPayload.current_series_name}: %{y:${valueFormat}}${valueSuffix}<br>` +
            `${chartPayload.previous_series_name}: %{customdata[1]:${valueFormat}}${valueSuffix}<br>` +
            shareShiftLine +
            "Delta: %{customdata[2]:+.2f}%<extra></extra>",
        };

  const previousTrace =
    chartPayload.previous_trace_style === "line"
      ? {
          type: "scatter",
          mode: "lines+markers",
          name: chartPayload.previous_series_name,
          x,
          y: previous,
          line: { color: "#f7b267", width: 2, dash: "dot" },
          marker: { size: 5 },
          customdata: custom,
          hovertemplate:
            "<b>%{customdata[3]}</b><br>" +
            `${chartPayload.previous_series_name}: %{y:${valueFormat}}${valueSuffix}<extra></extra>`,
        }
      : {
          type: "bar",
          name: chartPayload.previous_series_name,
          x,
          y: previous,
          marker: { color: "rgba(247,178,103,0.72)" },
          customdata: custom,
          hovertemplate:
            "<b>%{customdata[3]}</b><br>" +
            `${chartPayload.previous_series_name}: %{y:${valueFormat}}${valueSuffix}<extra></extra>`,
        };

  if (scenarioOnly && chartPayload.analysis_mode === "comparison" && secondaryChartEl?.data?.length === 2) {
    Plotly.update(
      "secondary-chart",
      {
        x: [x, x],
        y: [current, previous],
        customdata: [custom, custom],
        name: [chartPayload.current_series_name, chartPayload.previous_series_name],
      },
      {},
      [0, 1],
    );
    bindSecondaryChartInteraction(chartPayload);
    return;
  }

  Plotly.react(
    "secondary-chart",
    [currentTrace, previousTrace],
    {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(22, 49, 84, 0.58)",
      margin: { l: 86, r: 20, t: 24, b: 92 },
      barmode:
        chartPayload.current_trace_style === "bar" &&
        chartPayload.previous_trace_style === "bar"
          ? "group"
          : undefined,
      xaxis: {
        title: { text: chartPayload.x_title, standoff: 12 },
        color: "#c5d9f5",
        tickangle: -24,
        automargin: true,
        tickfont: { size: 11 },
        gridcolor: "rgba(130, 175, 226, 0.16)",
      },
      yaxis: {
        title: { text: chartPayload.y_title, standoff: 12 },
        color: "#c5d9f5",
        automargin: true,
        tickfont: { size: 11 },
        gridcolor: "rgba(130, 175, 226, 0.16)",
        separatethousands: !isPercentMetric,
        tickformat: axisTickFormat,
        ticksuffix: valueSuffix,
      },
      legend: {
        orientation: "h",
        x: 1,
        y: 1.12,
        xanchor: "right",
        yanchor: "top",
        font: { color: "#c5d9f5" },
      },
    },
    { responsive: true, displaylogo: false },
  );

  bindSecondaryChartInteraction(chartPayload);
}

function renderPrimaryHeatmap(heatmapPayload) {
  if (!heatmapPayload || !heatmapPayload.z_values?.length) {
    return false;
  }

  const text = heatmapPayload.z_values.map((row) =>
    row.map((value) => (value == null ? "" : `${value.toFixed(0)}%`)),
  );

  Plotly.react(
    "trend-chart",
    [
      {
        type: "heatmap",
        x: heatmapPayload.x_labels,
        y: heatmapPayload.y_labels,
        z: heatmapPayload.z_values,
        text,
        texttemplate: "%{text}",
        textfont: { color: "#e5f1ff", size: 11 },
        colorscale: [
          [0, "#17304d"],
          [0.35, "#245587"],
          [0.65, "#3b84c5"],
          [1, "#8cd0ff"],
        ],
        zmin: 0,
        zmax: 100,
        hovertemplate: "<b>%{y}</b><br>%{x}: %{z:.1f}%<extra></extra>",
        colorbar: { title: "Retention %", tickfont: { color: "#c5d9f5" }, titlefont: { color: "#c5d9f5" } },
      },
    ],
    {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(22, 49, 84, 0.58)",
      margin: { l: 86, r: 26, t: 22, b: 52 },
      xaxis: { title: { text: "Months Since Acquisition", standoff: 12 }, color: "#c5d9f5", automargin: true },
      yaxis: { title: { text: "Cohort Month", standoff: 12 }, color: "#c5d9f5", automargin: true },
    },
    { responsive: true, displaylogo: false },
  );

  const chartEl = document.getElementById("trend-chart");
  if (chartEl && typeof chartEl.removeAllListeners === "function") {
    chartEl.removeAllListeners("plotly_click");
  }
  if (chartEl) {
    chartEl.style.cursor = "default";
  }
  return true;
}

function renderDetailTable(tablePayload) {
  if (!tablePayload || !tablePayload.rows?.length) {
    elements.detailPanel.classList.add("hidden");
    elements.detailTable.innerHTML = "";
    return;
  }

  elements.detailPanel.classList.remove("hidden");
  elements.detailTitle.textContent = tablePayload.title;
  renderTableMarkup(tablePayload, elements.detailTable, 8);
}

function syncPageLayout(payload) {
  if (elements.trendViewBlock) {
    elements.trendViewBlock.classList.toggle(
      "hidden",
      payload.page === "retention" || payload.page === "predictive",
    );
  }
  if (elements.scenarioViewBlock) {
    elements.scenarioViewBlock.classList.toggle("hidden", payload.page !== "predictive");
  }
  if (payload.page === "predictive" && payload.scenario_mode && elements.scenarioMode) {
    elements.scenarioMode.value = payload.scenario_mode;
    syncScenarioPills();
  }
}

function renderChart(payload, options = {}) {
  elements.trendTitle.textContent = payload.trend_title;
  elements.pageTitle.textContent = payload.title;
  elements.pageSubtitle.textContent = payload.subtitle;
  elements.backOverview.classList.toggle(
    "hidden",
    payload.view_mode !== "drilldown",
  );
  syncPageLayout(payload);

  const renderedHeatmap = renderPrimaryHeatmap(payload.primary_heatmap);
  if (renderedHeatmap) {
    elements.comparisonRule.textContent = payload.comparison_rule;
    state.currentTrendData = [];
    return;
  }

  let trendData = payload.trend;
  let clippedDailyWindow = false;
  if (payload.granularity === "Day" && payload.trend.length > 120) {
    trendData = payload.trend.slice(payload.trend.length - 120);
    clippedDailyWindow = true;
  }

  state.currentTrendData = trendData;
  const { isPercentMetric, valueFormat, valueSuffix, axisTickFormat } =
    metricPresentation(payload.trend_metric_format);

  if (payload.page === "predictive") {
    const scenarioOnly = Boolean(options.scenarioOnly);
    const historical = trendData.filter((point) => !point.is_projection);
    const forecast = trendData.filter((point) => point.is_projection);
    const baseline = historical.filter(
      (point) => point.baseline_value !== null && point.baseline_value !== undefined,
    );

    const traces = [];
    if (forecast.some((point) => point.lower_bound !== null && point.upper_bound !== null)) {
      const bandX = [
        ...forecast.map((point) => point.period_label),
        ...forecast.map((point) => point.period_label).reverse(),
      ];
      const bandY = [
        ...forecast.map((point) => point.upper_bound),
        ...forecast.map((point) => point.lower_bound).reverse(),
      ];
      traces.push({
        type: "scatter",
        mode: "lines",
        name: "Approx. 95% Range",
        x: bandX,
        y: bandY,
        fill: "toself",
        fillcolor: "rgba(123, 224, 163, 0.16)",
        line: { color: "rgba(123, 224, 163, 0.05)", width: 1 },
        hoverinfo: "skip",
      });
    }

    if (baseline.length) {
      traces.push({
        type: "scatter",
        mode: "lines",
        name: payload.previous_series_name || "Model Baseline",
        x: baseline.map((point) => point.period_label),
        y: baseline.map((point) => point.baseline_value),
        line: { color: "#f7b267", width: 2, dash: "dot" },
        hovertemplate:
          "<b>%{x}</b><br>Model Baseline: %{y:" + valueFormat + "}" + valueSuffix + "<extra></extra>",
      });
    }

    if (historical.length) {
      traces.push({
        type: "scatter",
        mode: "lines+markers",
        name: payload.current_series_name || "Actual",
        x: historical.map((point) => point.period_label),
        y: historical.map((point) => point.current_value),
        line: { color: "#67b8ff", width: 3 },
        marker: { size: 6 },
        customdata: historical.map((point) => [point.baseline_value]),
        hovertemplate:
          "<b>%{x}</b><br>Actual: %{y:" + valueFormat + "}" + valueSuffix +
          "<br>Model Baseline: %{customdata[0]:" + valueFormat + "}" + valueSuffix +
          "<extra></extra>",
      });
    }

    if (forecast.length) {
      traces.push({
        type: "scatter",
        mode: "lines+markers",
        name: forecastScenarioName(payload.scenario_mode),
        x: forecast.map((point) => point.period_label),
        y: forecast.map((point) => point.current_value),
        line: { color: "#7be0a3", width: 3, dash: "dash" },
        marker: { size: 7 },
        customdata: forecast.map((point) => [point.lower_bound, point.upper_bound, point.delta_pct]),
        hovertemplate:
          "<b>%{x}</b><br>" + forecastScenarioName(payload.scenario_mode) + ": %{y:" + valueFormat + "}" + valueSuffix +
          "<br>95% Low: %{customdata[0]:" + valueFormat + "}" + valueSuffix +
          "<br>95% High: %{customdata[1]:" + valueFormat + "}" + valueSuffix +
          "<br>Delta vs latest closed month: %{customdata[2]:+.2f}%<extra></extra>",
      });
    }

    const trendChartEl = document.getElementById("trend-chart");
    if (scenarioOnly && trendChartEl?.data?.length === traces.length) {
      Plotly.update(
        "trend-chart",
        {
          x: traces.map((trace) => trace.x || []),
          y: traces.map((trace) => trace.y || []),
          name: traces.map((trace) => trace.name || ""),
          customdata: traces.map((trace) => trace.customdata || []),
          line: traces.map((trace) => trace.line || null),
          marker: traces.map((trace) => trace.marker || null),
          fillcolor: traces.map((trace) => trace.fillcolor || null),
          hovertemplate: traces.map((trace) => trace.hovertemplate || null),
        },
        {},
        traces.map((_, index) => index),
      );
    } else {
      Plotly.react(
      "trend-chart",
      traces,
      {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(22, 49, 84, 0.58)",
        margin: { l: 86, r: 20, t: 30, b: 78 },
        xaxis: {
          title: { text: payload.trend_x_title, standoff: 12 },
          color: "#c5d9f5",
          tickangle: xTickAngle,
          automargin: true,
          tickfont: { size: 11 },
          nticks: xTickCount,
          gridcolor: "rgba(130, 175, 226, 0.2)",
        },
        yaxis: {
          title: { text: payload.trend_y_title, standoff: 12 },
          color: "#c5d9f5",
          automargin: true,
          tickfont: { size: 11 },
          gridcolor: "rgba(130, 175, 226, 0.2)",
          separatethousands: !isPercentMetric,
          tickformat: axisTickFormat,
          ticksuffix: valueSuffix,
        },
        legend: {
          orientation: "h",
          x: 1,
          y: 1.14,
          xanchor: "right",
          yanchor: "top",
          font: { color: "#c5d9f5" },
        },
      },
      {
        responsive: true,
        displaylogo: false,
      },
    );
    }

    elements.comparisonRule.textContent = payload.comparison_rule;
    bindChartDrilldown(payload);
    return;
  }

  const x = trendData.map((point) => point.period_label);
  const current = trendData.map((point) => point.current_value);
  const previous = trendData.map((point) => point.previous_value);
  const custom = trendData.map((point) => [
    point.previous_value,
    point.delta_pct,
    point.baseline_value,
    point.anomaly_score,
  ]);
  const isDailyTrend = payload.granularity === "Day";
  const xTickAngle = isDailyTrend ? -52 : -30;
  const xTickCount = isDailyTrend ? Math.min(14, Math.max(8, Math.ceil(trendData.length / 8))) : undefined;

  const currentTrace =
    payload.current_trace_style === "bar"
      ? {
          type: "bar",
          name: payload.current_series_name || "Current",
          x,
          y: current,
          marker: { color: "rgba(103,184,255,0.82)" },
          customdata: custom,
          hovertemplate:
            "<b>%{x}</b><br>" +
            `${payload.current_series_name || "Current"}: %{y:${valueFormat}}${valueSuffix}<br>` +
            `${payload.previous_series_name || "Previous"}: %{customdata[0]:${valueFormat}}${valueSuffix}<br>` +
            "Delta: %{customdata[1]:+.2f}%<extra></extra>",
        }
      : {
          type: "scatter",
          mode: "lines+markers",
          name: payload.current_series_name || "Current",
          x,
          y: current,
          line: { color: "#67b8ff", width: 3 },
          marker: { size: 6 },
          customdata: custom,
          hovertemplate:
            "<b>%{x}</b><br>" +
            `${payload.current_series_name || "Current"}: %{y:${valueFormat}}${valueSuffix}<br>` +
            `${payload.previous_series_name || "Previous"}: %{customdata[0]:${valueFormat}}${valueSuffix}<br>` +
            "Delta: %{customdata[1]:+.2f}%<extra></extra>",
        };

  const previousTrace =
    payload.previous_trace_style === "bar"
      ? {
          type: "bar",
          name: payload.previous_series_name || "Previous",
          x,
          y: previous,
          marker: { color: "rgba(247,178,103,0.72)" },
          hovertemplate:
            "<b>%{x}</b><br>" +
            `${payload.previous_series_name || "Previous"}: %{y:${valueFormat}}${valueSuffix}<extra></extra>`,
        }
      : {
          type: "scatter",
          mode: "lines+markers",
          name: payload.previous_series_name || "Previous",
          x,
          y: previous,
          line: { color: "#f7b267", width: 2, dash: "dot" },
          marker: { size: 5 },
          hovertemplate:
            "<b>%{x}</b><br>" +
            `${payload.previous_series_name || "Previous"}: %{y:${valueFormat}}${valueSuffix}<extra></extra>`,
        };

  const anomalyPoints = trendData
    .map((point, index) => ({ ...point, pointIndex: index }))
    .filter((point) => point.is_anomaly);
  const structuralShiftPoints = trendData
    .map((point, index) => ({ ...point, pointIndex: index }))
    .filter((point) => point.is_structural_shift);
  const anomalyTrace = anomalyPoints.length
    ? {
        type: "scatter",
        mode: "markers",
        name: "Anomaly",
        x: anomalyPoints.map((point) => point.period_label),
        y: anomalyPoints.map((point) => point.current_value),
        marker: {
          size: payload.current_trace_style === "bar" ? 11 : 12,
          color: "#ff8a5b",
          symbol: payload.current_trace_style === "bar" ? "diamond" : "diamond-open",
          line: { color: "#ffe0d2", width: 1.5 },
        },
        customdata: anomalyPoints.map((point) => [point.baseline_value, point.anomaly_score]),
        hovertemplate:
          "<b>%{x}</b><br>" +
          `Current: %{y:${valueFormat}}${valueSuffix}<br>` +
          `Trailing Baseline: %{customdata[0]:${valueFormat}}${valueSuffix}<br>` +
          "Robust Z-Score: %{customdata[1]:+.2f}<extra></extra>",
      }
    : null;

  const structuralShiftTrace = structuralShiftPoints.length
    ? {
        type: "scatter",
        mode: "markers",
        name: "Structural Shift",
        x: structuralShiftPoints.map((point) => point.period_label),
        y: structuralShiftPoints.map((point) => point.current_value),
        marker: {
          size: 13,
          color: structuralShiftPoints.map((point) =>
            point.shift_direction === "Downward shift" ? "#ff9ca8" : "#7be0a3",
          ),
          symbol: structuralShiftPoints.map((point) =>
            point.shift_direction === "Downward shift" ? "triangle-down" : "triangle-up",
          ),
          line: { color: "#dce9ff", width: 1.2 },
        },
        customdata: structuralShiftPoints.map((point) => [point.shift_direction, point.shift_score]),
        hovertemplate:
          "<b>%{x}</b><br>" +
          "%{customdata[0]}<br>" +
          `Current: %{y:${valueFormat}}${valueSuffix}<br>` +
          "Shift Score: %{customdata[1]:.2f}<extra></extra>",
      }
    : null;

  const layout = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(22, 49, 84, 0.58)",
    margin: { l: 86, r: 20, t: 30, b: 78 },
    xaxis: {
      title: { text: payload.trend_x_title, standoff: 12 },
      color: "#c5d9f5",
      tickangle: xTickAngle,
      automargin: true,
      tickfont: { size: 11 },
      nticks: xTickCount,
      gridcolor: "rgba(130, 175, 226, 0.2)",
    },
    yaxis: {
      title: { text: payload.trend_y_title, standoff: 12 },
      color: "#c5d9f5",
      automargin: true,
      tickfont: { size: 11 },
      gridcolor: "rgba(130, 175, 226, 0.2)",
      separatethousands: !isPercentMetric,
      tickformat: axisTickFormat,
      ticksuffix: valueSuffix,
    },
    legend: {
      orientation: "h",
      x: 1,
      y: 1.14,
      xanchor: "right",
      yanchor: "top",
      font: { color: "#c5d9f5" },
    },
  };

  const traces = [currentTrace, previousTrace];
  if (structuralShiftTrace) {
    traces.push(structuralShiftTrace);
  }
  if (anomalyTrace) {
    traces.push(anomalyTrace);
  }

  Plotly.react("trend-chart", traces, layout, {
    responsive: true,
    displaylogo: false,
  });

  elements.comparisonRule.textContent = clippedDailyWindow
    ? `${payload.comparison_rule} Daily chart capped to latest 120 points for readability.`
    : payload.comparison_rule;
  bindChartDrilldown(payload);
}

function bindChartDrilldown(payload) {
  const chartEl = document.getElementById("trend-chart");
  if (!chartEl || typeof chartEl.on !== "function") {
    return;
  }
  if (typeof chartEl.removeAllListeners === "function") {
    chartEl.removeAllListeners("plotly_click");
  }

  if (
    payload.page !== "sales" ||
    payload.view_mode === "drilldown" ||
    payload.granularity === "Day"
  ) {
    chartEl.style.cursor = "default";
    return;
  }

  chartEl.style.cursor = "pointer";
  chartEl.on("plotly_click", (eventData) => {
    const point = eventData?.points?.[0];
    if (!point) {
      return;
    }
    const idx = point.pointIndex;
    const selected = state.currentTrendData[idx];
    if (!selected || !selected.period_key) {
      return;
    }
    state.drilldownPeriodKey = selected.period_key;
    loadDashboard();
  });
}

async function loadDashboard() {
  const requestToken = ++state.dashboardRequestToken;
  const previousPayload = state.currentPayload;
  try {
    const query = buildDashboardQuery();
    let payload = readDashboardCache(query);
    if (!payload) {
      if (state.dashboardAbortController) {
        state.dashboardAbortController.abort();
      }
      state.dashboardAbortController = new AbortController();
      scheduleLoadingState();
      payload = await fetchJson(`/api/dashboard?${query}`, { signal: state.dashboardAbortController.signal });
      writeDashboardCache(query, payload);
    }
    if (requestToken !== state.dashboardRequestToken) {
      return;
    }
    state.currentPayload = payload;
    const scenarioOnly = isPredictiveScenarioOnlyUpdate(previousPayload, payload);
    renderCards(payload.cards);
    renderSemanticMeta(payload);
    renderStory(payload);
    renderChart(payload, { scenarioOnly });
    renderSecondaryChart(payload.secondary_chart, { scenarioOnly });
    renderDetailTable(payload.detail_table);
    prefetchDashboardPages();
    if (state.drawerOpen && !state.governanceLoaded) {
      loadGovernanceData().catch((governanceError) => showAgentStatus(governanceError.message, "error"));
    }
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }
    renderStory({ summary: [error.message] });
    elements.cardsGrid.innerHTML = "";
    renderSecondaryChart(null);
    renderDetailTable(null);
    Plotly.purge("trend-chart");
  } finally {
    if (requestToken === state.dashboardRequestToken) {
      clearLoadingState();
      state.dashboardAbortController = null;
    }
  }
}

function scheduleFilterReload() {
  if (state.filterReloadTimer) {
    window.clearTimeout(state.filterReloadTimer);
  }

  state.filterReloadTimer = window.setTimeout(() => {
    state.filterReloadTimer = null;
    clearDashboardCache();
    if (
      state.activePage === "sales" &&
      state.currentPayload?.view_mode === "drilldown"
    ) {
      state.drilldownPeriodKey = null;
    }
    clearFocusDetail();
    loadDashboard();
  }, 240);
}

function bindEvents() {
  if (elements.surfaceSkin) {
    elements.surfaceSkin.addEventListener("change", () => applySurfaceSkin(elements.surfaceSkin.value));
  }
  [
    elements.startDate,
    elements.endDate,
    elements.categories,
    elements.cities,
    elements.granularity,
    elements.scenarioMode,
  ].forEach((element) => {
    element.addEventListener("change", () => {
      if (element === elements.categories || element === elements.cities) {
        syncCustomFilters();
      }
      scheduleFilterReload();
    });
  });

  if (elements.granularityPills) {
    elements.granularityPills
      .querySelectorAll(".granularity-pill")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const nextValue = button.dataset.granularity;
          if (!nextValue || nextValue === elements.granularity.value) {
            return;
          }
          elements.granularity.value = nextValue;
          syncGranularityPills();
          scheduleFilterReload();
        });
      });
  }

  if (elements.scenarioPills) {
    elements.scenarioPills
      .querySelectorAll(".granularity-pill")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const nextValue = button.dataset.scenario;
          if (!nextValue || nextValue === elements.scenarioMode.value) {
            return;
          }
          elements.scenarioMode.value = nextValue;
          syncScenarioPills();
          if (state.activePage === "predictive") {
            scheduleFilterReload();
          }
        });
      });
  }

  elements.backOverview.addEventListener("click", () => {
    state.drilldownPeriodKey = null;
    clearFocusDetail();
    loadDashboard();
  });

  if (elements.focusClear) {
    elements.focusClear.addEventListener("click", () => {
      clearFocusDetail();
    });
  }

  elements.assistantToggle.addEventListener("click", async () => {
    openAssistantDrawer();
    await ensureAssistantSuggestions();
  });

  elements.assistantClose.addEventListener("click", () => {
    closeAssistantDrawer();
  });

  elements.assistantOverlay.addEventListener("click", () => {
    closeAssistantDrawer();
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    const clickedInside = Object.values(state.filterControls).some((control) =>
      control.container.contains(target),
    );
    if (!clickedInside) {
      closeAllMultiSelects();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllMultiSelects();
    }
    if (event.key === "Escape" && state.drawerOpen) {
      closeAssistantDrawer();
    }
  });

  elements.runAssistant.addEventListener("click", async () => {
    await requestAssistantSuggestions(elements.assistantRequest.value);
  });

  elements.clearAssistant.addEventListener("click", async () => {
    elements.assistantRequest.value = "";
    await requestAssistantSuggestions("");
  });

  elements.assistantRequest.addEventListener("keydown", async (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      await requestAssistantSuggestions(elements.assistantRequest.value);
    }
  });

  elements.previewProposalBtn.addEventListener("click", async () => {
    await previewProposalForm();
  });

  elements.clearDrafts.addEventListener("click", async () => {
    await clearDrafts();
  });

  elements.proposalForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    let afterPayload = {};
    try {
      if (elements.proposalAfter.value.trim()) {
        afterPayload = JSON.parse(elements.proposalAfter.value);
      }
    } catch (error) {
      showAgentStatus(`Invalid proposal JSON: ${error.message}`, "error");
      return;
    }

    try {
      await sendJson("/api/agent/proposals", "POST", {
        page: state.activePage,
        target: elements.proposalTarget.value,
        title: elements.proposalTitle.value,
        rationale: elements.proposalRationale.value,
        before: {
          cards: state.currentPayload?.cards?.map((card) => card.key) || [],
          primary_metric_key: state.currentPayload?.primary_metric_key || null,
        },
        after: afterPayload,
      });
      elements.proposalForm.reset();
      elements.proposalTarget.value = "dashboard";
      await loadGovernanceData();
      showAgentStatus(
        "Proposal added to the review queue from the advanced editor.",
        "success",
      );
    } catch (error) {
      showAgentStatus(error.message, "error");
    }
  });
}

async function boot() {
  buildSidebar();
  await Promise.all([loadHealth(), loadFilterMetadata(), loadSemanticLayer()]);
  syncGranularityPills();
  renderQuickActions();
  renderSuggestions();
  renderProposalPreview();
  bindEvents();
  await loadDashboard();
}

boot();


