const DESKTOP_PAGES = [
  {
    key: "executive",
    label: "Executive Scorecard",
    desktopLabel: "Executive Scorecard",
    windowLabel: "Executive Scorecard",
    iconClass: "icon-art--executive",
    rect: { x: 58, y: 36, w: 1040, h: 720 },
  },
  {
    key: "sales",
    label: "Sales Overview",
    desktopLabel: "Sales Overview",
    windowLabel: "Sales Overview",
    iconClass: "icon-art--sales",
    rect: { x: 78, y: 26, w: 980, h: 720 },
  },
  {
    key: "revenue",
    label: "Revenue Trends",
    desktopLabel: "Revenue Trends",
    windowLabel: "Revenue Trends",
    iconClass: "icon-art--revenue",
    rect: { x: 142, y: 64, w: 920, h: 680 },
  },
  {
    key: "marketing",
    label: "Marketing Efficiency",
    desktopLabel: "Marketing Efficiency",
    windowLabel: "Marketing Efficiency",
    iconClass: "icon-art--marketing",
    rect: { x: 180, y: 82, w: 960, h: 700 },
  },
  {
    key: "predictive",
    label: "Predictive Outlook",
    desktopLabel: "Predictive Outlook",
    windowLabel: "Predictive Outlook",
    iconClass: "icon-art--predictive",
    rect: { x: 204, y: 102, w: 940, h: 700 },
  },
  {
    key: "customers",
    label: "Customer Segmentation",
    desktopLabel: "Customer Segments",
    windowLabel: "Customer Segmentation",
    iconClass: "icon-art--customers",
    rect: { x: 116, y: 86, w: 960, h: 700 },
  },
  {
    key: "retention",
    label: "Retention Cohorts",
    desktopLabel: "Retention Cohorts",
    windowLabel: "Retention Cohorts",
    iconClass: "icon-art--retention",
    rect: { x: 188, y: 52, w: 940, h: 700 },
  },
  {
    key: "products",
    label: "Product Performance",
    desktopLabel: "Product Performance",
    windowLabel: "Product Performance",
    iconClass: "icon-art--products",
    rect: { x: 164, y: 88, w: 940, h: 700 },
  },
  {
    key: "operations",
    label: "Order Flow Ops",
    desktopLabel: "Order Flow Ops",
    windowLabel: "Order Flow Ops",
    iconClass: "icon-art--operations",
    rect: { x: 230, y: 120, w: 920, h: 680 },
  },
  {
    key: "data_center",
    label: "Data Center",
    desktopLabel: "Data Center",
    windowLabel: "Data Center",
    iconClass: "icon-art--data-center",
    rect: { x: 96, y: 54, w: 1020, h: 700 },
  },
  {
    key: "source_health",
    label: "Source Health",
    desktopLabel: "Source Health",
    windowLabel: "Source Health",
    iconClass: "icon-art--source-health",
    rect: { x: 264, y: 84, w: 960, h: 680 },
  },
  {
    key: "account_health",
    label: "Account Health",
    desktopLabel: "Account Health",
    windowLabel: "Account Health",
    iconClass: "icon-art--account-health",
    rect: { x: 296, y: 112, w: 980, h: 700 },
  },
];

const WINDOW_THEMES = {
  glass: {
    current: "#7fc2ff",
    previous: "#f7b267",
    accent: "#f7b267",
    positive: "#81d4a5",
    danger: "#ff9a9a",
    text: "#dbe8fb",
    muted: "#9fb5d2",
    grid: "rgba(130, 178, 228, 0.22)",
    plotBg: "rgba(22, 49, 84, 0.58)",
  },
  graphite: {
    current: "#9dc0ff",
    previous: "#ffc46f",
    accent: "#ffc46f",
    positive: "#8ed3b0",
    danger: "#ffadad",
    text: "#e4ebf6",
    muted: "#aab7ca",
    grid: "rgba(170, 183, 202, 0.20)",
    plotBg: "rgba(35, 43, 57, 0.62)",
  },
  light: {
    current: "#4d8fdc",
    previous: "#f2a94a",
    accent: "#f2a94a",
    positive: "#2f9a68",
    danger: "#d56a5c",
    text: "#243247",
    muted: "#667a96",
    grid: "rgba(90, 122, 166, 0.18)",
    plotBg: "rgba(236, 242, 249, 0.88)",
  },
  desktop: {
    current: "#2c74ed",
    previous: "#ef9f38",
    accent: "#ef9f38",
    positive: "#6a9b45",
    danger: "#c76660",
    text: "#243247",
    muted: "#6a7588",
    grid: "rgba(112, 99, 78, 0.16)",
    plotBg: "rgba(239, 233, 220, 0.9)",
  },
};

const CONNECTOR_OPTIONS = [
  {
    key: "file_csv",
    title: "CSV File",
    type: "File",
    description: "Choose a local CSV and preview rows before loading it.",
    action: "file",
    accept: ".csv,text/csv",
  },
  {
    key: "file_json",
    title: "JSON File",
    type: "File",
    description: "Choose a local JSON file or records array for preview.",
    action: "file",
    accept: ".json,application/json",
  },
  {
    key: "postgres",
    title: "PostgreSQL Table",
    type: "Database",
    description: "Save a table connection draft without exposing credentials.",
    action: "draft",
  },
  {
    key: "rest_api",
    title: "REST API",
    type: "Application",
    description: "Define endpoint, grain, and primary key as a governed draft.",
    action: "draft",
  },
  {
    key: "crm_accounts_api",
    title: "CRM Accounts",
    type: "Preset",
    description: "Connect the registered CRM account source.",
    action: "registered",
    sourceName: "crm_accounts_api",
  },
  {
    key: "billing_invoices_api",
    title: "Billing Invoices",
    type: "Preset",
    description: "Connect the registered billing source.",
    action: "registered",
    sourceName: "billing_invoices_api",
  },
];

const state = {
  meta: null,
  filters: {
    startDate: "",
    endDate: "",
    categories: [],
    cities: [],
    granularity: "Month",
    scenarioMode: "Base",
  },
  windowTheme: "glass",
  preferencesKey: "nextgen-desktop-lab-preferences",
  sessionKey: "nextgen-desktop-session-active",
  onboardingKey: "nextgen-desktop-onboarding",
  bookmarksKey: "nextgen-desktop-bookmarks",
  actionsKey: "nextgen-desktop-actions",
  annotationsKey: "nextgen-desktop-annotations",
  recentKey: "nextgen-desktop-recent",
  sourceConnectionsKey: "nextgen-desktop-source-connections",
  sourceDraftsKey: "nextgen-desktop-source-drafts",
  importedDatasetsKey: "nextgen-desktop-imported-datasets",
  cache: new Map(),
  spotlights: new Map(),
  spotlightCache: new Map(),
  requests: new Map(),
  datePickers: { start: null, end: null },
  topZ: 20,
  dragState: null,
  resizeState: null,
  spotlightCounter: 0,
  compareCounter: 0,
  bookmarks: [],
  actionItems: [],
  annotations: [],
  recentEntries: [],
  sourceConnections: {},
  sourceDrafts: [],
  importedDatasets: [],
  activeConnectorSetup: "",
  localFilePreview: null,
  onboarding: {
    dismissed: false,
    tasks: {
      dataCenterOpen: false,
      salesOpen: false,
      predictiveOpen: false,
      spotlightUsed: false,
    },
  },
};

const elements = {
  icons: document.getElementById("desktop-icons"),
  windowsLayer: document.getElementById("windowsLayer"),
  tasks: document.getElementById("desktop-tasks"),
  status: document.getElementById("lab-status"),
  taskbarMessage: document.getElementById("taskbar-message"),
  clock: document.getElementById("taskbar-clock"),
  desktopToggle: document.getElementById("desktop-toggle"),
  startDate: document.getElementById("lab-start-date"),
  endDate: document.getElementById("lab-end-date"),
  category: document.getElementById("lab-category"),
  city: document.getElementById("lab-city"),
  granularityPills: document.getElementById("lab-granularity-pills"),
  scenario: document.getElementById("lab-scenario"),
  windowTheme: document.getElementById("lab-window-theme"),
  openGuide: document.getElementById("open-guide-btn"),
  workspaceMenuToggle: document.getElementById("workspace-menu-toggle"),
  workspaceMenu: document.getElementById("workspace-menu"),
  saveBookmark: document.getElementById("save-bookmark-btn"),
  openRecent: document.getElementById("open-recent-btn"),
  openBookmarks: document.getElementById("open-bookmarks-btn"),
  openActions: document.getElementById("open-actions-btn"),
  lockWorkspace: document.getElementById("lock-workspace-btn"),
  onboarding: document.getElementById("desktop-onboarding"),
  desktop: document.querySelector(".desktop"),
  loginScreen: document.getElementById("login-screen"),
  loginSubmit: document.getElementById("login-submit"),
  loginSkip: document.getElementById("login-demo-skip"),
  loginWorkspaceInput: document.getElementById("login-workspace-input"),
};

const resizeDirections = ["n", "e", "s", "w", "nw", "ne", "sw", "se"];

function setWorkspaceMenu(open) {
  if (!elements.workspaceMenu) return;
  elements.workspaceMenu.classList.toggle("hidden", !open);
  elements.workspaceMenuToggle?.setAttribute(
    "aria-expanded",
    open ? "true" : "false",
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
function truncateMiddle(value, maxLength = 40) {
  const text = String(value ?? "");
  if (text.length <= maxLength) return text;
  const side = Math.max(8, Math.floor((maxLength - 3) / 2));
  return `${text.slice(0, side)}...${text.slice(text.length - side)}`;
}
function formatPercent(value) {
  const number = Number(value || 0);
  return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;
}
function formatCardDelta(value) {
  const css = Number(value || 0) >= 0 ? "up" : "down";
  return `<span class="lab-chip ${css}">${escapeHtml(formatPercent(value))}</span>`;
}
function selectedFilterLabel(values, emptyLabel, prefix) {
  if (!Array.isArray(values) || !values.length) return emptyLabel;
  return `${prefix}: ${values[0]}`;
}
function currentFiltersSummary(filters = state.filters) {
  return [
    `${filters.startDate} -> ${filters.endDate}`,
    filters.granularity,
    selectedFilterLabel(filters.categories, "All categories", "Category"),
    selectedFilterLabel(filters.cities, "All cities", "City"),
  ].join(" | ");
}
function themeConfig() {
  return WINDOW_THEMES[state.windowTheme] || WINDOW_THEMES.glass;
}
function pageByKey(pageKey) {
  return DESKTOP_PAGES.find((page) => page.key === pageKey);
}
function filtersSnapshot(source = state.filters) {
  return {
    startDate: source.startDate,
    endDate: source.endDate,
    categories: Array.isArray(source.categories)
      ? source.categories.filter(Boolean)
      : [],
    cities: Array.isArray(source.cities) ? source.cities.filter(Boolean) : [],
    granularity: source.granularity,
    scenarioMode: source.scenarioMode || "Base",
  };
}
function cacheKey(pageKey) {
  if (pageKey === "data_center") return "data_center";
  if (pageKey === "source_health") return "source_health";
  if (pageKey === "account_health") return "account_health";
  return [
    pageKey,
    state.filters.startDate,
    state.filters.endDate,
    (state.filters.categories || []).join(","),
    (state.filters.cities || []).join(","),
    state.filters.granularity,
    state.filters.scenarioMode,
  ].join("::");
}
function spotlightFilters(config) {
  return config.syncMode === "sync"
    ? filtersSnapshot()
    : filtersSnapshot(config.filters);
}
function spotlightCacheKey(config) {
  const filters = spotlightFilters(config);
  return [
    config.id,
    filters.startDate,
    filters.endDate,
    (filters.categories || []).join(","),
    (filters.cities || []).join(","),
    filters.granularity,
    filters.scenarioMode,
    config.kind,
    config.focusType || "",
    config.interactionKey || "",
    config.interactionValue || "",
    config.drilldownPeriodKey || "",
  ].join("::");
}
function buildDashboardUrlForFilters(pageKey, filters, extra = {}) {
  const params = new URLSearchParams({
    page: pageKey,
    start_date: filters.startDate,
    end_date: filters.endDate,
    granularity: filters.granularity,
  });
  (filters.categories || []).forEach((category) =>
    params.append("categories", category),
  );
  (filters.cities || []).forEach((city) => params.append("cities", city));
  if (pageKey === "predictive")
    params.set("scenario_mode", filters.scenarioMode || "Base");
  Object.entries(extra).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      v.filter(
        (item) => item !== undefined && item !== null && item !== "",
      ).forEach((item) => params.append(k, item));
      return;
    }
    if (v !== undefined && v !== null && v !== "") params.set(k, v);
  });
  return `/api/dashboard?${params.toString()}`;
}
function buildDashboardUrl(pageKey) {
  return buildDashboardUrlForFilters(pageKey, state.filters);
}
function buildDetailUrlForFilters(
  pageKey,
  filters,
  interactionKey,
  interactionValue,
) {
  const params = new URLSearchParams({
    page: pageKey,
    start_date: filters.startDate,
    end_date: filters.endDate,
    granularity: filters.granularity,
    drilldown_key: interactionKey,
    drilldown_value: interactionValue,
  });
  (filters.categories || []).forEach((category) =>
    params.append("categories", category),
  );
  (filters.cities || []).forEach((city) => params.append("cities", city));
  if (pageKey === "predictive")
    params.set("scenario_mode", filters.scenarioMode || "Base");
  return `/api/dashboard/detail?${params.toString()}`;
}
function buildDetailUrl(pageKey, interactionKey, interactionValue) {
  return buildDetailUrlForFilters(
    pageKey,
    state.filters,
    interactionKey,
    interactionValue,
  );
}
function createTaskButtonHtml(taskId, label, iconClass) {
  return `<button class="task-button" type="button" data-task="${escapeHtml(taskId)}"><span class="task-mark ${escapeHtml(iconClass)}" aria-hidden="true"></span><span>${escapeHtml(label)}</span></button>`;
}
function getLayerRect() {
  return elements.windowsLayer.getBoundingClientRect();
}
function getMaximizedRect() {
  const layerRect = getLayerRect();
  return {
    left: 0,
    top: 0,
    width: layerRect.width,
    height: layerRect.height,
    fullBleed: true,
  };
}
function getWindowMinSize(win) {
  return {
    width: Number(win.dataset.minW || 520),
    height: Number(win.dataset.minH || 360),
  };
}
function applyRect(win, rect) {
  const bounds = getLayerRect();
  const minSize = getWindowMinSize(win);
  const fullBleed = Boolean(rect.fullBleed);
  const width = clamp(
    rect.width,
    minSize.width,
    fullBleed ? bounds.width : bounds.width - 8,
  );
  const height = clamp(
    rect.height,
    minSize.height,
    fullBleed ? bounds.height : bounds.height - 8,
  );
  const left = fullBleed ? 0 : clamp(rect.left, 0, bounds.width - width);
  const top = fullBleed ? 0 : clamp(rect.top, 0, bounds.height - height);
  win.style.width = `${width}px`;
  win.style.height = `${height}px`;
  win.style.left = `${left}px`;
  win.style.top = `${top}px`;
  updateWindowDensityClass(win);
}
function initialRect(win, offsetIndex) {
  const bounds = getLayerRect();
  const minSize = getWindowMinSize(win);
  const cascade = offsetIndex * 18;
  const width = clamp(
    Number(win.dataset.w || 900),
    minSize.width,
    bounds.width - 8,
  );
  const height = clamp(
    Number(win.dataset.h || 640),
    minSize.height,
    bounds.height - 8,
  );
  const left = clamp(
    Number(win.dataset.x || 40) + cascade,
    0,
    bounds.width - width,
  );
  const top = clamp(
    Number(win.dataset.y || 30) + cascade,
    0,
    bounds.height - height,
  );
  return { left, top, width, height };
}
function updateWindowDensityClass(win) {
  if (!win) return;
  const width = win.clientWidth || parseFloat(win.style.width) || 0;
  win.classList.toggle("is-compact", width > 0 && width < 760);
  win.classList.toggle("is-tight", width > 0 && width < 560);
}
function resizeWindowPlots(win) {
  updateWindowDensityClass(win);
  if (typeof Plotly === "undefined") return;
  win.querySelectorAll(".lab-plot").forEach((plotEl) => {
    if (plotEl.data) Plotly.Plots.resize(plotEl);
  });
}
function plotDensity(plotEl) {
  const width = Math.max(plotEl?.clientWidth || 0, plotEl?.offsetWidth || 0);
  return {
    width,
    compact: width > 0 && width < 430,
    tight: width > 0 && width < 350,
  };
}
function getOpenWindows() {
  return Array.from(
    document.querySelectorAll(".window.is-open[data-window-id]"),
  );
}
function getVisibleWindows() {
  return getOpenWindows().filter(
    (win) => !win.classList.contains("is-minimized"),
  );
}
function getMinimizedWindows() {
  return getOpenWindows().filter((win) =>
    win.classList.contains("is-minimized"),
  );
}
function markIcons(activeId) {
  elements.icons
    .querySelectorAll("[data-window]")
    .forEach((button) =>
      button.classList.toggle(
        "is-selected",
        button.dataset.window === activeId,
      ),
    );
}
function updateDesktopToggle() {
  if (!elements.desktopToggle) return;
  const visibleCount = getVisibleWindows().length;
  const minimizedCount = getMinimizedWindows().length;
  const labelEl = elements.desktopToggle.querySelector(".start-button-label");
  let label = "Desktop";
  let title = "Click a desktop icon to open a page.";
  elements.desktopToggle.dataset.mode = "idle";
  if (visibleCount > 0) {
    label = "Show desktop";
    title = "Minimize all open windows and reveal the desktop.";
    elements.desktopToggle.dataset.mode = "show";
  } else if (minimizedCount > 0) {
    label = "Restore";
    title = "Restore minimized windows to continue analysis.";
    elements.desktopToggle.dataset.mode = "restore";
  }
  if (labelEl) labelEl.textContent = label;
  elements.desktopToggle.setAttribute("aria-label", title);
  elements.desktopToggle.title = title;
}
function syncTasks(activeId = null) {
  elements.tasks.querySelectorAll("[data-task]").forEach((button) => {
    const win = document.querySelector(
      `.window[data-window-id="${button.dataset.task}"]`,
    );
    const visible = win && win.classList.contains("is-open");
    const active =
      visible &&
      !win.classList.contains("is-minimized") &&
      button.dataset.task === activeId;
    button.classList.toggle("is-visible", Boolean(visible));
    button.classList.toggle("is-active", Boolean(active));
  });
  updateDesktopToggle();
}
function focusWindow(win) {
  if (!win || !win.classList.contains("is-open")) return;
  state.topZ += 1;
  win.style.zIndex = String(state.topZ);
  document
    .querySelectorAll(".window[data-window-id]")
    .forEach((item) => item.classList.toggle("is-active", item === win));
  markIcons(win.dataset.pageKey || win.dataset.windowId);
  syncTasks(win.dataset.windowId);
  window.setTimeout(() => resizeWindowPlots(win), 30);
}
function openWindow(id) {
  const win = document.querySelector(`.window[data-window-id="${id}"]`);
  if (!win) return;
  if (!win.dataset.placed) {
    const openCount = document.querySelectorAll(".window.is-open").length;
    applyRect(win, initialRect(win, openCount));
    win.dataset.placed = "true";
  }
  win.classList.add("is-open");
  win.classList.remove("is-minimized");
  if (win.classList.contains("is-maximized"))
    applyRect(win, getMaximizedRect());
  focusWindow(win);
  if (win.dataset.windowKind === "spotlight") {
    loadSpotlightWindow(id);
    return;
  }
  if (win.dataset.windowKind === "compare") {
    renderCompareWindow(id);
    return;
  }
  if (win.dataset.windowKind === "bookmarks") {
    renderBookmarksWindow(id);
    return;
  }
  if (win.dataset.windowKind === "actions") {
    renderActionBoardWindow(id);
    return;
  }
  if (win.dataset.windowKind === "recent") {
    renderRecentWindow(id);
    return;
  }
  if (win.dataset.windowKind === "imported_dataset") {
    renderImportedDatasetWindow(id);
    return;
  }
  if (win.dataset.windowKind === "page") {
    if (win.dataset.pageKey === "data_center")
      markOnboardingStep("dataCenterOpen");
    if (win.dataset.pageKey === "sales") markOnboardingStep("salesOpen");
    if (win.dataset.pageKey === "predictive")
      markOnboardingStep("predictiveOpen");
    trackRecent({
      kind: "page",
      pageKey: win.dataset.pageKey,
      title: pageByKey(win.dataset.pageKey)?.windowLabel || win.dataset.pageKey,
      context: currentFiltersSummary(),
      drilldownPeriodKey: win.dataset.drilldownPeriodKey || "",
    });
  }
  loadPageWindow(id);
}
function closeWindow(win) {
  win.classList.remove("is-open", "is-minimized", "is-active", "is-maximized");
  if (win.dataset.windowKind === "spotlight") {
    state.spotlights.delete(win.dataset.windowId);
    Array.from(state.spotlightCache.keys()).forEach((key) => {
      if (key.startsWith(`${win.dataset.windowId}::`))
        state.spotlightCache.delete(key);
    });
  }
  if (win.dataset.windowKind !== "page") {
    elements.tasks
      .querySelector(`[data-task="${win.dataset.windowId}"]`)
      ?.remove();
    win.remove();
  }
  syncTasks();
  const nextWin = Array.from(
    document.querySelectorAll(".window.is-open:not(.is-minimized)"),
  ).sort(
    (a, b) => Number(b.style.zIndex || 0) - Number(a.style.zIndex || 0),
  )[0];
  if (nextWin) focusWindow(nextWin);
  else markIcons(null);
}
function minimizeWindow(win) {
  win.classList.add("is-minimized");
  win.classList.remove("is-active");
  syncTasks();
  const nextWin = Array.from(
    document.querySelectorAll(".window.is-open:not(.is-minimized)"),
  )
    .filter((item) => item !== win)
    .sort(
      (a, b) => Number(b.style.zIndex || 0) - Number(a.style.zIndex || 0),
    )[0];
  if (nextWin) focusWindow(nextWin);
  else markIcons(null);
}
function toggleMaximize(win) {
  if (win.classList.contains("is-maximized")) {
    const previous = JSON.parse(win.dataset.prevRect || "{}");
    if (previous.left !== undefined) applyRect(win, previous);
    win.classList.remove("is-maximized");
    resizeWindowPlots(win);
    return;
  }
  const rect = win.getBoundingClientRect();
  const layerRect = getLayerRect();
  win.dataset.prevRect = JSON.stringify({
    left: rect.left - layerRect.left,
    top: rect.top - layerRect.top,
    width: rect.width,
    height: rect.height,
  });
  applyRect(win, getMaximizedRect());
  win.classList.add("is-maximized");
  focusWindow(win);
}
function clearInteractionState() {
  const resizedWin = state.resizeState?.win || null;
  state.dragState = null;
  state.resizeState = null;
  if (resizedWin) resizeWindowPlots(resizedWin);
}
function startDrag(event, win) {
  if (event.button !== undefined && event.button !== 0) return;
  if (win.classList.contains("is-maximized")) return;
  if (event.target.closest("button, input, select, a")) return;
  focusWindow(win);
  const rect = win.getBoundingClientRect();
  const bounds = getLayerRect();
  state.dragState = {
    win,
    startX: event.clientX,
    startY: event.clientY,
    left: rect.left - bounds.left,
    top: rect.top - bounds.top,
  };
  event.preventDefault();
}
function startResize(event, win, direction) {
  if (event.button !== undefined && event.button !== 0) return;
  if (win.classList.contains("is-maximized")) return;
  focusWindow(win);
  const rect = win.getBoundingClientRect();
  const bounds = getLayerRect();
  const minSize = getWindowMinSize(win);
  state.resizeState = {
    win,
    direction,
    startX: event.clientX,
    startY: event.clientY,
    left: rect.left - bounds.left,
    top: rect.top - bounds.top,
    width: rect.width,
    height: rect.height,
    minWidth: minSize.width,
    minHeight: minSize.height,
  };
  event.preventDefault();
  event.stopPropagation();
}
function bindPointerInteractions() {
  document.addEventListener("pointermove", (event) => {
    if (state.resizeState) {
      const bounds = getLayerRect();
      const {
        win,
        direction,
        startX,
        startY,
        left: startLeft,
        top: startTop,
        width: startWidth,
        height: startHeight,
        minWidth,
        minHeight,
      } = state.resizeState;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      let left = startLeft;
      let top = startTop;
      let width = startWidth;
      let height = startHeight;
      if (direction.includes("e"))
        width = clamp(startWidth + deltaX, minWidth, bounds.width - startLeft);
      if (direction.includes("s"))
        height = clamp(
          startHeight + deltaY,
          minHeight,
          bounds.height - startTop,
        );
      if (direction.includes("w")) {
        const right = startLeft + startWidth;
        left = clamp(startLeft + deltaX, 0, right - minWidth);
        width = right - left;
      }
      if (direction.includes("n")) {
        const bottom = startTop + startHeight;
        top = clamp(startTop + deltaY, 0, bottom - minHeight);
        height = bottom - top;
      }
      win.style.left = `${left}px`;
      win.style.top = `${top}px`;
      win.style.width = `${width}px`;
      win.style.height = `${height}px`;
      return;
    }
    if (!state.dragState) return;
    const bounds = getLayerRect();
    const win = state.dragState.win;
    const width = win.offsetWidth;
    const height = win.offsetHeight;
    const left = clamp(
      state.dragState.left + (event.clientX - state.dragState.startX),
      0,
      bounds.width - width,
    );
    const top = clamp(
      state.dragState.top + (event.clientY - state.dragState.startY),
      0,
      bounds.height - height,
    );
    win.style.left = `${left}px`;
    win.style.top = `${top}px`;
  });
  document.addEventListener("pointerup", clearInteractionState);
  document.addEventListener("pointercancel", clearInteractionState);
  window.addEventListener("resize", () => {
    document.querySelectorAll(".window.is-open").forEach((win) => {
      if (win.classList.contains("is-maximized"))
        applyRect(win, getMaximizedRect());
      else
        applyRect(win, {
          left: parseFloat(win.style.left || "0"),
          top: parseFloat(win.style.top || "0"),
          width: parseFloat(win.style.width || win.dataset.w || "900"),
          height: parseFloat(win.style.height || win.dataset.h || "640"),
        });
      resizeWindowPlots(win);
    });
  });
}
function displayDate(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = String(isoDate).split("-");
  return `${day} / ${month} / ${year}`;
}
function parseQueryFilterValues(params, singularKey, pluralKey) {
  const repeated = params
    .getAll(pluralKey)
    .flatMap((value) => String(value || "").split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  if (repeated.length) return repeated.slice(0, 1);
  const singular = params.get(singularKey);
  return singular
    ? singular
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .slice(0, 1)
    : [];
}
function hydrateFilterSelect(selectEl, values, allLabel) {
  if (!selectEl) return;
  const selected = selectEl.value;
  selectEl.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = allLabel;
  selectEl.appendChild(allOption);
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectEl.appendChild(option);
  });
  if ([...selectEl.options].some((option) => option.value === selected)) {
    selectEl.value = selected;
  }
}
function normalizeTopbarSelections() {
  const availableCategories = new Set(state.meta?.categories || []);
  const availableCities = new Set(state.meta?.cities || []);
  state.filters.categories = (state.filters.categories || [])
    .filter(Boolean)
    .filter(
      (value) =>
        availableCategories.size === 0 || availableCategories.has(value),
    )
    .slice(0, 1);
  state.filters.cities = (state.filters.cities || [])
    .filter(Boolean)
    .filter((value) => availableCities.size === 0 || availableCities.has(value))
    .slice(0, 1);
}
function syncGlobalFilterSelects() {
  if (elements.category) {
    elements.category.value = state.filters.categories?.[0] || "";
    elements.category
      .closest(".control-chip")
      ?.classList.toggle(
        "is-filtered",
        Boolean(state.filters.categories?.length),
      );
  }
  if (elements.city) {
    elements.city.value = state.filters.cities?.[0] || "";
    elements.city
      .closest(".control-chip")
      ?.classList.toggle("is-filtered", Boolean(state.filters.cities?.length));
  }
}
function syncShellStatusText() {
  if (!state.meta) return;
  const sliceParts = [];
  if (state.filters.categories?.length) {
    sliceParts.push(`category ${state.filters.categories[0]}`);
  }
  if (state.filters.cities?.length) {
    sliceParts.push(`city ${state.filters.cities[0]}`);
  }
  const sliceSummary = sliceParts.length
    ? ` | slice: ${sliceParts.join(" / ")}`
    : " | slice: all categories / all cities";
  elements.status.textContent = `${state.meta.data_engine}${sliceSummary}`;
  elements.taskbarMessage.textContent = `Open a page from the desktop icons. Shared filters refresh open windows.${sliceParts.length ? ` Current slice: ${sliceParts.join(" / ")}.` : ""}`;
}
function bindDatePickers() {
  if (typeof flatpickr === "undefined") return;
  const pickerBase = {
    dateFormat: "d / m / Y",
    allowInput: false,
    disableMobile: true,
    locale: { firstDayOfWeek: 1 },
  };
  state.datePickers.start = flatpickr(elements.startDate, {
    ...pickerBase,
    defaultDate: state.filters.startDate || null,
    onChange(selectedDates, _dateStr, instance) {
      const picked = selectedDates[0];
      if (!picked) return;
      state.filters.startDate = instance.formatDate(picked, "Y-m-d");
      scheduleRefresh();
    },
  });
  state.datePickers.end = flatpickr(elements.endDate, {
    ...pickerBase,
    defaultDate: state.filters.endDate || null,
    onChange(selectedDates, _dateStr, instance) {
      const picked = selectedDates[0];
      if (!picked) return;
      state.filters.endDate = instance.formatDate(picked, "Y-m-d");
      scheduleRefresh();
    },
  });
}
function syncClock() {
  elements.clock.textContent = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(new Date());
}
function loadPreferences() {
  try {
    const raw = window.localStorage.getItem(state.preferencesKey);
    if (!raw) return;
    const prefs = JSON.parse(raw);
    if (prefs.windowTheme === "cobalt") prefs.windowTheme = "glass";
    if (prefs.windowTheme === "sand") prefs.windowTheme = "light";
    if (prefs.windowTheme && WINDOW_THEMES[prefs.windowTheme])
      state.windowTheme = prefs.windowTheme;
    if (Array.isArray(prefs.categories))
      state.filters.categories = prefs.categories.filter(Boolean).slice(0, 1);
    if (Array.isArray(prefs.cities))
      state.filters.cities = prefs.cities.filter(Boolean).slice(0, 1);
    if (prefs.granularity) state.filters.granularity = prefs.granularity;
    if (prefs.scenarioMode) state.filters.scenarioMode = prefs.scenarioMode;
  } catch (_) {}
}

function applyQueryPreset() {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get("theme");
  const granularity = params.get("granularity");
  const scenario = params.get("scenario");
  const startDate = params.get("start");
  const endDate = params.get("end");
  const guide = params.get("guide");
  const categories = parseQueryFilterValues(params, "category", "categories");
  const cities = parseQueryFilterValues(params, "city", "cities");

  if (theme && WINDOW_THEMES[theme]) state.windowTheme = theme;
  if (granularity && ["Day", "Month", "Quarter", "Year"].includes(granularity))
    state.filters.granularity = granularity;
  if (scenario && ["Base", "Conservative", "Upside"].includes(scenario))
    state.filters.scenarioMode = scenario;
  if (startDate) state.filters.startDate = startDate;
  if (endDate) state.filters.endDate = endDate;
  if (categories.length) state.filters.categories = categories;
  if (cities.length) state.filters.cities = cities;
  if (guide === "off" || guide === "0" || guide === "false") {
    state.onboarding.dismissed = true;
  }

  return {
    openPages: (params.get("open") || "")
      .split(",")
      .map((item) => item.trim())
      .filter((item) => DESKTOP_PAGES.some((page) => page.key === item)),
    maximizePage: params.get("maximize") || "",
  };
}
function savePreferences() {
  try {
    window.localStorage.setItem(
      state.preferencesKey,
      JSON.stringify({
        windowTheme: state.windowTheme,
        categories: state.filters.categories || [],
        cities: state.filters.cities || [],
        granularity: state.filters.granularity,
        scenarioMode: state.filters.scenarioMode,
      }),
    );
  } catch (_) {}
}

function loginDisabledByQuery() {
  const value = new URLSearchParams(window.location.search).get("login");
  return value === "off" || value === "0" || value === "false";
}

function showLoginScreen() {
  if (!elements.loginScreen) return;
  elements.loginScreen.classList.remove("is-hidden");
  window.setTimeout(() => elements.loginWorkspaceInput?.focus(), 80);
}

function enterWorkspace() {
  try {
    window.sessionStorage.setItem(state.sessionKey, "1");
  } catch (_) {}
  elements.loginScreen?.classList.add("is-hidden");
  elements.taskbarMessage.textContent =
    "Workspace ready. Open Data Center to choose sources or start from the desktop icons.";
}

function lockWorkspace() {
  try {
    window.sessionStorage.removeItem(state.sessionKey);
  } catch (_) {}
  setWorkspaceMenu(false);
  showLoginScreen();
}

function bindLoginScreen() {
  if (!elements.loginScreen) return;
  let active = false;
  try {
    active = window.sessionStorage.getItem(state.sessionKey) === "1";
  } catch (_) {}
  if (loginDisabledByQuery() || active) {
    elements.loginScreen.classList.add("is-hidden");
  } else {
    showLoginScreen();
  }
  elements.loginSubmit?.addEventListener("click", enterWorkspace);
  elements.loginSkip?.addEventListener("click", enterWorkspace);
  elements.loginWorkspaceInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") enterWorkspace();
  });
}

function loadSourceConnections() {
  try {
    const raw = window.localStorage.getItem(state.sourceConnectionsKey);
    const parsed = raw ? JSON.parse(raw) : {};
    state.sourceConnections =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
  } catch (_) {
    state.sourceConnections = {};
  }
}

function persistSourceConnections() {
  try {
    window.localStorage.setItem(
      state.sourceConnectionsKey,
      JSON.stringify(state.sourceConnections),
    );
  } catch (_) {}
}

function loadSourceDrafts() {
  try {
    const raw = window.localStorage.getItem(state.sourceDraftsKey);
    const parsed = raw ? JSON.parse(raw) : [];
    state.sourceDrafts = Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    state.sourceDrafts = [];
  }
}

function persistSourceDrafts() {
  try {
    window.localStorage.setItem(
      state.sourceDraftsKey,
      JSON.stringify(state.sourceDrafts.slice(0, 12)),
    );
  } catch (_) {}
}

function sourceConnected(sourceName) {
  return state.sourceConnections[sourceName] !== false;
}

function setSourceConnected(sourceName, connected) {
  state.sourceConnections[sourceName] = Boolean(connected);
  persistSourceConnections();
}

function defaultOnboardingState() {
  return {
    dismissed: false,
    showChecklistWhenComplete: false,
    tasks: {
      salesOpen: false,
      predictiveOpen: false,
      spotlightUsed: false,
    },
  };
}

function loadOnboardingState() {
  try {
    const raw = window.localStorage.getItem(state.onboardingKey);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state.onboarding = {
      ...defaultOnboardingState(),
      ...parsed,
      tasks: {
        ...defaultOnboardingState().tasks,
        ...(parsed?.tasks || {}),
      },
    };
  } catch (_) {
    state.onboarding = defaultOnboardingState();
  }
}

function persistOnboardingState() {
  try {
    window.localStorage.setItem(
      state.onboardingKey,
      JSON.stringify(state.onboarding),
    );
  } catch (_) {}
}

function onboardingStepCount() {
  return Object.values(state.onboarding.tasks).filter(Boolean).length;
}

function onboardingComplete() {
  return onboardingStepCount() === Object.keys(state.onboarding.tasks).length;
}

function setGuideVisibility(visible) {
  state.onboarding.dismissed = !visible;
  if (!visible) state.onboarding.showChecklistWhenComplete = false;
  persistOnboardingState();
  renderOnboarding();
}

function openGuidePanel() {
  state.onboarding.dismissed = false;
  if (onboardingComplete()) state.onboarding.showChecklistWhenComplete = true;
  persistOnboardingState();
  renderOnboarding();
}

function restartGuide() {
  state.onboarding = defaultOnboardingState();
  persistOnboardingState();
  renderOnboarding();
}

function markOnboardingStep(stepKey) {
  if (!state.onboarding.tasks.hasOwnProperty(stepKey)) return;
  if (state.onboarding.tasks[stepKey]) return;
  state.onboarding.tasks[stepKey] = true;
  if (onboardingComplete()) state.onboarding.showChecklistWhenComplete = false;
  persistOnboardingState();
  renderOnboarding();
}

function pulseSpotlightTargets(pageKey = "sales") {
  openWindow(pageKey);
  const win = document.querySelector(`.window[data-window-id="${pageKey}"]`);
  if (!win) return;
  focusWindow(win);
  const buttons = win.querySelectorAll("[data-spotlight-action]");
  buttons.forEach((button) => button.classList.add("toolbar-button--pulse"));
  window.setTimeout(
    () =>
      buttons.forEach((button) =>
        button.classList.remove("toolbar-button--pulse"),
      ),
    4200,
  );
}

function openGuideWorkspace() {
  openGuideWorkspacePreset("planning");
}

function openGuideWorkspacePreset(mode = "planning") {
  const pair =
    mode === "customers" ? ["customers", "retention"] : ["sales", "predictive"];
  openWindow(pair[0]);
  openWindow(pair[1]);
  const leftWin = document.querySelector(
    `.window[data-window-id="${pair[0]}"]`,
  );
  const rightWin = document.querySelector(
    `.window[data-window-id="${pair[1]}"]`,
  );
  const layerRect = getLayerRect();
  if (leftWin && rightWin && layerRect.width >= 1280) {
    const gap = 18;
    const left = 118;
    const width = Math.floor((layerRect.width - left - gap - 24) / 2);
    const height = Math.min(layerRect.height - 36, 700);
    applyRect(leftWin, { left, top: 18, width, height });
    applyRect(rightWin, {
      left: left + width + gap,
      top: 18,
      width,
      height,
    });
  }
  if (leftWin) focusWindow(leftWin);
}

function renderStateCard({ title, message, stateType = "empty" }) {
  return `<div class="lab-empty" data-state="${escapeHtml(stateType)}"><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p></div></div>`;
}

function windowMinimumForKind(win) {
  if (!win) return { width: 520, height: 360 };
  if (win.dataset.windowKind === "compare") return { width: 860, height: 520 };
  if (win.dataset.windowKind === "spotlight")
    return { width: 680, height: 460 };
  if (win.dataset.windowKind === "bookmarks")
    return { width: 720, height: 460 };
  if (win.dataset.windowKind === "actions") return { width: 760, height: 480 };
  if (win.dataset.windowKind === "recent") return { width: 660, height: 420 };
  if (win.dataset.windowKind === "imported_dataset")
    return { width: 760, height: 520 };
  if (win.dataset.pageKey === "data_center") return { width: 760, height: 520 };
  if (win.dataset.pageKey === "predictive") return { width: 760, height: 520 };
  if (win.dataset.pageKey === "retention") return { width: 740, height: 500 };
  return { width: 680, height: 460 };
}

function renderOnboarding() {
  if (!elements.onboarding || !elements.openGuide) return;
  const stepsDone = onboardingStepCount();
  const totalSteps = Object.keys(state.onboarding.tasks).length;
  const isComplete = onboardingComplete();
  const showCompleteSummary =
    isComplete && !state.onboarding.showChecklistWhenComplete;
  elements.openGuide.textContent = "Guide";
  elements.openGuide.dataset.guideState = isComplete
    ? "complete"
    : "incomplete";
  elements.openGuide.title = isComplete
    ? "Guide complete"
    : `Guide ${stepsDone}/${totalSteps}`;
  elements.onboarding.classList.toggle("hidden", state.onboarding.dismissed);
  if (state.onboarding.dismissed) {
    elements.onboarding.innerHTML = "";
    return;
  }
  if (showCompleteSummary) {
    elements.onboarding.innerHTML = `
      <div class="onboarding-card onboarding-card--complete">
        <span class="onboarding-kicker">Quick Start</span>
        <div class="onboarding-head">
          <div>
            <strong>Workspace basics complete</strong>
            <p>Reopen the guide from the top bar if you need it again.</p>
          </div>
        <span class="onboarding-progress">${totalSteps}/${totalSteps}</span>
        </div>
        <div class="onboarding-actions">
          <button class="toolbar-button toolbar-button--micro" type="button" data-guide-action="checklist">Checklist</button>
          <button class="toolbar-button toolbar-button--micro" type="button" data-guide-action="restart">Restart</button>
          <button class="toolbar-button toolbar-button--micro" type="button" data-guide-action="workspace-customers">Customer risk</button>
          <button class="toolbar-button toolbar-button--ghost" type="button" data-guide-action="dismiss">Hide guide</button>
        </div>
      </div>
    `;
    elements.onboarding
      .querySelectorAll("[data-guide-action]")
      .forEach((button) =>
        button.addEventListener("click", () => {
          if (button.dataset.guideAction === "dismiss")
            setGuideVisibility(false);
          if (button.dataset.guideAction === "checklist") {
            state.onboarding.showChecklistWhenComplete = true;
            persistOnboardingState();
            renderOnboarding();
          }
          if (button.dataset.guideAction === "restart") restartGuide();
          if (button.dataset.guideAction === "workspace-customers")
            openGuideWorkspacePreset("customers");
        }),
      );
    return;
  }
  const item = (key, title, description, actionLabel = "", action = "") => {
    const done = state.onboarding.tasks[key];
    return `
      <div class="onboarding-item ${done ? "is-complete" : ""}">
        <span class="onboarding-check" aria-hidden="true">${done ? "&#10003;" : ""}</span>
        <div class="onboarding-copy">
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(description)}</span>
        </div>
        ${
          done
            ? ""
            : `<button class="toolbar-button toolbar-button--micro" type="button" data-guide-action="${escapeHtml(action)}">${escapeHtml(actionLabel)}</button>`
        }
      </div>
    `;
  };
  elements.onboarding.innerHTML = `
    <div class="onboarding-card">
      <span class="onboarding-kicker">Quick Start</span>
      <div class="onboarding-head">
        <div>
          <strong>${isComplete ? "You are ready" : "Start with one simple workflow"}</strong>
          <p>${isComplete ? "The workspace basics are covered. Keep the guide closed and reopen it if needed." : "Open Data Center, then two core views and Spotlight once. That is enough to understand how this desktop works."}</p>
        </div>
        <span class="onboarding-progress">${stepsDone}/${totalSteps}</span>
      </div>
      <div class="onboarding-actions">
        <button class="toolbar-button toolbar-button--highlight" type="button" data-guide-action="workspace">Planning workspace</button>
        <button class="toolbar-button toolbar-button--micro" type="button" data-guide-action="workspace-customers">Customer risk</button>
        ${
          isComplete
            ? '<button class="toolbar-button toolbar-button--micro" type="button" data-guide-action="restart">Restart</button>'
            : ""
        }
        <button class="toolbar-button toolbar-button--ghost" type="button" data-guide-action="dismiss">${isComplete ? "Hide guide" : "Skip for now"}</button>
      </div>
      <div class="onboarding-list">
        ${item("dataCenterOpen", "Open Data Center", "Choose the sources available to this workspace.", "Open", "data_center")}
        ${item("salesOpen", "Open Sales Overview", "Start with the topline page to ground the time slice.", "Open", "sales")}
        ${item("predictiveOpen", "Open Predictive Outlook", "Use the forecast view next to move from reporting to planning.", "Open", "predictive")}
        ${item("spotlightUsed", "Use Spotlight once", "Spotlight isolates one chart or table into its own investigation window.", "Show me", "spotlight")}
      </div>
      <div class="onboarding-footnote">The guide never blocks the desktop. You can reopen it from the top bar at any time.</div>
    </div>
  `;
  elements.onboarding
    .querySelectorAll("[data-guide-action]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        const action = button.dataset.guideAction;
        if (action === "dismiss") {
          setGuideVisibility(false);
          return;
        }
        if (action === "workspace") {
          openGuideWorkspacePreset("planning");
          return;
        }
        if (action === "workspace-customers") {
          openGuideWorkspacePreset("customers");
          return;
        }
        if (action === "restart") {
          restartGuide();
          return;
        }
        if (action === "sales" || action === "predictive") {
          openWindow(action);
          return;
        }
        if (action === "spotlight") {
          pulseSpotlightTargets("sales");
        }
      }),
    );
}

function storageTtlDays(key) {
  if (key === state.bookmarksKey) return 90;
  if (key === state.actionsKey) return 60;
  if (key === state.annotationsKey) return 30;
  if (key === state.recentKey) return 30;
  if (key === state.importedDatasetsKey) return 30;
  return 30;
}

function readStoredArray(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : parsed?.items;
    if (!Array.isArray(items)) return [];
    const savedAt = Array.isArray(parsed) ? null : parsed?.savedAt;
    const ttlDays = storageTtlDays(key);
    if (savedAt) {
      const ageMs = Date.now() - new Date(savedAt).getTime();
      if (Number.isFinite(ageMs) && ageMs > ttlDays * 86400000) {
        window.localStorage.removeItem(key);
        return [];
      }
    }
    return items;
  } catch (_) {
    return [];
  }
}

function writeStoredArray(key, value) {
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        savedAt: isoNow(),
        items: value,
      }),
    );
  } catch (_) {}
}

function loadWorkspaceCollections() {
  state.bookmarks = readStoredArray(state.bookmarksKey);
  state.actionItems = readStoredArray(state.actionsKey);
  state.annotations = readStoredArray(state.annotationsKey);
  state.recentEntries = readStoredArray(state.recentKey);
  state.importedDatasets = readStoredArray(state.importedDatasetsKey).slice(
    0,
    8,
  );
  state.localFilePreview = state.importedDatasets[0] || null;
}

function persistBookmarks() {
  writeStoredArray(state.bookmarksKey, state.bookmarks);
}
function persistActions() {
  writeStoredArray(state.actionsKey, state.actionItems);
}
function persistAnnotations() {
  writeStoredArray(state.annotationsKey, state.annotations);
}
function persistRecentEntries() {
  writeStoredArray(state.recentKey, state.recentEntries);
}
function persistImportedDatasets() {
  writeStoredArray(state.importedDatasetsKey, state.importedDatasets.slice(0, 8));
}

function isoNow() {
  return new Date().toISOString();
}

function currentWindowRect(win) {
  return {
    left: parseFloat(win.style.left || "0"),
    top: parseFloat(win.style.top || "0"),
    width: parseFloat(win.style.width || String(win.offsetWidth || 0)),
    height: parseFloat(win.style.height || String(win.offsetHeight || 0)),
  };
}

function serializeOpenWindows() {
  return getOpenWindows().map((win) => {
    const base = {
      windowId: win.dataset.windowId,
      windowKind: win.dataset.windowKind,
      pageKey: win.dataset.pageKey || "",
      isMinimized: win.classList.contains("is-minimized"),
      isMaximized: win.classList.contains("is-maximized"),
      rect: currentWindowRect(win),
      zIndex: Number(win.style.zIndex || 0),
    };
    if (win.dataset.windowKind === "spotlight") {
      const config = state.spotlights.get(win.dataset.windowId);
      return { ...base, spotlight: config || null };
    }
    if (win.dataset.windowKind === "compare") {
      return {
        ...base,
        comparePage: win.dataset.comparePage || "sales",
        compareDimension: win.dataset.compareDimension || "",
        compareLeft: win.dataset.compareLeft || "",
        compareRight: win.dataset.compareRight || "",
      };
    }
    if (win.dataset.windowKind === "recent") {
      return base;
    }
    if (win.dataset.windowKind === "imported_dataset") {
      return { ...base, importId: win.dataset.importId || "" };
    }
    if (
      win.dataset.windowKind === "bookmarks" ||
      win.dataset.windowKind === "actions"
    ) {
      return base;
    }
    return {
      ...base,
      drilldownPeriodKey: win.dataset.drilldownPeriodKey || "",
    };
  });
}

function captureWorkspaceSnapshot(name) {
  return {
    id: `bookmark-${Date.now()}`,
    name,
    createdAt: isoNow(),
    filters: filtersSnapshot(),
    windowTheme: state.windowTheme,
    windows: serializeOpenWindows(),
  };
}

function setWindowRectState(win, snapshot) {
  if (!win || !snapshot) return;
  if (snapshot.rect) applyRect(win, snapshot.rect);
  if (snapshot.isMaximized) {
    win.classList.add("is-maximized");
    applyRect(win, getMaximizedRect());
  }
  if (snapshot.isMinimized) win.classList.add("is-minimized");
  if (snapshot.zIndex) win.style.zIndex = String(snapshot.zIndex);
}

function closeAllDynamicWindows() {
  getOpenWindows().forEach((win) => closeWindow(win));
}

function restoreWorkspaceSnapshot(snapshot) {
  if (!snapshot) return;
  closeAllDynamicWindows();
  state.filters = {
    startDate:
      snapshot.filters?.startDate ||
      state.meta?.default_start_date ||
      state.filters.startDate,
    endDate:
      snapshot.filters?.endDate ||
      state.meta?.default_end_date ||
      state.filters.endDate,
    categories: Array.isArray(snapshot.filters?.categories)
      ? snapshot.filters.categories.filter(Boolean).slice(0, 1)
      : [],
    cities: Array.isArray(snapshot.filters?.cities)
      ? snapshot.filters.cities.filter(Boolean).slice(0, 1)
      : [],
    granularity: snapshot.filters?.granularity || "Month",
    scenarioMode: snapshot.filters?.scenarioMode || "Base",
  };
  normalizeTopbarSelections();
  if (state.datePickers.start)
    state.datePickers.start.setDate(state.filters.startDate, false, "Y-m-d");
  else elements.startDate.value = displayDate(state.filters.startDate);
  if (state.datePickers.end)
    state.datePickers.end.setDate(state.filters.endDate, false, "Y-m-d");
  else elements.endDate.value = displayDate(state.filters.endDate);
  syncGlobalFilterSelects();
  elements.scenario.value = state.filters.scenarioMode;
  syncGranularityPills();
  syncShellStatusText();
  applyWindowTheme(snapshot.windowTheme || "glass");

  const ordered = (snapshot.windows || [])
    .slice()
    .sort((left, right) => (left.zIndex || 0) - (right.zIndex || 0));
  ordered.forEach((windowState) => {
    if (windowState.windowKind === "page") {
      openWindow(windowState.pageKey);
      const win = document.querySelector(
        `.window[data-window-id="${windowState.windowId}"]`,
      );
      if (!win) return;
      if (windowState.drilldownPeriodKey)
        win.dataset.drilldownPeriodKey = windowState.drilldownPeriodKey;
      setWindowRectState(win, windowState);
      loadPageWindow(windowState.pageKey, true);
      return;
    }
    if (windowState.windowKind === "spotlight" && windowState.spotlight) {
      openSpotlight({ ...windowState.spotlight });
      const win = document.querySelector(
        `.window[data-window-id="${windowState.windowId}"]`,
      );
      setWindowRectState(win, windowState);
      loadSpotlightWindow(windowState.windowId, true);
      return;
    }
    if (windowState.windowKind === "compare") {
      openCompareWindow(windowState.comparePage || "sales", {
        id: windowState.windowId,
        dimension: windowState.dimension || windowState.compareDimension,
        leftValue: windowState.leftValue || windowState.compareLeft,
        rightValue: windowState.rightValue || windowState.compareRight,
      });
      const win = document.querySelector(
        `.window[data-window-id="${windowState.windowId}"]`,
      );
      setWindowRectState(win, windowState);
      renderCompareWindow(windowState.windowId, true);
      return;
    }
    if (windowState.windowKind === "bookmarks") {
      openBookmarksWindow(windowState.windowId);
      const win = document.querySelector(
        `.window[data-window-id="${windowState.windowId}"]`,
      );
      setWindowRectState(win, windowState);
      return;
    }
    if (windowState.windowKind === "actions") {
      openActionBoardWindow(windowState.windowId);
      const win = document.querySelector(
        `.window[data-window-id="${windowState.windowId}"]`,
      );
      setWindowRectState(win, windowState);
      return;
    }
    if (windowState.windowKind === "recent") {
      openRecentWindow(windowState.windowId);
      const win = document.querySelector(
        `.window[data-window-id="${windowState.windowId}"]`,
      );
      setWindowRectState(win, windowState);
      return;
    }
    if (windowState.windowKind === "imported_dataset") {
      openImportedDatasetWindow(windowState.importId);
      const win = document.querySelector(
        `.window[data-import-id="${windowState.importId}"]`,
      );
      setWindowRectState(win, windowState);
    }
  });
}

function notesForPage(pageKey) {
  return state.annotations
    .filter((item) => item.pageKey === pageKey)
    .sort((left, right) =>
      String(right.createdAt).localeCompare(String(left.createdAt)),
    )
    .slice(0, 3);
}

function createContextAction(pageKey, title, details = {}) {
  const page = pageByKey(pageKey);
  state.actionItems.unshift({
    id: `action-${Date.now()}`,
    pageKey,
    title,
    source: page?.windowLabel || pageKey,
    status: "Open",
    priority: "High",
    owner: "",
    dueDate: "",
    notes: details.notes || "",
    context: details.context || currentFiltersSummary(),
    createdAt: isoNow(),
  });
  persistActions();
}

function pageAnnotations(pageKey) {
  return state.annotations
    .filter((item) => item.pageKey === pageKey)
    .sort((left, right) =>
      String(right.createdAt).localeCompare(String(left.createdAt)),
    );
}

function formatStamp(stamp) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(stamp));
  } catch (_) {
    return "";
  }
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function preferredCompareDimension(pageKey) {
  return ["sales", "products", "predictive", "retention"].includes(pageKey)
    ? "category"
    : "city";
}

function compareValuesForDimension(dimension) {
  if (!state.meta) return [];
  return dimension === "category"
    ? state.meta.categories || []
    : state.meta.cities || [];
}

function normalizeCompareSelection(windowConfig) {
  const dimension =
    windowConfig.dimension || preferredCompareDimension(windowConfig.pageKey);
  const values = compareValuesForDimension(dimension);
  const leftValue = values.includes(windowConfig.leftValue)
    ? windowConfig.leftValue
    : values[0] || "";
  let rightValue = values.includes(windowConfig.rightValue)
    ? windowConfig.rightValue
    : values[1] || values[0] || "";
  if (rightValue === leftValue && values.length > 1) {
    rightValue = values.find((item) => item !== leftValue) || rightValue;
  }
  return {
    ...windowConfig,
    dimension,
    leftValue,
    rightValue,
  };
}

function addAnnotation(pageKey, note, sourceTitle = "") {
  state.annotations.unshift({
    id: `annotation-${Date.now()}`,
    pageKey,
    note,
    sourceTitle,
    context: currentFiltersSummary(),
    createdAt: isoNow(),
  });
  persistAnnotations();
}

function trackRecent(entry) {
  const dedupeKey =
    entry.kind === "page"
      ? `page:${entry.pageKey}:${entry.drilldownPeriodKey || ""}`
      : entry.kind === "spotlight"
        ? `spotlight:${entry.pageKey}:${entry.focusType || entry.kind}:${entry.interactionKey || ""}:${entry.interactionValue || ""}:${entry.drilldownPeriodKey || ""}`
        : `compare:${entry.pageKey}:${entry.dimension || ""}:${entry.leftValue || ""}:${entry.rightValue || ""}`;
  state.recentEntries = state.recentEntries.filter(
    (item) => item.dedupeKey !== dedupeKey,
  );
  state.recentEntries.unshift({
    ...entry,
    dedupeKey,
    openedAt: isoNow(),
  });
  state.recentEntries = state.recentEntries.slice(0, 18);
  persistRecentEntries();
}

function renderRecentList() {
  if (!state.recentEntries.length) {
    return renderStateCard({
      title: "No recent items yet",
      message:
        "Open pages, spotlight windows, or compare views to build a quick reopen list.",
      stateType: "empty",
    });
  }
  return `<div class="bookmark-list">${state.recentEntries
    .map(
      (entry) => `
        <article class="bookmark-item" data-recent-id="${escapeHtml(entry.dedupeKey)}">
          <div class="bookmark-item-head">
            <div>
              <div class="bookmark-item-title">${escapeHtml(entry.title || entry.pageKey)}</div>
              <div class="bookmark-item-subtitle">${escapeHtml(formatStamp(entry.openedAt))} | ${escapeHtml(entry.kind)}</div>
            </div>
          </div>
          <div class="bookmark-item-grid">
            <div class="board-field"><span>Page</span><strong>${escapeHtml(pageByKey(entry.pageKey)?.windowLabel || entry.pageKey || "-")}</strong></div>
            <div class="board-field"><span>Context</span><strong>${escapeHtml(entry.context || "")}</strong></div>
          </div>
          <div class="bookmark-item-actions">
            <button class="toolbar-button toolbar-button--micro" type="button" data-recent-action="reopen" data-recent-id="${escapeHtml(entry.dedupeKey)}">Reopen</button>
            <button class="toolbar-button toolbar-button--micro" type="button" data-recent-action="delete" data-recent-id="${escapeHtml(entry.dedupeKey)}">Remove</button>
          </div>
        </article>
      `,
    )
    .join("")}</div>`;
}

function renderAnnotations(pageKey) {
  const notes = pageAnnotations(pageKey).slice(0, 4);
  if (!notes.length) {
    return renderStateCard({
      title: "No annotations yet",
      message: "Use Note to pin context for this page.",
      stateType: "empty",
    });
  }
  return `<div class="lab-annotation-list">${notes
    .map(
      (note) => `
        <article class="lab-annotation-item">
          <div class="lab-annotation-meta">
            <strong>${escapeHtml(note.sourceTitle || pageByKey(pageKey)?.windowLabel || pageKey)}</strong>
            <span>${escapeHtml(formatStamp(note.createdAt))} | ${escapeHtml(note.context || "")}</span>
          </div>
          <p>${escapeHtml(note.note)}</p>
        </article>
      `,
    )
    .join("")}</div>`;
}

function renderBookmarksList() {
  if (!state.bookmarks.length) {
    return renderStateCard({
      title: "No bookmarks saved yet",
      message: "Save the current desktop to restore it later.",
      stateType: "empty",
    });
  }
  return `<div class="bookmark-list">${state.bookmarks
    .slice()
    .sort((left, right) =>
      String(right.createdAt).localeCompare(String(left.createdAt)),
    )
    .map(
      (bookmark) => `
        <article class="bookmark-item" data-bookmark-id="${escapeHtml(bookmark.id)}">
          <div class="bookmark-item-head">
            <div>
              <div class="bookmark-item-title">${escapeHtml(bookmark.name)}</div>
              <div class="bookmark-item-subtitle">${escapeHtml(formatStamp(bookmark.createdAt))}</div>
            </div>
          </div>
          <div class="bookmark-item-grid">
            <div class="board-field"><span>Filters</span><strong>${escapeHtml(currentFiltersSummary(bookmark.filters || {}))}</strong></div>
            <div class="board-field"><span>Theme</span><strong>${escapeHtml(bookmark.windowTheme || "glass")}</strong></div>
            <div class="board-field"><span>Windows</span><strong>${escapeHtml(String(bookmark.windows?.length || 0))}</strong></div>
          </div>
          <div class="bookmark-item-actions">
            <button class="toolbar-button toolbar-button--micro" type="button" data-bookmark-action="restore" data-bookmark-id="${escapeHtml(bookmark.id)}">Restore</button>
            <button class="toolbar-button toolbar-button--micro" type="button" data-bookmark-action="rename" data-bookmark-id="${escapeHtml(bookmark.id)}">Rename</button>
            <button class="toolbar-button toolbar-button--micro" type="button" data-bookmark-action="delete" data-bookmark-id="${escapeHtml(bookmark.id)}">Delete</button>
          </div>
        </article>
      `,
    )
    .join("")}</div>`;
}

function renderActionList() {
  if (!state.actionItems.length) {
    return renderStateCard({
      title: "No action items yet",
      message:
        "Use Action inside a page window to push a follow-up into the board.",
      stateType: "empty",
    });
  }
  return `<div class="board-list">${state.actionItems
    .map(
      (item) => `
        <article class="board-item" data-action-id="${escapeHtml(item.id)}">
          <div class="board-item-head">
            <div>
              <div class="board-item-title">${escapeHtml(item.title)}</div>
              <div class="board-item-subtitle">${escapeHtml(item.source)} | ${escapeHtml(item.context || "")}</div>
            </div>
          </div>
          <div class="board-item-grid">
            <label class="board-field"><span>Status</span><select data-field="status">
              <option value="Open" ${item.status === "Open" ? "selected" : ""}>Open</option>
              <option value="Monitoring" ${item.status === "Monitoring" ? "selected" : ""}>Monitoring</option>
              <option value="Done" ${item.status === "Done" ? "selected" : ""}>Done</option>
            </select></label>
            <label class="board-field"><span>Priority</span><select data-field="priority">
              <option value="High" ${item.priority === "High" ? "selected" : ""}>High</option>
              <option value="Medium" ${item.priority === "Medium" ? "selected" : ""}>Medium</option>
              <option value="Low" ${item.priority === "Low" ? "selected" : ""}>Low</option>
            </select></label>
            <label class="board-field"><span>Owner</span><input data-field="owner" value="${escapeHtml(item.owner || "")}" /></label>
            <label class="board-field"><span>Due</span><input data-field="dueDate" value="${escapeHtml(item.dueDate || "")}" placeholder="YYYY-MM-DD" /></label>
          </div>
          <label class="board-field"><span>Notes</span><textarea data-field="notes" rows="3" placeholder="Decision, owner handoff, or next check.">${escapeHtml(item.notes || "")}</textarea></label>
          <div class="board-item-actions">
            <button class="toolbar-button toolbar-button--micro" type="button" data-action-board="done" data-action-id="${escapeHtml(item.id)}">Mark done</button>
            <button class="toolbar-button toolbar-button--micro" type="button" data-action-board="delete" data-action-id="${escapeHtml(item.id)}">Delete</button>
          </div>
        </article>
      `,
    )
    .join("")}</div>`;
}

function compareWindowConfig(win) {
  return normalizeCompareSelection({
    id: win.dataset.windowId,
    pageKey: win.dataset.comparePage,
    dimension: win.dataset.compareDimension,
    leftValue: win.dataset.compareLeft,
    rightValue: win.dataset.compareRight,
  });
}

function buildUtilityWindowMarkup({
  id,
  title,
  iconClass,
  kind,
  width = 880,
  height = 620,
  minWidth = 560,
  minHeight = 380,
  body,
}) {
  return `
    <article class="window" data-window-id="${escapeHtml(id)}" data-window-kind="${escapeHtml(kind)}" data-w="${width}" data-h="${height}" data-min-w="${minWidth}" data-min-h="${minHeight}">
      <div class="titlebar">
        <div class="title-meta">
          <span class="task-mark title-mark ${escapeHtml(iconClass)}" aria-hidden="true"></span>
          <span>${escapeHtml(title)}</span>
        </div>
        <div class="titlebar-utility">
          <span class="toolbar-label titlebar-status window-status" data-role="status">Ready</span>
          <div class="titlebar-buttons">
            <button class="toolbar-button toolbar-button--micro" type="button" data-action="reload">Refresh</button>
          </div>
          <div class="window-controls">
            <button type="button" data-action="minimize" aria-label="Minimize">_</button>
            <button type="button" data-action="maximize" aria-label="Maximize">[]</button>
            <button type="button" data-action="close" aria-label="Close">x</button>
          </div>
        </div>
      </div>
      <div class="window-content">
        <div class="lab-shell">${body}</div>
      </div>
      ${resizeDirections.map((direction) => `<div class="window-resize-handle" data-resize-direction="${direction}"></div>`).join("")}
    </article>
  `;
}

function bindDynamicWindowChrome(win, onReload) {
  win
    .querySelector('[data-action="reload"]')
    .addEventListener("click", () => onReload?.());
  win
    .querySelector('[data-action="minimize"]')
    .addEventListener("click", () => minimizeWindow(win));
  win
    .querySelector('[data-action="maximize"]')
    .addEventListener("click", () => toggleMaximize(win));
  win
    .querySelector('[data-action="close"]')
    .addEventListener("click", () => closeWindow(win));
  win
    .querySelector(".titlebar")
    .addEventListener("pointerdown", (event) => startDrag(event, win));
  win
    .querySelectorAll(".window-resize-handle")
    .forEach((handle) =>
      handle.addEventListener("pointerdown", (event) =>
        startResize(event, win, handle.dataset.resizeDirection),
      ),
    );
}

function buildBookmarksWindowMarkup(id) {
  return buildUtilityWindowMarkup({
    id,
    title: "Bookmarks",
    iconClass: "task-mark--bookmark",
    kind: "bookmarks",
    width: 760,
    height: 560,
    body: `
      <section class="lab-panel bookmark-shell">
        <div class="lab-panel-head">
          <strong>Saved Workspaces</strong>
          <div class="bookmark-toolbar">
            <button class="toolbar-button toolbar-button--micro" type="button" data-action="save-current-bookmark">Save current workspace</button>
          </div>
        </div>
        <div data-role="bookmark-list"></div>
      </section>
    `,
  });
}

function renderBookmarksWindow(windowId) {
  const win = document.querySelector(`.window[data-window-id="${windowId}"]`);
  if (!win) return;
  win.querySelector('[data-role="status"]').textContent =
    `${state.bookmarks.length} saved workspace(s)`;
  const listEl = win.querySelector('[data-role="bookmark-list"]');
  listEl.innerHTML = renderBookmarksList();
  listEl.querySelectorAll("[data-bookmark-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const bookmark = state.bookmarks.find(
        (item) => item.id === button.dataset.bookmarkId,
      );
      if (!bookmark) return;
      if (button.dataset.bookmarkAction === "restore") {
        restoreWorkspaceSnapshot(bookmark);
        return;
      }
      if (button.dataset.bookmarkAction === "rename") {
        const nextName = window.prompt("Rename bookmark", bookmark.name || "");
        if (!nextName || !nextName.trim()) return;
        bookmark.name = nextName.trim();
        persistBookmarks();
        renderBookmarksWindow(windowId);
        return;
      }
      if (button.dataset.bookmarkAction === "delete") {
        state.bookmarks = state.bookmarks.filter(
          (item) => item.id !== bookmark.id,
        );
        persistBookmarks();
        renderBookmarksWindow(windowId);
      }
    });
  });
  const saveButton = win.querySelector('[data-action="save-current-bookmark"]');
  if (saveButton) {
    saveButton.onclick = () => {
      const name =
        window.prompt("Bookmark name", `Workspace ${formatStamp(isoNow())}`) ||
        "";
      if (!name.trim()) return;
      state.bookmarks.unshift(captureWorkspaceSnapshot(name.trim()));
      persistBookmarks();
      renderBookmarksWindow(windowId);
    };
  }
}

function openBookmarksWindow(forcedId = "") {
  const existing = forcedId
    ? document.querySelector(`.window[data-window-id="${forcedId}"]`)
    : document.querySelector('.window[data-window-kind="bookmarks"]');
  if (existing) {
    openWindow(existing.dataset.windowId);
    renderBookmarksWindow(existing.dataset.windowId);
    return;
  }
  const id = forcedId || `bookmarks-${Date.now()}`;
  elements.windowsLayer.insertAdjacentHTML(
    "beforeend",
    buildBookmarksWindowMarkup(id),
  );
  const win = document.querySelector(`.window[data-window-id="${id}"]`);
  bindDynamicWindowChrome(win, () => renderBookmarksWindow(id));
  elements.tasks.insertAdjacentHTML(
    "beforeend",
    createTaskButtonHtml(id, "Bookmarks", "task-mark--bookmark"),
  );
  bindTaskButton(elements.tasks.querySelector(`[data-task="${id}"]`));
  openWindow(id);
}

function buildActionBoardWindowMarkup(id) {
  return buildUtilityWindowMarkup({
    id,
    title: "Action Board",
    iconClass: "task-mark--actionboard",
    kind: "actions",
    width: 860,
    height: 620,
    body: `
      <section class="lab-panel board-shell">
        <div class="lab-panel-head">
          <strong>Prioritized Actions</strong>
          <div class="board-toolbar">
            <span>Track what deserves follow-up, owner, and due date.</span>
          </div>
        </div>
        <div data-role="action-list"></div>
      </section>
    `,
  });
}

function buildRecentWindowMarkup(id) {
  return buildUtilityWindowMarkup({
    id,
    title: "Recent",
    iconClass: "task-mark--recent",
    kind: "recent",
    width: 760,
    height: 560,
    body: `
      <section class="lab-panel bookmark-shell">
        <div class="lab-panel-head">
          <strong>Recently Opened</strong>
          <div class="bookmark-toolbar">
            <button class="toolbar-button toolbar-button--micro" type="button" data-action="clear-recent">Clear</button>
          </div>
        </div>
        <div data-role="recent-list"></div>
      </section>
    `,
  });
}

function reopenRecentEntry(entry) {
  if (!entry) return;
  if (entry.kind === "page") {
    openWindow(entry.pageKey);
    const win = document.querySelector(
      `.window[data-window-id="${entry.pageKey}"]`,
    );
    if (win && entry.drilldownPeriodKey)
      win.dataset.drilldownPeriodKey = entry.drilldownPeriodKey;
    if (win) loadPageWindow(entry.pageKey, true);
    return;
  }
  if (entry.kind === "spotlight") {
    openSpotlight({
      ...entry.config,
      id: "",
    });
    return;
  }
  if (entry.kind === "compare") {
    openCompareWindow(entry.pageKey, {
      dimension: entry.dimension,
      leftValue: entry.leftValue,
      rightValue: entry.rightValue,
    });
  }
}

function renderRecentWindow(windowId) {
  const win = document.querySelector(`.window[data-window-id="${windowId}"]`);
  if (!win) return;
  win.querySelector('[data-role="status"]').textContent =
    `${state.recentEntries.length} recent item(s)`;
  const listEl = win.querySelector('[data-role="recent-list"]');
  listEl.innerHTML = renderRecentList();
  listEl.querySelectorAll("[data-recent-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const entry = state.recentEntries.find(
        (item) => item.dedupeKey === button.dataset.recentId,
      );
      if (!entry) return;
      if (button.dataset.recentAction === "reopen") {
        reopenRecentEntry(entry);
        return;
      }
      if (button.dataset.recentAction === "delete") {
        state.recentEntries = state.recentEntries.filter(
          (item) => item.dedupeKey !== entry.dedupeKey,
        );
        persistRecentEntries();
        renderRecentWindow(windowId);
      }
    });
  });
  const clearButton = win.querySelector('[data-action="clear-recent"]');
  if (clearButton) {
    clearButton.onclick = () => {
      state.recentEntries = [];
      persistRecentEntries();
      renderRecentWindow(windowId);
    };
  }
}

function openRecentWindow(forcedId = "") {
  const existing = forcedId
    ? document.querySelector(`.window[data-window-id="${forcedId}"]`)
    : document.querySelector('.window[data-window-kind="recent"]');
  if (existing) {
    openWindow(existing.dataset.windowId);
    renderRecentWindow(existing.dataset.windowId);
    return;
  }
  const id = forcedId || `recent-${Date.now()}`;
  elements.windowsLayer.insertAdjacentHTML(
    "beforeend",
    buildRecentWindowMarkup(id),
  );
  const win = document.querySelector(`.window[data-window-id="${id}"]`);
  bindDynamicWindowChrome(win, () => renderRecentWindow(id));
  elements.tasks.insertAdjacentHTML(
    "beforeend",
    createTaskButtonHtml(id, "Recent", "task-mark--recent"),
  );
  bindTaskButton(elements.tasks.querySelector(`[data-task="${id}"]`));
  openWindow(id);
}

function renderActionBoardWindow(windowId) {
  const win = document.querySelector(`.window[data-window-id="${windowId}"]`);
  if (!win) return;
  win.querySelector('[data-role="status"]').textContent =
    `${state.actionItems.length} open action item(s)`;
  const listEl = win.querySelector('[data-role="action-list"]');
  listEl.innerHTML = renderActionList();
  listEl.querySelectorAll("[data-action-id]").forEach((itemEl) => {
    const actionId = itemEl.dataset.actionId;
    itemEl.querySelectorAll("[data-field]").forEach((fieldEl) => {
      fieldEl.addEventListener("change", () => {
        const item = state.actionItems.find((entry) => entry.id === actionId);
        if (!item) return;
        item[fieldEl.dataset.field] = fieldEl.value;
        persistActions();
      });
      if (fieldEl.tagName === "TEXTAREA" || fieldEl.tagName === "INPUT") {
        fieldEl.addEventListener("input", () => {
          const item = state.actionItems.find((entry) => entry.id === actionId);
          if (!item) return;
          item[fieldEl.dataset.field] = fieldEl.value;
          persistActions();
        });
      }
    });
  });
  listEl.querySelectorAll("[data-action-board]").forEach((button) => {
    button.addEventListener("click", () => {
      const actionId = button.dataset.actionId;
      const item = state.actionItems.find((entry) => entry.id === actionId);
      if (!item) return;
      if (button.dataset.actionBoard === "done") {
        item.status = "Done";
        persistActions();
        renderActionBoardWindow(windowId);
        return;
      }
      if (button.dataset.actionBoard === "delete") {
        state.actionItems = state.actionItems.filter(
          (entry) => entry.id !== actionId,
        );
        persistActions();
        renderActionBoardWindow(windowId);
      }
    });
  });
}

function openActionBoardWindow(forcedId = "") {
  const existing = forcedId
    ? document.querySelector(`.window[data-window-id="${forcedId}"]`)
    : document.querySelector('.window[data-window-kind="actions"]');
  if (existing) {
    openWindow(existing.dataset.windowId);
    renderActionBoardWindow(existing.dataset.windowId);
    return;
  }
  const id = forcedId || `actions-${Date.now()}`;
  elements.windowsLayer.insertAdjacentHTML(
    "beforeend",
    buildActionBoardWindowMarkup(id),
  );
  const win = document.querySelector(`.window[data-window-id="${id}"]`);
  bindDynamicWindowChrome(win, () => renderActionBoardWindow(id));
  elements.tasks.insertAdjacentHTML(
    "beforeend",
    createTaskButtonHtml(id, "Action Board", "task-mark--actionboard"),
  );
  bindTaskButton(elements.tasks.querySelector(`[data-task="${id}"]`));
  openWindow(id);
}

function compareCardGrid(cards = []) {
  return cards
    .slice(0, 4)
    .map(
      (card) => `
        <article class="compare-mini-card">
          <span>${escapeHtml(card.title)}</span>
          <strong>${escapeHtml(card.formatted_value)}</strong>
          <small>Prev: ${escapeHtml(card.formatted_previous_value)} | ${escapeHtml(formatPercent(card.delta_pct))}</small>
        </article>
      `,
    )
    .join("");
}

function compareDeltaBanner(leftPayload, rightPayload, config) {
  const leftCard = leftPayload.cards?.[0];
  const rightCard = rightPayload.cards?.[0];
  if (!leftCard || !rightCard) return "";
  const leftValue = Number(leftCard.value || 0);
  const rightValue = Number(rightCard.value || 0);
  const delta =
    rightValue === 0 ? 0 : ((leftValue - rightValue) / rightValue) * 100;
  const dimensionName = config.dimension === "category" ? "category" : "city";
  return `${config.leftValue} is ${formatPercent(delta)} versus ${config.rightValue} on ${leftCard.title.toLowerCase()} for this ${dimensionName} comparison.`;
}

function renderComparePlot(plotEl, leftPayload, rightPayload, config) {
  if (!plotEl || typeof Plotly === "undefined") return;
  const theme = themeConfig();
  const leftTrend = Array.isArray(leftPayload.trend) ? leftPayload.trend : [];
  const rightTrend = Array.isArray(rightPayload.trend)
    ? rightPayload.trend
    : [];
  const x = leftTrend.map((point) => point.period_label);
  Plotly.react(
    plotEl,
    [
      {
        type: "scatter",
        mode: "lines+markers",
        name: config.leftValue,
        x,
        y: leftTrend.map((point) => point.current_value),
        line: { color: theme.current, width: 3 },
        marker: { size: 6 },
      },
      {
        type: "scatter",
        mode: "lines+markers",
        name: config.rightValue,
        x: rightTrend.map((point) => point.period_label),
        y: rightTrend.map((point) => point.current_value),
        line: { color: theme.previous, width: 3, dash: "dot" },
        marker: { size: 6 },
      },
    ],
    basePlotLayout({
      xTitle: leftPayload.trend_x_title || "Period",
      yTitle:
        leftPayload.trend_y_title || leftPayload.cards?.[0]?.title || "Value",
      metricFormat: leftPayload.trend_metric_format || "currency",
      extra: {
        margin: { l: 86, r: 24, t: 24, b: 84 },
        xaxis: {
          title: { text: leftPayload.trend_x_title || "Period", standoff: 12 },
          color: theme.text,
          tickangle: -24,
          automargin: true,
          tickfont: { size: 11 },
          gridcolor: theme.grid,
        },
      },
    }),
    { responsive: true, displaylogo: false },
  );
}

function buildCompareWindowMarkup(id, pageKey) {
  const page = pageByKey(pageKey);
  return buildUtilityWindowMarkup({
    id,
    title: `Compare ${page?.windowLabel || pageKey}`,
    iconClass: "task-mark--compare",
    kind: "compare",
    width: 1040,
    height: 720,
    minWidth: 920,
    minHeight: 560,
    body: `
      <section class="lab-panel compare-shell">
        <div class="lab-panel-head">
          <strong>${escapeHtml(page?.windowLabel || pageKey)} Compare</strong>
          <div class="compare-toolbar">
            <label class="board-field"><span>Compare by</span><select data-role="compare-dimension"></select></label>
            <label class="board-field"><span>Left side</span><select data-role="compare-left"></select></label>
            <label class="board-field"><span>Right side</span><select data-role="compare-right"></select></label>
            <button class="toolbar-button toolbar-button--micro" type="button" data-action="compare-export">Export CSV</button>
          </div>
        </div>
        <div class="compare-delta-banner" data-role="compare-banner"></div>
        <div class="compare-grid">
          <section class="compare-column">
            <div class="compare-column-head">
              <strong data-role="compare-left-title"></strong>
              <span data-role="compare-left-subtitle"></span>
            </div>
            <div class="compare-card-grid" data-role="compare-left-cards"></div>
          </section>
          <section class="compare-column">
            <div class="compare-column-head">
              <strong data-role="compare-right-title"></strong>
              <span data-role="compare-right-subtitle"></span>
            </div>
            <div class="compare-card-grid" data-role="compare-right-cards"></div>
          </section>
        </div>
        <section class="lab-panel">
          <div class="lab-panel-head">
            <strong>Trend comparison</strong>
            <span data-role="compare-chart-meta"></span>
          </div>
          <div class="lab-plot compare-chart" data-role="compare-chart"></div>
        </section>
      </section>
    `,
  });
}

function syncCompareSelects(win, config) {
  const dimensionSelect = win.querySelector('[data-role="compare-dimension"]');
  const leftSelect = win.querySelector('[data-role="compare-left"]');
  const rightSelect = win.querySelector('[data-role="compare-right"]');
  const dimensions = [
    { value: "category", label: "Category" },
    { value: "city", label: "City" },
  ];
  dimensionSelect.innerHTML = dimensions
    .map(
      (item) =>
        `<option value="${item.value}" ${item.value === config.dimension ? "selected" : ""}>${item.label}</option>`,
    )
    .join("");
  const options = compareValuesForDimension(config.dimension);
  const optionHtml = options
    .map(
      (value) =>
        `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`,
    )
    .join("");
  leftSelect.innerHTML = optionHtml;
  rightSelect.innerHTML = optionHtml;
  leftSelect.value = config.leftValue;
  rightSelect.value = config.rightValue;
}

async function renderCompareWindow(windowId, force = false) {
  const win = document.querySelector(`.window[data-window-id="${windowId}"]`);
  if (!win) return;
  const config = compareWindowConfig(win);
  win.dataset.compareDimension = config.dimension;
  win.dataset.compareLeft = config.leftValue;
  win.dataset.compareRight = config.rightValue;
  syncCompareSelects(win, config);
  const statusEl = win.querySelector('[data-role="status"]');
  const requestKey = `compare:${windowId}`;
  state.requests.get(requestKey)?.abort?.();
  const controller = new AbortController();
  state.requests.set(requestKey, controller);
  statusEl.textContent = `Comparing ${config.leftValue} vs ${config.rightValue}...`;
  win.querySelector('[data-role="compare-banner"]').innerHTML = renderStateCard(
    {
      title: "Loading comparison",
      message: `Comparing ${config.leftValue} and ${config.rightValue} in the same global slice.`,
      stateType: "loading",
    },
  );
  win.querySelector('[data-role="compare-left-cards"]').innerHTML = "";
  win.querySelector('[data-role="compare-right-cards"]').innerHTML = "";
  win.querySelector('[data-role="compare-chart"]').innerHTML = "";
  try {
    const dimensionParam =
      config.dimension === "category" ? "categories" : "cities";
    const [leftResponse, rightResponse] = await Promise.all([
      fetch(
        buildDashboardUrlForFilters(config.pageKey, state.filters, {
          [dimensionParam]: [config.leftValue],
        }),
        { signal: controller.signal },
      ),
      fetch(
        buildDashboardUrlForFilters(config.pageKey, state.filters, {
          [dimensionParam]: [config.rightValue],
        }),
        { signal: controller.signal },
      ),
    ]);
    if (!leftResponse.ok || !rightResponse.ok) {
      throw new Error(
        `Compare request failed (${leftResponse.status}/${rightResponse.status})`,
      );
    }
    const [leftPayload, rightPayload] = await Promise.all([
      leftResponse.json(),
      rightResponse.json(),
    ]);
    if (state.requests.get(requestKey) !== controller) return;
    win._compareData = { leftPayload, rightPayload, config };
    win.querySelector('[data-role="compare-left-title"]').textContent =
      config.leftValue;
    win.querySelector('[data-role="compare-right-title"]').textContent =
      config.rightValue;
    win.querySelector('[data-role="compare-left-subtitle"]').textContent =
      leftPayload.cards?.[0]?.title || "";
    win.querySelector('[data-role="compare-right-subtitle"]').textContent =
      rightPayload.cards?.[0]?.title || "";
    win.querySelector('[data-role="compare-left-cards"]').innerHTML =
      compareCardGrid(leftPayload.cards);
    win.querySelector('[data-role="compare-right-cards"]').innerHTML =
      compareCardGrid(rightPayload.cards);
    win.querySelector('[data-role="compare-banner"]').textContent =
      compareDeltaBanner(leftPayload, rightPayload, config);
    win.querySelector('[data-role="compare-chart-meta"]').textContent =
      `${config.dimension === "category" ? "Category" : "City"} comparison in the same global time slice`;
    renderComparePlot(
      win.querySelector('[data-role="compare-chart"]'),
      leftPayload,
      rightPayload,
      config,
    );
    statusEl.textContent = `${config.leftValue} vs ${config.rightValue} loaded`;
  } catch (error) {
    if (error.name === "AbortError") return;
    renderWindowError(
      win,
      `Compare ${pageByKey(config.pageKey)?.windowLabel || config.pageKey}`,
      error.message,
    );
  } finally {
    if (state.requests.get(requestKey) === controller)
      state.requests.delete(requestKey);
  }
}

function openCompareWindow(pageKey, options = {}) {
  const id = options.id || `compare-${pageKey}-${++state.compareCounter}`;
  const config = normalizeCompareSelection({
    id,
    pageKey,
    dimension: options.dimension || preferredCompareDimension(pageKey),
    leftValue: options.leftValue,
    rightValue: options.rightValue,
  });
  elements.windowsLayer.insertAdjacentHTML(
    "beforeend",
    buildCompareWindowMarkup(id, pageKey),
  );
  const win = document.querySelector(`.window[data-window-id="${id}"]`);
  win.dataset.comparePage = pageKey;
  win.dataset.compareDimension = config.dimension;
  win.dataset.compareLeft = config.leftValue;
  win.dataset.compareRight = config.rightValue;
  trackRecent({
    kind: "compare",
    pageKey,
    title: `Compare ${pageByKey(pageKey)?.windowLabel || pageKey}`,
    context: `${config.dimension}: ${config.leftValue} vs ${config.rightValue}`,
    dimension: config.dimension,
    leftValue: config.leftValue,
    rightValue: config.rightValue,
  });
  bindDynamicWindowChrome(win, () => renderCompareWindow(id, true));
  const syncAndRender = () => renderCompareWindow(id, true);
  win
    .querySelector('[data-action="compare-export"]')
    .addEventListener("click", () => {
      const compareData = win._compareData;
      if (!compareData) return;
      const rows = [
        [
          "section",
          "metric",
          compareData.config.leftValue,
          compareData.config.rightValue,
        ],
      ];
      (compareData.leftPayload.cards || [])
        .slice(0, 4)
        .forEach((card, index) => {
          const rightCard = compareData.rightPayload.cards?.[index];
          rows.push([
            "kpi",
            card.title,
            card.formatted_value,
            rightCard?.formatted_value || "",
          ]);
        });
      const leftTrend = compareData.leftPayload.trend || [];
      const rightTrend = compareData.rightPayload.trend || [];
      rows.push(["trend", "period", "current", "current"]);
      leftTrend.forEach((point, index) => {
        rows.push([
          "trend",
          point.period_label,
          point.current_value,
          rightTrend[index]?.current_value ?? "",
        ]);
      });
      downloadCsv(
        `compare-${compareData.config.pageKey}-${slugify(compareData.config.leftValue)}-vs-${slugify(compareData.config.rightValue)}.csv`,
        rows,
      );
    });
  win
    .querySelector('[data-role="compare-dimension"]')
    .addEventListener("change", (event) => {
      const nextConfig = normalizeCompareSelection({
        pageKey,
        dimension: event.target.value,
      });
      win.dataset.compareDimension = nextConfig.dimension;
      win.dataset.compareLeft = nextConfig.leftValue;
      win.dataset.compareRight = nextConfig.rightValue;
      syncAndRender();
    });
  win
    .querySelector('[data-role="compare-left"]')
    .addEventListener("change", (event) => {
      win.dataset.compareLeft = event.target.value;
      syncAndRender();
    });
  win
    .querySelector('[data-role="compare-right"]')
    .addEventListener("change", (event) => {
      win.dataset.compareRight = event.target.value;
      syncAndRender();
    });
  elements.tasks.insertAdjacentHTML(
    "beforeend",
    createTaskButtonHtml(
      id,
      `Compare ${pageByKey(pageKey)?.windowLabel || pageKey}`,
      "task-mark--compare",
    ),
  );
  bindTaskButton(elements.tasks.querySelector(`[data-task="${id}"]`));
  openWindow(id);
}
function toggleDesktopWorkspace() {
  const visible = getVisibleWindows();
  if (visible.length) {
    visible.forEach((win) => {
      win.classList.add("is-minimized");
      win.classList.remove("is-active");
    });
    syncTasks();
    markIcons(null);
    elements.taskbarMessage.textContent =
      "Desktop revealed. Use Restore to bring your workspace back.";
    return;
  }
  const minimized = getMinimizedWindows().sort(
    (a, b) => Number(a.style.zIndex || 0) - Number(b.style.zIndex || 0),
  );
  if (minimized.length) {
    minimized.forEach((win) => win.classList.remove("is-minimized"));
    focusWindow(minimized[minimized.length - 1]);
    elements.taskbarMessage.textContent = "Workspace restored.";
    return;
  }
  elements.taskbarMessage.textContent = "Open a page from the desktop icons.";
}
function bindTaskButton(button) {
  button.addEventListener("click", () => {
    const win = document.querySelector(
      `.window[data-window-id="${button.dataset.task}"]`,
    );
    if (!win) return;
    if (!win.classList.contains("is-open")) {
      openWindow(button.dataset.task);
      return;
    }
    if (win.classList.contains("is-minimized")) {
      win.classList.remove("is-minimized");
      focusWindow(win);
      return;
    }
    if (win.classList.contains("is-active")) {
      minimizeWindow(win);
      return;
    }
    focusWindow(win);
  });
}
function uniqueNarrative(lines) {
  const seen = new Set();
  return lines.filter((line) => {
    if (!line) return false;
    const normalized = String(line).trim();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}
function renderCards(cards) {
  return cards
    .slice(0, 4)
    .map(
      (card, index) =>
        `<article class="lab-card" data-card-index="${index}"><div class="lab-card-head"><p class="lab-card-title">${escapeHtml(card.title)}</p><button class="toolbar-button toolbar-button--micro spotlight-button" type="button" data-spotlight-action="card" data-card-index="${index}">Spotlight</button></div><p class="lab-card-value">${escapeHtml(card.formatted_value)}</p><div class="lab-card-meta"><span>Prev: ${escapeHtml(card.formatted_previous_value)}</span>${formatCardDelta(card.delta_pct)}</div></article>`,
    )
    .join("");
}

function fitCardValues(scope) {
  window.requestAnimationFrame(() => {
    scope.querySelectorAll(".lab-card-value").forEach((valueEl) => {
      valueEl.style.fontSize = "";
      const baseSize = Number.parseFloat(window.getComputedStyle(valueEl).fontSize);
      let size = baseSize;
      const minSize = 16;
      while (
        valueEl.clientWidth > 0 &&
        valueEl.scrollWidth > valueEl.clientWidth &&
        size > minSize
      ) {
        size -= 1;
        valueEl.style.fontSize = `${size}px`;
      }
    });
  });
}

function observeCardValueFit(scope) {
  if (!scope) return;
  if (scope._cardValueFitObserver) scope._cardValueFitObserver.disconnect();
  if (typeof ResizeObserver === "function") {
    scope._cardValueFitObserver = new ResizeObserver(() => fitCardValues(scope));
    scope._cardValueFitObserver.observe(scope);
    scope
      .querySelectorAll(".lab-card")
      .forEach((card) => scope._cardValueFitObserver.observe(card));
  }
  fitCardValues(scope);
}

function renderNarrative(payload) {
  const lines = uniqueNarrative([
    payload.summary?.[0],
    payload.insight_note,
    payload.summary?.[1],
    payload.summary?.[2],
    payload.interaction_hint,
  ]);
  if (!lines.length)
    return `<section class="lab-narrative"><p class="lab-topline">No narrative generated for this slice.</p></section>`;
  return `<section class="lab-narrative"><p class="lab-topline">${escapeHtml(lines[0])}</p><div class="lab-notes">${lines
    .slice(1, 3)
    .map((line) => `<div class="lab-note">${escapeHtml(line)}</div>`)
    .join("")}</div></section>`;
}

function buildTableHtml(tablePayload, limit = null) {
  if (
    !tablePayload ||
    !Array.isArray(tablePayload.columns) ||
    !Array.isArray(tablePayload.rows)
  ) {
    return `<div class="lab-empty">No table available for this selection.</div>`;
  }
  const rows =
    limit == null ? tablePayload.rows : tablePayload.rows.slice(0, limit);
  return `
    <div class="lab-table-wrap">
      <table class="lab-table">
        <thead>
          <tr>${tablePayload.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${
            rows.length
              ? rows
                  .map((row) => {
                    const rowClass =
                      row.interaction_type === "detail" ? "interactive" : "";
                    const attrs = [
                      `class="${rowClass}"`,
                      `data-interaction-type="${escapeHtml(row.interaction_type || "")}"`,
                      `data-interaction-key="${escapeHtml(row.interaction_key || "")}"`,
                      `data-interaction-value="${escapeHtml(row.interaction_value || "")}"`,
                    ].join(" ");
                    return `<tr ${attrs}>${tablePayload.columns
                      .map((column) => {
                        const raw = row.values?.[column.key] ?? "";
                        if (
                          column.key === "product" ||
                          column.key === "customer"
                        ) {
                          return `<td><span class="long-value" title="${escapeHtml(raw)}">${escapeHtml(truncateMiddle(raw, column.key === "product" ? 46 : 34))}</span></td>`;
                        }
                        return `<td>${escapeHtml(raw)}</td>`;
                      })
                      .join("")}</tr>`;
                  })
                  .join("")
              : `<tr><td colspan="${tablePayload.columns.length}">No rows available.</td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;
}

function bindTableInteractions(
  tableEl,
  pageKey,
  detailPanel,
  filtersOverride = null,
) {
  if (!tableEl) return;
  tableEl
    .querySelectorAll('tr[data-interaction-type="detail"]')
    .forEach((row) => {
      row.addEventListener("click", () => {
        const interactionKey = row.dataset.interactionKey;
        const interactionValue = row.dataset.interactionValue;
        if (!interactionKey || !interactionValue) return;
        loadDetailPanel(
          pageKey,
          interactionKey,
          interactionValue,
          detailPanel,
          filtersOverride,
        );
      });
    });
}

function formatMetricValue(value, metricFormat) {
  if (value == null || Number.isNaN(Number(value))) return "-";
  const number = Number(value);
  if (metricFormat === "percent") return `${number.toFixed(2)}%`;
  if (metricFormat === "number")
    return number.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
  if (scenarioMode === "Conservative") return "Conservative Forecast";
  if (scenarioMode === "Upside") return "Upside Forecast";
  return "Base Forecast";
}

function purgePlot(plotEl) {
  if (!plotEl || typeof Plotly === "undefined") return;
  if (typeof plotEl.removeAllListeners === "function") {
    plotEl.removeAllListeners("plotly_click");
  }
  Plotly.purge(plotEl);
}

function basePlotLayout({
  xTitle,
  yTitle,
  metricFormat,
  showLegend = true,
  plotEl = null,
  extra = {},
}) {
  const theme = themeConfig();
  const { isPercentMetric, axisTickFormat, valueSuffix } =
    metricPresentation(metricFormat);
  const density = plotDensity(plotEl);
  const baseMargin = density.tight
    ? { l: 58, r: 18, t: 18, b: 104 }
    : density.compact
      ? { l: 68, r: 20, t: 20, b: 116 }
      : { l: 86, r: 24, t: 26, b: 84 };
  const baseXaxis = {
    title: { text: density.tight ? "" : xTitle || "", standoff: 12 },
    color: theme.text,
    tickangle: density.tight ? -38 : density.compact ? -32 : -28,
    automargin: true,
    tickfont: { size: density.tight ? 10 : 11 },
    gridcolor: theme.grid,
  };
  const baseYaxis = {
    title: { text: density.tight ? "" : yTitle || "", standoff: 12 },
    color: theme.text,
    automargin: true,
    tickfont: { size: density.tight ? 10 : 11 },
    gridcolor: theme.grid,
    separatethousands: !isPercentMetric,
    tickformat: axisTickFormat,
    ticksuffix: valueSuffix,
  };
  const baseLegend = showLegend
    ? density.compact
      ? {
          orientation: "h",
          x: 0,
          y: -0.22,
          xanchor: "left",
          yanchor: "top",
          font: { color: theme.text, size: density.tight ? 10 : 11 },
        }
      : {
          orientation: "h",
          x: 1,
          y: 1.12,
          xanchor: "right",
          yanchor: "top",
          font: { color: theme.text, size: 11 },
        }
    : { orientation: "h", x: 1, y: 1.12, font: { color: theme.text } };

  const { margin, xaxis, yaxis, legend, ...restExtra } = extra;
  return {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: theme.plotBg,
    margin: { ...baseMargin, ...(margin || {}) },
    xaxis: {
      ...baseXaxis,
      ...(xaxis || {}),
      title: { ...baseXaxis.title, ...(xaxis?.title || {}) },
    },
    yaxis: {
      ...baseYaxis,
      ...(yaxis || {}),
      title: { ...baseYaxis.title, ...(yaxis?.title || {}) },
    },
    legend: showLegend ? { ...baseLegend, ...(legend || {}) } : undefined,
    ...restExtra,
  };
}

function renderPrimaryHeatmap(plotEl, heatmapPayload) {
  if (
    !plotEl ||
    !heatmapPayload ||
    !heatmapPayload.z_values?.length ||
    typeof Plotly === "undefined"
  )
    return false;
  const theme = themeConfig();
  const text = heatmapPayload.z_values.map((row) =>
    row.map((value) => (value == null ? "" : `${value.toFixed(0)}%`)),
  );
  Plotly.react(
    plotEl,
    [
      {
        type: "heatmap",
        x: heatmapPayload.x_labels,
        y: heatmapPayload.y_labels,
        z: heatmapPayload.z_values,
        text,
        texttemplate: "%{text}",
        textfont: { color: theme.text, size: 11 },
        colorscale: [
          [0, "#17304d"],
          [0.35, "#245587"],
          [0.65, "#3b84c5"],
          [1, "#8cd0ff"],
        ],
        zmin: 0,
        zmax: 100,
        hovertemplate: "<b>%{y}</b><br>%{x}: %{z:.1f}%<extra></extra>",
        colorbar: {
          title: "Retention %",
          tickfont: { color: theme.text },
          titlefont: { color: theme.text },
        },
      },
    ],
    basePlotLayout({
      xTitle: "Months Since Acquisition",
      yTitle: "Cohort Month",
      metricFormat: "percent",
      extra: { margin: { l: 86, r: 32, t: 24, b: 56 } },
    }),
    { responsive: true, displaylogo: false },
  );
  if (typeof plotEl.removeAllListeners === "function")
    plotEl.removeAllListeners("plotly_click");
  plotEl.style.cursor = "default";
  return true;
}

function bindPrimaryInteractions(plotEl, payload, options = {}) {
  if (!plotEl || typeof plotEl.on !== "function") return;
  if (typeof plotEl.removeAllListeners === "function") {
    plotEl.removeAllListeners("plotly_click");
  }
  if (options.disablePrimaryInteractions) {
    plotEl.style.cursor = "default";
    return;
  }
  const renderedTrendData = options.renderedTrendData || payload.trend || [];
  const canDrill =
    payload.page === "sales" &&
    payload.granularity !== "Day" &&
    payload.view_mode !== "drilldown" &&
    renderedTrendData.length > 0;
  if (!canDrill) {
    plotEl.style.cursor = "default";
    return;
  }
  plotEl.style.cursor = "pointer";
  plotEl.on("plotly_click", (eventData) => {
    const point = eventData?.points?.[0];
    if (!point) return;
    const selectedPoint = renderedTrendData[point.pointIndex];
    if (!selectedPoint?.period_key) return;
    if (typeof options.onPrimarySelect === "function") {
      options.onPrimarySelect(selectedPoint);
    }
  });
}

function renderPrimaryPlot(plotEl, payload, options = {}) {
  if (!plotEl || typeof Plotly === "undefined") return;
  if (renderPrimaryHeatmap(plotEl, payload.primary_heatmap)) return;
  const theme = themeConfig();
  let trendData = Array.isArray(payload.trend) ? payload.trend.slice() : [];
  if (
    payload.granularity === "Day" &&
    trendData.length > 120 &&
    !options.disableDailyClipping
  ) {
    trendData = trendData.slice(-120);
  }
  const { valueFormat, valueSuffix } = metricPresentation(
    payload.trend_metric_format,
  );
  const density = plotDensity(plotEl);
  const isDailyTrend = payload.granularity === "Day";
  const xTickAngle = isDailyTrend
    ? density.tight
      ? -62
      : density.compact
        ? -58
        : -52
    : density.tight
      ? -36
      : density.compact
        ? -32
        : -28;
  const xTickCount = isDailyTrend
    ? Math.min(
        density.tight ? 8 : density.compact ? 10 : 14,
        Math.max(6, Math.ceil(trendData.length / 8)),
      )
    : undefined;

  if (payload.page === "predictive") {
    const historical = trendData.filter((point) => !point.is_projection);
    const forecast = trendData.filter((point) => point.is_projection);
    const baseline = historical.filter((point) => point.baseline_value != null);
    const traces = [];
    if (
      forecast.some(
        (point) => point.lower_bound != null && point.upper_bound != null,
      )
    ) {
      traces.push({
        type: "scatter",
        mode: "lines",
        name: "Approx. 95% Range",
        x: [
          ...forecast.map((point) => point.period_label),
          ...forecast.map((point) => point.period_label).reverse(),
        ],
        y: [
          ...forecast.map((point) => point.upper_bound),
          ...forecast.map((point) => point.lower_bound).reverse(),
        ],
        fill: "toself",
        fillcolor: `${theme.positive}26`,
        line: { color: `${theme.positive}18`, width: 1 },
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
        line: { color: theme.accent, width: 2, dash: "dot" },
        hovertemplate: `<b>%{x}</b><br>Model Baseline: %{y:${valueFormat}}${valueSuffix}<extra></extra>`,
      });
    }
    if (historical.length) {
      traces.push({
        type: "scatter",
        mode: "lines+markers",
        name: payload.current_series_name || "Actual",
        x: historical.map((point) => point.period_label),
        y: historical.map((point) => point.current_value),
        line: { color: theme.current, width: 3 },
        marker: { size: 6 },
        customdata: historical.map((point) => [point.baseline_value]),
        hovertemplate: `<b>%{x}</b><br>Actual: %{y:${valueFormat}}${valueSuffix}<br>Model Baseline: %{customdata[0]:${valueFormat}}${valueSuffix}<extra></extra>`,
      });
    }
    if (forecast.length) {
      traces.push({
        type: "scatter",
        mode: "lines+markers",
        name: forecastScenarioName(payload.scenario_mode),
        x: forecast.map((point) => point.period_label),
        y: forecast.map((point) => point.current_value),
        line: { color: theme.positive, width: 3, dash: "dash" },
        marker: { size: 7 },
        customdata: forecast.map((point) => [
          point.lower_bound,
          point.upper_bound,
          point.delta_pct,
        ]),
        hovertemplate: `<b>%{x}</b><br>${forecastScenarioName(payload.scenario_mode)}: %{y:${valueFormat}}${valueSuffix}<br>95% Low: %{customdata[0]:${valueFormat}}${valueSuffix}<br>95% High: %{customdata[1]:${valueFormat}}${valueSuffix}<br>Delta vs latest closed month: %{customdata[2]:+.2f}%<extra></extra>`,
      });
    }
    Plotly.react(
      plotEl,
      traces,
      basePlotLayout({
        xTitle: payload.trend_x_title,
        yTitle: payload.trend_y_title,
        metricFormat: payload.trend_metric_format,
        plotEl,
        extra: {
          xaxis: {
            title: {
              text: density.tight ? "" : payload.trend_x_title,
              standoff: 12,
            },
            color: theme.text,
            tickangle: xTickAngle,
            automargin: true,
            tickfont: { size: density.tight ? 10 : 11 },
            nticks: xTickCount,
            gridcolor: theme.grid,
          },
        },
      }),
      { responsive: true, displaylogo: false },
    );
    bindPrimaryInteractions(plotEl, payload, {
      ...options,
      renderedTrendData: trendData,
    });
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

  const currentTrace =
    payload.current_trace_style === "line"
      ? {
          type: "scatter",
          mode: "lines+markers",
          name: payload.current_series_name || "Current",
          x,
          y: current,
          line: { color: theme.current, width: 3 },
          marker: { size: 6 },
          customdata: custom,
          hovertemplate: `<b>%{x}</b><br>${payload.current_series_name || "Current"}: %{y:${valueFormat}}${valueSuffix}<br>${payload.previous_series_name || "Previous"}: %{customdata[0]:${valueFormat}}${valueSuffix}<br>Delta: %{customdata[1]:+.2f}%<extra></extra>`,
        }
      : {
          type: "bar",
          name: payload.current_series_name || "Current",
          x,
          y: current,
          marker: { color: theme.current },
          customdata: custom,
          hovertemplate: `<b>%{x}</b><br>${payload.current_series_name || "Current"}: %{y:${valueFormat}}${valueSuffix}<br>${payload.previous_series_name || "Previous"}: %{customdata[0]:${valueFormat}}${valueSuffix}<br>Delta: %{customdata[1]:+.2f}%<extra></extra>`,
        };

  const previousTrace =
    payload.previous_trace_style === "bar"
      ? {
          type: "bar",
          name: payload.previous_series_name || "Previous",
          x,
          y: previous,
          marker: { color: `${theme.previous}b8` },
          hovertemplate: `<b>%{x}</b><br>${payload.previous_series_name || "Previous"}: %{y:${valueFormat}}${valueSuffix}<extra></extra>`,
        }
      : {
          type: "scatter",
          mode: "lines+markers",
          name: payload.previous_series_name || "Previous",
          x,
          y: previous,
          line: { color: theme.previous, width: 2, dash: "dot" },
          marker: { size: 5 },
          hovertemplate: `<b>%{x}</b><br>${payload.previous_series_name || "Previous"}: %{y:${valueFormat}}${valueSuffix}<extra></extra>`,
        };

  const anomalyPoints = trendData.filter((point) => point.is_anomaly);
  const shiftPoints = trendData.filter((point) => point.is_structural_shift);
  const traces = [currentTrace, previousTrace];
  if (anomalyPoints.length) {
    traces.push({
      type: "scatter",
      mode: "markers",
      name: "Anomaly",
      x: anomalyPoints.map((point) => point.period_label),
      y: anomalyPoints.map((point) => point.current_value),
      marker: {
        size: 11,
        color: "#ff8a5b",
        symbol: "diamond",
        line: { color: "#ffe0d2", width: 1.2 },
      },
      customdata: anomalyPoints.map((point) => [
        point.baseline_value,
        point.anomaly_score,
      ]),
      hovertemplate: `<b>%{x}</b><br>Current: %{y:${valueFormat}}${valueSuffix}<br>Trailing Baseline: %{customdata[0]:${valueFormat}}${valueSuffix}<br>Robust Z-Score: %{customdata[1]:+.2f}<extra></extra>`,
    });
  }
  if (shiftPoints.length) {
    traces.push({
      type: "scatter",
      mode: "markers",
      name: "Structural Shift",
      x: shiftPoints.map((point) => point.period_label),
      y: shiftPoints.map((point) => point.current_value),
      marker: {
        size: 12,
        color: shiftPoints.map((point) =>
          point.shift_direction === "Downward shift"
            ? theme.danger
            : theme.positive,
        ),
        symbol: shiftPoints.map((point) =>
          point.shift_direction === "Downward shift"
            ? "triangle-down"
            : "triangle-up",
        ),
        line: { color: "#dce9ff", width: 1.2 },
      },
      customdata: shiftPoints.map((point) => [
        point.shift_direction,
        point.shift_score,
      ]),
      hovertemplate: `<b>%{x}</b><br>%{customdata[0]}<br>Current: %{y:${valueFormat}}${valueSuffix}<br>Shift Score: %{customdata[1]:.2f}<extra></extra>`,
    });
  }

  Plotly.react(
    plotEl,
    traces,
    basePlotLayout({
      xTitle: payload.trend_x_title,
      yTitle: payload.trend_y_title,
      metricFormat: payload.trend_metric_format,
      plotEl,
      extra: {
        margin: density.compact
          ? {
              l: density.tight ? 58 : 68,
              r: 18,
              t: 22,
              b: density.tight ? 102 : 112,
            }
          : { l: 86, r: 24, t: 26, b: 84 },
        barmode:
          payload.current_trace_style === "bar" &&
          payload.previous_trace_style === "bar"
            ? "group"
            : undefined,
        xaxis: {
          title: {
            text: density.tight ? "" : payload.trend_x_title,
            standoff: 12,
          },
          color: theme.text,
          tickangle: xTickAngle,
          automargin: true,
          tickfont: { size: density.tight ? 10 : 11 },
          nticks: xTickCount,
          gridcolor: theme.grid,
        },
      },
    }),
    { responsive: true, displaylogo: false },
  );

  bindPrimaryInteractions(plotEl, payload, {
    ...options,
    renderedTrendData: trendData,
  });
}

function renderSecondaryPlot(
  plotEl,
  chartPayload,
  pageKey,
  detailPanel,
  options = {},
) {
  if (!plotEl || typeof Plotly === "undefined") return;
  if (!chartPayload || !chartPayload.points?.length) {
    purgePlot(plotEl);
    return;
  }
  const theme = themeConfig();
  const density = plotDensity(plotEl);
  const x = chartPayload.points.map((point) => point.label);
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
  const { valueFormat, valueSuffix } = metricPresentation(
    chartPayload.metric_format,
  );

  if (chartPayload.analysis_mode === "donut") {
    Plotly.react(
      plotEl,
      [
        {
          type: "pie",
          hole: 0.56,
          labels: x,
          values: chartPayload.points.map((point) => point.share_pct ?? 0),
          customdata: custom,
          marker: {
            colors: [theme.current, theme.previous, theme.positive, "#9b8cf3"],
          },
          sort: false,
          textinfo: density.compact ? "percent" : "label+percent",
          hovertemplate: `<b>%{label}</b><br>Revenue Share: %{percent}<br>Current Revenue: %{customdata[0]:${valueFormat}}${valueSuffix}<br>Previous Revenue: %{customdata[1]:${valueFormat}}${valueSuffix}<br>Delta: %{customdata[2]:+.2f}%<extra></extra>`,
        },
      ],
      {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: theme.plotBg,
        margin: density.compact
          ? { l: 10, r: 10, t: 18, b: 58 }
          : { l: 24, r: 24, t: 24, b: 24 },
        legend: density.compact
          ? {
              orientation: "h",
              x: 0,
              y: -0.1,
              xanchor: "left",
              yanchor: "top",
              font: { color: theme.text, size: density.tight ? 10 : 11 },
            }
          : {
              orientation: "h",
              x: 0.5,
              y: 1.12,
              xanchor: "center",
              yanchor: "top",
              font: { color: theme.text },
            },
      },
      { responsive: true, displaylogo: false },
    );
  } else if (chartPayload.analysis_mode === "pareto") {
    Plotly.react(
      plotEl,
      [
        {
          type: "bar",
          name: chartPayload.current_series_name,
          x,
          y: current,
          marker: { color: theme.current },
          customdata: custom,
          hovertemplate: `<b>%{customdata[3]}</b><br>Revenue: %{y:${valueFormat}}${valueSuffix}<br>Share: %{customdata[4]:.2f}%<br>Cumulative: %{customdata[7]:.2f}%<br>ABC Class: %{customdata[8]}<extra></extra>`,
        },
        {
          type: "scatter",
          mode: "lines+markers",
          name: chartPayload.cumulative_series_name || "Cumulative Share",
          x,
          y: chartPayload.points.map((point) => point.cumulative_pct || 0),
          yaxis: "y2",
          line: { color: theme.accent, width: 3 },
          marker: { size: 7, color: theme.accent },
          customdata: custom,
          hovertemplate:
            "<b>%{customdata[3]}</b><br>Cumulative Share: %{y:.2f}%<br>ABC Class: %{customdata[8]}<extra></extra>",
        },
      ],
      basePlotLayout({
        xTitle: chartPayload.x_title,
        yTitle: chartPayload.y_title,
        metricFormat: chartPayload.metric_format,
        plotEl,
        showLegend: !density.compact,
        extra: {
          margin: density.compact
            ? {
                l: density.tight ? 54 : 64,
                r: density.tight ? 44 : 52,
                t: 14,
                b: density.tight ? 118 : 132,
              }
            : { l: 86, r: 78, t: 24, b: 92 },
          xaxis: {
            title: {
              text: density.tight ? "" : chartPayload.x_title,
              standoff: 12,
            },
            color: theme.text,
            tickangle: density.tight ? -34 : density.compact ? -28 : -24,
            automargin: true,
            tickfont: { size: density.tight ? 10 : 11 },
            gridcolor: theme.grid,
          },
          yaxis2: {
            title: {
              text: density.tight
                ? ""
                : chartPayload.cumulative_y_title || "Cumulative Share",
              standoff: 12,
            },
            overlaying: "y",
            side: "right",
            range: [0, 100],
            color: theme.accent,
            tickfont: { size: density.tight ? 10 : 11 },
            tickformat: ".0f",
            ticksuffix: "%",
            zeroline: false,
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
              line: { color: `${theme.accent}66`, width: 1.5, dash: "dash" },
            },
          ],
        },
      }),
      { responsive: true, displaylogo: false },
    );
  } else {
    Plotly.react(
      plotEl,
      [
        chartPayload.current_trace_style === "line"
          ? {
              type: "scatter",
              mode: "lines+markers",
              name: chartPayload.current_series_name,
              x,
              y: current,
              line: { color: theme.current, width: 3 },
              marker: { size: 6 },
              customdata: custom,
              hovertemplate: `<b>%{customdata[3]}</b><br>${chartPayload.current_series_name}: %{y:${valueFormat}}${valueSuffix}<br>${chartPayload.previous_series_name}: %{customdata[1]:${valueFormat}}${valueSuffix}<br>Delta: %{customdata[2]:+.2f}%<extra></extra>`,
            }
          : {
              type: "bar",
              name: chartPayload.current_series_name,
              x,
              y: current,
              marker: { color: theme.current },
              customdata: custom,
              hovertemplate: `<b>%{customdata[3]}</b><br>${chartPayload.current_series_name}: %{y:${valueFormat}}${valueSuffix}<br>${chartPayload.previous_series_name}: %{customdata[1]:${valueFormat}}${valueSuffix}<br>Delta: %{customdata[2]:+.2f}%<extra></extra>`,
            },
        chartPayload.previous_trace_style === "line"
          ? {
              type: "scatter",
              mode: "lines+markers",
              name: chartPayload.previous_series_name,
              x,
              y: previous,
              line: { color: theme.previous, width: 2, dash: "dot" },
              marker: { size: 5 },
              customdata: custom,
              hovertemplate: `<b>%{customdata[3]}</b><br>${chartPayload.previous_series_name}: %{y:${valueFormat}}${valueSuffix}<extra></extra>`,
            }
          : {
              type: "bar",
              name: chartPayload.previous_series_name,
              x,
              y: previous,
              marker: { color: `${theme.previous}b5` },
              customdata: custom,
              hovertemplate: `<b>%{customdata[3]}</b><br>${chartPayload.previous_series_name}: %{y:${valueFormat}}${valueSuffix}<extra></extra>`,
            },
      ],
      basePlotLayout({
        xTitle: chartPayload.x_title,
        yTitle: chartPayload.y_title,
        metricFormat: chartPayload.metric_format,
        plotEl,
        showLegend: !density.compact,
        extra: {
          margin: density.compact
            ? {
                l: density.tight ? 54 : 64,
                r: 18,
                t: 16,
                b: density.tight ? 110 : 122,
              }
            : undefined,
          barmode:
            chartPayload.current_trace_style === "bar" &&
            chartPayload.previous_trace_style === "bar"
              ? "group"
              : undefined,
          xaxis: {
            title: {
              text: density.tight ? "" : chartPayload.x_title,
              standoff: 12,
            },
            color: theme.text,
            tickangle: density.tight ? -34 : density.compact ? -28 : -24,
            automargin: true,
            tickfont: { size: density.tight ? 10 : 11 },
            gridcolor: theme.grid,
          },
        },
      }),
      { responsive: true, displaylogo: false },
    );
  }

  if (typeof plotEl.removeAllListeners === "function")
    plotEl.removeAllListeners("plotly_click");
  if (
    chartPayload.interaction_type === "detail" &&
    chartPayload.interaction_key &&
    detailPanel
  ) {
    plotEl.style.cursor = "pointer";
    plotEl.on("plotly_click", (eventData) => {
      const point = eventData?.points?.[0];
      if (!point) return;
      const selectedPoint = chartPayload.points[point.pointIndex];
      const rawLabel = selectedPoint?.raw_label || selectedPoint?.label;
      if (!rawLabel) return;
      loadDetailPanel(
        pageKey,
        chartPayload.interaction_key,
        rawLabel,
        detailPanel,
        options.filtersOverride || null,
      );
    });
  } else {
    plotEl.style.cursor = "default";
  }
}

async function loadDetailPanel(
  pageKey,
  interactionKey,
  interactionValue,
  detailPanel,
  filtersOverride = null,
) {
  if (!detailPanel?.panel || !interactionKey || !interactionValue) return;
  detailPanel.panel.classList.remove("hidden");
  detailPanel.title.textContent = "Loading detail...";
  detailPanel.subtitle.textContent = "";
  detailPanel.table.innerHTML = renderStateCard({
    title: "Loading detail",
    message: "Pulling the records for this selection.",
    stateType: "loading",
  });
  if (detailPanel.spotlightButton)
    detailPanel.spotlightButton.classList.add("hidden");
  detailPanel.panel.dataset.interactionKey = interactionKey;
  detailPanel.panel.dataset.interactionValue = interactionValue;
  const interactionLabel = String(interactionKey || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
  const detailBreadcrumb = `${pageByKey(pageKey)?.windowLabel || pageKey} / ${interactionLabel} / ${interactionValue}`;
  if (detailPanel.breadcrumbEl) {
    detailPanel.breadcrumbEl.textContent = detailBreadcrumb;
    detailPanel.breadcrumbEl.classList.remove("hidden");
  }

  try {
    const url = filtersOverride
      ? buildDetailUrlForFilters(
          pageKey,
          filtersOverride,
          interactionKey,
          interactionValue,
        )
      : buildDetailUrl(pageKey, interactionKey, interactionValue);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const payload = await response.json();
    detailPanel.lastPayload = payload;
    detailPanel.title.textContent = payload.title || "Detail";
    detailPanel.subtitle.textContent = payload.subtitle || "";
    detailPanel.panel.dataset.detailTitle = payload.title || "";
    detailPanel.panel.dataset.detailSubtitle = payload.subtitle || "";
    detailPanel.table.innerHTML = buildTableHtml(payload.table);
    bindTableInteractions(
      detailPanel.table,
      pageKey,
      detailPanel,
      filtersOverride,
    );
    if (detailPanel.spotlightButton)
      detailPanel.spotlightButton.classList.remove("hidden");
    if (detailPanel.exportButton)
      detailPanel.exportButton.classList.remove("hidden");
    if (detailPanel.exportButton) {
      detailPanel.exportButton.onclick = () => {
        const columns = payload.table?.columns || [];
        const dataRows = payload.table?.rows || [];
        if (!columns.length || !dataRows.length) return;
        const rows = [columns.map((column) => column.label)];
        dataRows.forEach((row) => {
          rows.push(columns.map((column) => row.values?.[column.key] ?? ""));
        });
        downloadCsv(
          `${slugify(pageKey)}-${slugify(interactionValue)}-detail.csv`,
          rows,
        );
      };
    }
  } catch (error) {
    detailPanel.title.textContent = "Failed to load detail";
    detailPanel.subtitle.textContent = "";
    detailPanel.table.innerHTML = renderStateCard({
      title: "Detail unavailable",
      message: error.message,
      stateType: "error",
    });
    if (detailPanel.exportButton)
      detailPanel.exportButton.classList.add("hidden");
  }
}

function renderWindowError(win, title, message) {
  const statusEl = win.querySelector('[data-role="status"]');
  if (statusEl) statusEl.textContent = message;
  const contentEl = win.querySelector(".window-content");
  if (!contentEl) return;
  contentEl.innerHTML = `<div class="lab-shell">${renderStateCard({
    title,
    message,
    stateType: "error",
  })}</div>`;
}

function windowRefs(win) {
  return {
    cards: win.querySelector('[data-role="cards"]'),
    narrative: win.querySelector('[data-role="narrative"]'),
    annotations: win.querySelector('[data-role="annotations"]'),
    breadcrumb: win.querySelector('[data-role="breadcrumb"]'),
    primaryTitle: win.querySelector('[data-role="primary-title"]'),
    primaryMeta: win.querySelector('[data-role="primary-meta"]'),
    primaryBack: win.querySelector('[data-action="primary-back"]'),
    primaryPlot: win.querySelector('[data-role="primary-plot"]'),
    secondaryPanel: win.querySelector('[data-role="secondary-panel"]'),
    secondaryTitle: win.querySelector('[data-role="secondary-title"]'),
    secondaryMeta: win.querySelector('[data-role="secondary-meta"]'),
    secondaryPlot: win.querySelector('[data-role="secondary-plot"]'),
    tablePanel: win.querySelector('[data-role="table-panel"]'),
    tableTitle: win.querySelector('[data-role="table-title"]'),
    tableMeta: win.querySelector('[data-role="table-meta"]'),
    table: win.querySelector('[data-role="table-body"]'),
    detailPanel: {
      panel: win.querySelector('[data-role="detail-panel"]'),
      breadcrumbEl: win.querySelector('[data-role="detail-breadcrumb"]'),
      title: win.querySelector('[data-role="detail-title"]'),
      subtitle: win.querySelector('[data-role="detail-subtitle"]'),
      table: win.querySelector('[data-role="detail-table"]'),
      spotlightButton: win.querySelector('[data-spotlight-action="detail"]'),
      exportButton: win.querySelector('[data-action="detail-export"]'),
    },
    status: win.querySelector('[data-role="status"]'),
  };
}

function renderWindow(win, payload) {
  const refs = windowRefs(win);
  win._payload = payload;
  win.dataset.loadedPage = payload.page;
  refs.status.textContent = `${payload.title} loaded | ${payload.start_date} -> ${payload.end_date}`;
  refs.cards.innerHTML = renderCards(payload.cards || []);
  observeCardValueFit(refs.cards);
  refs.narrative.innerHTML = renderNarrative(payload);
  refs.annotations.innerHTML = renderAnnotations(payload.page);
  const breadcrumb =
    payload.page === "sales" && payload.view_mode === "drilldown"
      ? `Sales Overview / ${payload.trend_title || win.dataset.drilldownPeriodKey || "Drilldown"}`
      : "";
  refs.breadcrumb.textContent = breadcrumb;
  refs.breadcrumb.classList.toggle("hidden", !breadcrumb);
  refs.primaryTitle.textContent =
    payload.primary_heatmap?.title || payload.trend_title || payload.title;
  refs.primaryMeta.textContent = payload.comparison_rule || "";
  refs.primaryBack.classList.toggle(
    "hidden",
    !(payload.page === "sales" && payload.view_mode === "drilldown"),
  );
  refs.primaryBack.onclick = () => {
    delete win.dataset.drilldownPeriodKey;
    loadPageWindow(win.dataset.pageKey, true);
  };
  renderPrimaryPlot(refs.primaryPlot, payload, {
    onPrimarySelect: (selectedPoint) => {
      win.dataset.drilldownPeriodKey = selectedPoint.period_key;
      loadPageWindow(win.dataset.pageKey, true);
    },
  });

  if (payload.secondary_chart?.points?.length) {
    refs.secondaryPanel.classList.remove("hidden");
    refs.secondaryTitle.textContent = payload.secondary_chart.title;
    refs.secondaryMeta.textContent =
      payload.secondary_chart.interaction_label || "";
    renderSecondaryPlot(
      refs.secondaryPlot,
      payload.secondary_chart,
      payload.page,
      refs.detailPanel,
    );
  } else {
    refs.secondaryPanel.classList.add("hidden");
    purgePlot(refs.secondaryPlot);
  }

  if (payload.detail_table?.rows?.length) {
    refs.tablePanel.classList.remove("hidden");
    refs.tableTitle.textContent = payload.detail_table.title;
    refs.tableMeta.textContent =
      payload.detail_hint || "Inspect the ranked detail inside this slice.";
    refs.table.innerHTML = buildTableHtml(payload.detail_table, 10);
    bindTableInteractions(refs.table, payload.page, refs.detailPanel);
  } else {
    refs.tablePanel.classList.add("hidden");
    refs.table.innerHTML = "";
  }

  refs.detailPanel.panel.classList.add("hidden");
  refs.detailPanel.panel.dataset.interactionKey = "";
  refs.detailPanel.panel.dataset.interactionValue = "";
  refs.detailPanel.spotlightButton?.classList.add("hidden");
  refs.detailPanel.exportButton?.classList.add("hidden");
  refs.detailPanel.breadcrumbEl?.classList.add("hidden");
  if (refs.detailPanel.breadcrumbEl)
    refs.detailPanel.breadcrumbEl.textContent = "";
  if (refs.detailPanel.exportButton)
    refs.detailPanel.exportButton.onclick = null;

  bindWindowSpotlightActions(win, payload);
}

function renderSourceHealthCards(cards) {
  return (cards || [])
    .map(
      (card) => `
        <article class="lab-card source-health-card source-health-card--${escapeHtml(card.status || "neutral")}">
          <div class="lab-card-head">
            <p class="lab-card-title">${escapeHtml(card.title)}</p>
            <span class="source-health-status">${escapeHtml(card.status || "neutral")}</span>
          </div>
          <p class="lab-card-value">${escapeHtml(card.value)}</p>
          <div class="lab-card-meta"><span>${escapeHtml(card.subtitle)}</span></div>
        </article>
      `,
    )
    .join("");
}

function renderSourceHealthWindow(win, payload) {
  const refs = windowRefs(win);
  win._payload = payload;
  win.dataset.loadedPage = "source_health";
  if (refs.status) {
    refs.status.textContent =
      payload.status === "ok"
        ? `Source Health loaded | ${payload.generated_at || ""}`
        : "Source Health unavailable";
  }

  refs.cards.innerHTML = renderSourceHealthCards(payload.cards || []);
  observeCardValueFit(refs.cards);
  refs.narrative.innerHTML = renderNarrative({
    summary: payload.summary || [],
    insight_note: payload.subtitle,
  });
  refs.annotations.innerHTML = renderAnnotations("source_health");
  refs.breadcrumb.classList.add("hidden");
  refs.primaryTitle.textContent =
    payload.loads_table?.title || "Latest Source Loads";
  refs.primaryMeta.textContent = "Latest batch per registered source";
  refs.primaryBack.classList.add("hidden");
  refs.primaryBack.onclick = null;
  purgePlot(refs.primaryPlot);
  refs.primaryPlot.innerHTML = buildTableHtml(payload.loads_table, null);

  refs.secondaryPanel.classList.add("hidden");
  purgePlot(refs.secondaryPlot);

  refs.tablePanel.classList.remove("hidden");
  refs.tableTitle.textContent =
    payload.profile_table?.title || "Source Profiling Results";
  refs.tableMeta.textContent = "Row count, duplicate-key and null profiling";
  refs.table.innerHTML = buildTableHtml(payload.profile_table, 40);

  refs.detailPanel.panel.classList.add("hidden");
  refs.detailPanel.panel.dataset.interactionKey = "";
  refs.detailPanel.panel.dataset.interactionValue = "";
  refs.detailPanel.spotlightButton?.classList.add("hidden");
  refs.detailPanel.exportButton?.classList.add("hidden");
  refs.detailPanel.breadcrumbEl?.classList.add("hidden");

  win
    .querySelectorAll(".spotlight-button, [data-action='compare']")
    .forEach((button) => button.classList.add("hidden"));
}

function formatSourceCount(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number.toLocaleString("en-US") : "0";
}

function dataCenterSources(payload) {
  const sources = Array.isArray(payload?.sources) ? payload.sources.slice() : [];
  state.sourceDrafts.forEach((draft) => sources.unshift(draft));
  if (state.localFilePreview) {
    const analysis = state.localFilePreview.analysis || {};
    sources.unshift({
      name: state.localFilePreview.id,
      label: state.localFilePreview.name,
      source_type: state.localFilePreview.type,
      type_label: state.localFilePreview.typeLabel,
      connection_group: "Local file",
      target: "Workspace preview",
      load_mode: "Preview",
      primary_key:
        analysis.mappingRows?.find((row) => row.role === "Entity ID")?.column ||
        state.localFilePreview.columns?.[0] ||
        "",
      grain: analysis.datasetKind?.label || "Rows detected in selected file",
      business_purpose:
        analysis.importNote ||
        "Local file selected from this browser session for inspection before governed loading.",
      columns: state.localFilePreview.columns || [],
      row_count: state.localFilePreview.rowCount || 0,
      duplicate_key_count: analysis.quality?.duplicateCount || 0,
      loaded_at: "This session",
      status: "loaded",
      status_label: "Analyzed Preview",
      local: true,
    });
  }
  return sources;
}

function renderDataCenterCards(payload) {
  const sources = dataCenterSources(payload);
  const connected = sources.filter((source) => sourceConnected(source.name));
  const rows = connected.reduce(
    (total, source) => total + Number(source.row_count || 0),
    0,
  );
  const fileSources = connected.filter(
    (source) => source.connection_group === "File" || source.local,
  ).length;
  return renderSourceHealthCards([
    {
      key: "available_sources",
      title: "Available Sources",
      value: String(sources.length),
      subtitle: "Sources visible in this workspace",
      status: sources.length ? "ok" : "warning",
    },
    {
      key: "connected_sources",
      title: "Connected",
      value: String(connected.length),
      subtitle: "Enabled for this session",
      status: connected.length ? "ok" : "warning",
    },
    {
      key: "connected_rows",
      title: "Rows Ready",
      value: formatSourceCount(rows),
      subtitle: "Loaded or previewed rows",
      status: rows ? "ok" : "neutral",
    },
    {
      key: "file_sources",
      title: "Files",
      value: String(fileSources),
      subtitle: "CSV/JSON sources in the workspace",
      status: fileSources ? "ok" : "neutral",
    },
  ]);
}

function renderDataSourceCards(payload) {
  const sources = dataCenterSources(payload);
  if (!sources.length)
    return renderStateCard({
      title: "No sources registered",
      message: "Add CSV, JSON, or application sources to the source registry.",
      stateType: "empty",
    });
  return `
    <div class="data-source-grid">
      ${sources
        .map((source) => {
          const connected = sourceConnected(source.name);
          const columns = Array.isArray(source.columns) ? source.columns : [];
          return `
            <article class="data-source-card ${connected ? "is-on" : "is-off"}">
              <div class="data-source-head">
                <div>
                  <strong>${escapeHtml(source.label || source.name)}</strong>
                  <span>${escapeHtml(source.target || "Workspace source")}</span>
                </div>
                <span class="data-source-status ${connected ? "is-on" : "is-off"}">${connected ? "Connected" : "Off"}</span>
              </div>
              <div class="data-source-badges">
                <span class="data-source-badge">${escapeHtml(source.type_label || source.source_type || "Source")}</span>
                <span class="data-source-badge">${escapeHtml(source.load_mode || "Managed")}</span>
                <span class="data-source-badge">${escapeHtml(connected ? source.status_label || source.status || "Connected" : "Available")}</span>
              </div>
              <div class="data-source-metrics">
                <span><b>${escapeHtml(formatSourceCount(source.row_count))}</b> rows</span>
                <span><b>${escapeHtml(formatSourceCount(source.duplicate_key_count))}</b> duplicates</span>
                <span><b>${escapeHtml(String(columns.length))}</b> fields</span>
              </div>
              <p class="data-source-purpose">${escapeHtml(source.business_purpose || source.grain || "Available for workspace analysis.")}</p>
              <div class="data-source-actions">
                <button class="toolbar-button toolbar-button--micro" type="button" data-source-toggle="${escapeHtml(source.name)}">${connected ? "Disconnect" : "Connect"}</button>
                ${
                  source.local
                    ? `<button class="toolbar-button toolbar-button--micro" type="button" data-action="open-imported-analysis" data-import-id="${escapeHtml(source.name)}">Analyze</button>`
                    : ""
                }
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function dataSourceTablePayload(payload) {
  return {
    title: "Workspace Source Selection",
    columns: [
      { key: "source", label: "Source" },
      { key: "status", label: "Status" },
      { key: "type", label: "Type" },
      { key: "rows", label: "Rows" },
      { key: "target", label: "Target" },
      { key: "fields", label: "Fields" },
    ],
    rows: dataCenterSources(payload).map((source) => ({
      values: {
        source: source.label || source.name,
        status: sourceConnected(source.name) ? "Connected" : "Off",
        type: source.type_label || source.source_type || "Source",
        rows: formatSourceCount(source.row_count),
        target: source.target || "Workspace",
        fields: Array.isArray(source.columns)
          ? source.columns.slice(0, 6).join(", ")
          : "",
      },
    })),
  };
}

function localPreviewTablePayload() {
  const preview = state.localFilePreview;
  if (!preview) return null;
  return {
    title: `${preview.name} preview`,
    columns: preview.columns.map((column) => ({ key: column, label: column })),
    rows: preview.rows.map((row) => ({ values: row })),
  };
}

function renderDataFilePreview() {
  const preview = state.localFilePreview;
  const tablePayload = localPreviewTablePayload();
  const analysis = preview?.analysis || {};
  const quality = analysis.quality || {};
  return `
    ${
      preview
        ? `<div class="data-preview-summary">
            <strong>${escapeHtml(preview.name)}</strong>
            <span>${escapeHtml(formatSourceCount(preview.rowCount))} rows detected across ${escapeHtml(String(preview.columns.length))} fields. Detected as ${escapeHtml(analysis.datasetKind?.label || "Imported table")} with ${escapeHtml(String(quality.qualityScore ?? "-"))}/100 preview quality.</span>
            <div class="data-preview-actions">
              <button class="toolbar-button toolbar-button--micro" type="button" data-action="open-imported-analysis" data-import-id="${escapeHtml(preview.id)}">Open analysis</button>
              <button class="toolbar-button toolbar-button--micro" type="button" data-action="clear-local-preview">Remove preview</button>
            </div>
          </div>
          ${buildTableHtml(tablePayload, 6)}`
        : `<div class="data-file-drop">
            <strong>No local file selected</strong>
            <span>Use CSV File or JSON File in the connector library. The app profiles, maps, and opens an import analysis automatically.</span>
          </div>`
    }
  `;
}

function connectorByKey(key) {
  return CONNECTOR_OPTIONS.find((connector) => connector.key === key);
}

function renderConnectorSetup() {
  const connector = connectorByKey(state.activeConnectorSetup);
  if (!connector || connector.action !== "draft") return "";
  const isApi = connector.key === "rest_api";
  return `
    <form class="connector-setup" data-role="connector-setup" data-connector="${escapeHtml(connector.key)}">
      <div class="connector-setup-head">
        <strong>${escapeHtml(connector.title)} setup</strong>
        <span>No passwords or tokens are saved in this portfolio demo.</span>
      </div>
      <label>
        <span>Connection name</span>
        <input name="label" value="${escapeHtml(connector.title)}" autocomplete="off" />
      </label>
      <label>
        <span>${isApi ? "Endpoint URL" : "Host or database"}</span>
        <input name="location" placeholder="${isApi ? "https://api.company.com/accounts" : "analytics.company.local"}" autocomplete="off" />
      </label>
      <label>
        <span>${isApi ? "Records path" : "Schema.table"}</span>
        <input name="target" placeholder="${isApi ? "records" : "marts.fct_sales"}" autocomplete="off" />
      </label>
      <label>
        <span>Primary key</span>
        <input name="primaryKey" placeholder="${isApi ? "account_id" : "id"}" autocomplete="off" />
      </label>
      <div class="connector-setup-actions">
        <button class="toolbar-button toolbar-button--highlight" type="submit">Save draft</button>
        <button class="toolbar-button toolbar-button--micro" type="button" data-action="cancel-connector-setup">Cancel</button>
      </div>
    </form>
  `;
}

function renderConnectorLibrary(payload) {
  const registeredNames = new Set(
    (payload?.sources || []).map((source) => source.name),
  );
  return `
    <div class="connector-library">
      <div class="connector-library-head">
        <strong>Connector Library</strong>
        <span>Choose a source type; files preview immediately, databases and APIs become governed connection drafts.</span>
      </div>
      <input class="data-file-input" data-role="data-file-input" type="file" accept=".csv,.json,application/json,text/csv" />
      <div class="connector-grid">
        ${CONNECTOR_OPTIONS.map((connector) => {
          const registeredReady =
            connector.action !== "registered" ||
            registeredNames.has(connector.sourceName);
          return `
            <article class="connector-card ${registeredReady ? "" : "is-disabled"}">
              <div>
                <strong>${escapeHtml(connector.title)}</strong>
                <span>${escapeHtml(connector.type)}</span>
              </div>
              <p>${escapeHtml(connector.description)}</p>
              <button class="toolbar-button toolbar-button--micro" type="button" data-connector-action="${escapeHtml(connector.action)}" data-connector-key="${escapeHtml(connector.key)}" ${registeredReady ? "" : "disabled"}>
                ${connector.action === "file" ? "Choose" : connector.action === "draft" ? "Set up" : "Connect"}
              </button>
            </article>
          `;
        }).join("")}
      </div>
      ${renderConnectorSetup()}
      <div class="data-file-zone">
        ${renderDataFilePreview()}
      </div>
    </div>
  `;
}

function renderDataCenterWindow(win, payload) {
  const refs = windowRefs(win);
  win._payload = payload;
  win.dataset.loadedPage = "data_center";
  if (refs.status) {
    refs.status.textContent = `Data Center ready | ${payload.generated_at || ""}`;
  }

  refs.cards.innerHTML = renderDataCenterCards(payload);
  observeCardValueFit(refs.cards);
  refs.narrative.innerHTML = renderNarrative({
    summary: payload.summary || [],
    insight_note: payload.message || payload.subtitle,
  });
  refs.annotations.innerHTML = renderAnnotations("data_center");
  refs.breadcrumb.classList.add("hidden");

  refs.primaryTitle.textContent = "Source Connections";
  refs.primaryMeta.textContent = "Choose which sources are active in this workspace";
  refs.primaryBack.classList.add("hidden");
  refs.primaryBack.onclick = null;
  purgePlot(refs.primaryPlot);
  refs.primaryPlot.innerHTML = renderDataSourceCards(payload);

  refs.secondaryPanel.classList.remove("hidden");
  refs.secondaryTitle.textContent = "Add Source";
  refs.secondaryMeta.textContent = "Connector options inside the workspace";
  purgePlot(refs.secondaryPlot);
  refs.secondaryPlot.innerHTML = renderConnectorLibrary(payload);

  refs.tablePanel.classList.remove("hidden");
  refs.tableTitle.textContent = "Selected Sources";
  refs.tableMeta.textContent = "Current workspace source state";
  refs.table.innerHTML = buildTableHtml(dataSourceTablePayload(payload), 20);

  refs.detailPanel.panel.classList.add("hidden");
  refs.detailPanel.panel.dataset.interactionKey = "";
  refs.detailPanel.panel.dataset.interactionValue = "";
  refs.detailPanel.spotlightButton?.classList.add("hidden");
  refs.detailPanel.exportButton?.classList.add("hidden");
  refs.detailPanel.breadcrumbEl?.classList.add("hidden");

  win
    .querySelectorAll(".spotlight-button, [data-action='compare']")
    .forEach((button) => button.classList.add("hidden"));
  bindDataCenterInteractions(win, payload);
}

function parseCsvText(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      i += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(value.trim());
      value = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
      continue;
    }
    value += char;
  }
  row.push(value.trim());
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
}

function normalizeImportedHeaders(headers) {
  const seen = new Map();
  return headers.map((header, index) => {
    const raw = String(header ?? "").trim();
    const fallback = `field_${index + 1}`;
    const base = raw || fallback;
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count ? `${base}_${count + 1}` : base;
  });
}

function recordsFromMatrixRows(matrixRows) {
  const rows = Array.isArray(matrixRows) ? matrixRows.slice() : [];
  const headers = normalizeImportedHeaders(rows.shift() || []);
  const records = rows
    .filter((row) => Array.isArray(row) && row.some((cell) => String(cell ?? "").trim()))
    .map((row) =>
      Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])),
    );
  return { columns: headers, records };
}

function parseCsvRecords(text) {
  if (window.Papa?.parse) {
    const result = window.Papa.parse(text, {
      skipEmptyLines: "greedy",
      dynamicTyping: false,
    });
    const parsed = recordsFromMatrixRows(result.data || []);
    return { ...parsed, parserName: "Papa Parse" };
  }
  return { ...recordsFromMatrixRows(parseCsvText(text)), parserName: "Local CSV parser" };
}

function serializeImportedCell(value) {
  if (value == null) return "";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch (_) {
      return String(value);
    }
  }
  return String(value);
}

function normalizeImportedRecord(record, columns) {
  return Object.fromEntries(
    columns.map((column) => [column, serializeImportedCell(record?.[column])]),
  );
}

function compactImportedRecords(records, columns, limit = 12) {
  return records.slice(0, limit).map((record) => normalizeImportedRecord(record, columns));
}

function normalizedColumnName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizedColumnTokens(value) {
  return normalizedColumnName(value).split("_").filter(Boolean);
}

function hasNamePart(profile, parts) {
  const normalized = profile.normalized || "";
  const tokens = profile.tokens || [];
  return parts.some((part) => tokens.includes(part) || normalized.includes(part));
}

function isBlankImportedValue(value) {
  return String(value ?? "").trim() === "";
}

function parseNumberLike(value) {
  const raw = serializeImportedCell(value).trim();
  if (!raw) return null;
  const negative = raw.startsWith("(") && raw.endsWith(")");
  let cleaned = raw.replace(/[^\d,.\-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === "." || cleaned === ",")
    return null;
  const comma = cleaned.lastIndexOf(",");
  const dot = cleaned.lastIndexOf(".");
  if (comma >= 0 && dot >= 0) {
    cleaned =
      comma > dot
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
  } else if (comma >= 0) {
    const decimalPlaces = cleaned.length - comma - 1;
    cleaned =
      decimalPlaces > 0 && decimalPlaces <= 2
        ? cleaned.replace(",", ".")
        : cleaned.replace(/,/g, "");
  }
  const number = Number(cleaned);
  if (!Number.isFinite(number)) return null;
  return negative ? -Math.abs(number) : number;
}

function parseDateLike(value) {
  const raw = serializeImportedCell(value).trim();
  if (!raw) return null;
  const iso = raw.match(/^(\d{4})[-/](\d{1,2})(?:[-/](\d{1,2}))?/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3] || 1);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    )
      return date;
  }
  const local = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (local) {
    const first = Number(local[1]);
    const second = Number(local[2]);
    const year = Number(local[3].length === 2 ? `20${local[3]}` : local[3]);
    const day = first > 12 ? first : second > 12 ? second : first;
    const month = first > 12 ? second : second > 12 ? first : second;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    )
      return date;
  }
  const parsed = Date.parse(raw);
  if (!Number.isNaN(parsed)) return new Date(parsed);
  return null;
}

function parseBooleanLike(value) {
  const raw = serializeImportedCell(value).trim().toLowerCase();
  if (!raw) return null;
  if (["true", "false", "yes", "no", "y", "n", "1", "0"].includes(raw))
    return raw;
  return null;
}

function inferImportedColumnRole(profile) {
  if (profile.type === "date" || hasNamePart(profile, ["date", "month", "period", "created", "updated", "closed", "paid"]))
    return "date";
  if (
    hasNamePart(profile, [
      "amount",
      "revenue",
      "sales",
      "total",
      "price",
      "spend",
      "cost",
      "billed",
      "billing",
      "invoice",
      "payment",
      "profit",
      "margin",
      "value",
    ])
  )
    return "amount";
  if (hasNamePart(profile, ["quantity", "qty", "units", "count", "score"]))
    return "measure";
  if (
    profile.tokens.includes("id") ||
    profile.normalized.endsWith("_id") ||
    hasNamePart(profile, ["uuid", "key", "sku", "order_id", "customer_id", "account_id", "ticket_id"])
  )
    return "id";
  if (hasNamePart(profile, ["status", "stage", "state"])) return "status";
  if (hasNamePart(profile, ["email", "mail"])) return "email";
  if (
    hasNamePart(profile, [
      "customer",
      "account",
      "client",
      "company",
      "product",
      "item",
      "campaign",
      "supplier",
      "vendor",
    ])
  )
    return "entity";
  if (
    hasNamePart(profile, [
      "category",
      "segment",
      "channel",
      "city",
      "country",
      "region",
      "type",
      "tier",
      "priority",
      "source",
    ])
  )
    return "category";
  if (profile.type === "category") return "category";
  if (profile.type === "number") return "measure";
  if (profile.type === "boolean") return "status";
  return "text";
}

function inferImportedColumnProfile(column, records) {
  const values = records.map((record) => serializeImportedCell(record?.[column]));
  const nonBlank = values.filter((value) => !isBlankImportedValue(value));
  const normalized = normalizedColumnName(column);
  const tokens = normalizedColumnTokens(column);
  const uniqueValues = new Set(nonBlank.map((value) => value.trim()));
  const sample = Array.from(uniqueValues).slice(0, 3);
  const numericValues = nonBlank
    .map(parseNumberLike)
    .filter((value) => value != null);
  const dateValues = nonBlank.map(parseDateLike).filter(Boolean);
  const booleanValues = nonBlank
    .map(parseBooleanLike)
    .filter((value) => value != null);
  const tested = Math.max(nonBlank.length, 1);
  const numberRatio = numericValues.length / tested;
  const dateRatio = dateValues.length / tested;
  const booleanRatio = booleanValues.length / tested;
  let type = "text";
  if (nonBlank.length === 0) type = "empty";
  else if (dateRatio >= 0.72 && numericValues.length !== nonBlank.length)
    type = "date";
  else if (numberRatio >= 0.78) type = "number";
  else if (booleanRatio >= 0.9) type = "boolean";
  else if (uniqueValues.size <= Math.max(12, Math.ceil(nonBlank.length * 0.18)))
    type = "category";
  const profile = {
    column,
    normalized,
    tokens,
    type,
    rowCount: records.length,
    nonBlankCount: nonBlank.length,
    nullCount: values.length - nonBlank.length,
    uniqueCount: uniqueValues.size,
    uniqueRatio: nonBlank.length ? uniqueValues.size / nonBlank.length : 0,
    completeness: records.length ? nonBlank.length / records.length : 0,
    sample,
    numericMin: numericValues.length ? Math.min(...numericValues) : null,
    numericMax: numericValues.length ? Math.max(...numericValues) : null,
    numericAvg: numericValues.length
      ? numericValues.reduce((total, value) => total + value, 0) /
        numericValues.length
      : null,
  };
  profile.role = inferImportedColumnRole(profile);
  profile.confidence = Math.round(
    Math.min(
      99,
      42 +
        profile.completeness * 25 +
        (profile.type !== "text" ? 18 : 0) +
        (profile.role !== "text" ? 14 : 0),
    ),
  );
  return profile;
}

function scoreImportedDatasetKind(profiles, rules) {
  return rules.reduce((score, rule) => {
    const matched = profiles.some((profile) => {
      if (rule.roles?.includes(profile.role)) return true;
      return rule.names ? hasNamePart(profile, rule.names) : false;
    });
    return score + (matched ? rule.points : 0);
  }, 0);
}

function inferImportedDatasetKind(profiles) {
  const rules = [
    {
      key: "sales_orders",
      label: "Sales / Orders",
      rules: [
        { roles: ["date"], points: 22 },
        { roles: ["amount"], points: 30 },
        { names: ["order", "orders"], points: 20 },
        { names: ["customer", "product"], points: 12 },
      ],
    },
    {
      key: "customers_accounts",
      label: "Customers / Accounts",
      rules: [
        { names: ["customer", "account", "client", "company"], points: 34 },
        { roles: ["email"], points: 16 },
        { names: ["city", "region", "segment", "tier"], points: 18 },
        { roles: ["id"], points: 12 },
      ],
    },
    {
      key: "products_catalog",
      label: "Products / Catalog",
      rules: [
        { names: ["product", "sku", "item"], points: 34 },
        { names: ["category", "brand"], points: 18 },
        { names: ["price", "cost"], points: 20 },
      ],
    },
    {
      key: "marketing_campaigns",
      label: "Marketing Campaigns",
      rules: [
        { names: ["campaign", "channel", "utm"], points: 36 },
        { names: ["spend", "budget", "impressions", "clicks"], points: 28 },
        { roles: ["date"], points: 16 },
      ],
    },
    {
      key: "support_tickets",
      label: "Support Tickets",
      rules: [
        { names: ["ticket", "case"], points: 34 },
        { names: ["priority", "status", "sla"], points: 22 },
        { names: ["opened", "closed", "agent"], points: 18 },
      ],
    },
    {
      key: "billing_finance",
      label: "Billing / Finance",
      rules: [
        { names: ["invoice", "billing", "payment"], points: 34 },
        { roles: ["amount"], points: 28 },
        { roles: ["date"], points: 14 },
      ],
    },
  ];
  const scored = rules
    .map((rule) => ({
      key: rule.key,
      label: rule.label,
      score: scoreImportedDatasetKind(profiles, rule.rules),
    }))
    .sort((left, right) => right.score - left.score);
  const best = scored[0] || { key: "generic_table", label: "Generic Table", score: 0 };
  if (best.score < 34) {
    return {
      key: "generic_table",
      label: "Generic Table",
      confidence: 58,
      reason: "No strong business-domain pattern was detected yet.",
    };
  }
  return {
    key: best.key,
    label: best.label,
    confidence: Math.min(96, 52 + best.score),
    reason: `Detected ${best.label.toLowerCase()} signals from column names, types, and field roles.`,
  };
}

function bestImportedProfile(profiles, predicate) {
  return profiles
    .filter(predicate)
    .sort(
      (left, right) =>
        right.confidence +
        right.completeness * 25 +
        right.uniqueRatio * 8 -
        (left.confidence + left.completeness * 25 + left.uniqueRatio * 8),
    )[0];
}

function buildImportedMappings(profiles, datasetKind) {
  const rows = [
    {
      role: "Date / Period",
      profile: bestImportedProfile(profiles, (profile) => profile.role === "date"),
      why: "Time slicing and trend views.",
    },
    {
      role: "Value Metric",
      profile: bestImportedProfile(profiles, (profile) =>
        ["amount", "measure"].includes(profile.role),
      ),
      why: "Primary numeric measure for charts.",
    },
    {
      role: "Entity ID",
      profile: bestImportedProfile(profiles, (profile) => profile.role === "id"),
      why: "Duplicate checks and future warehouse key.",
    },
    {
      role: "Entity Name",
      profile: bestImportedProfile(profiles, (profile) => profile.role === "entity"),
      why: "Human-readable drilldown label.",
    },
    {
      role: "Category",
      profile: bestImportedProfile(profiles, (profile) => profile.role === "category"),
      why: "Breakdowns, bars, and filters.",
    },
    {
      role: "Status",
      profile: bestImportedProfile(profiles, (profile) => profile.role === "status"),
      why: "Operational segmentation.",
    },
  ];
  return rows.map((row) => ({
    role: row.role,
    column: row.profile?.column || "",
    confidence: row.profile?.confidence || 0,
    note: row.profile
      ? row.why
      : `Not enough evidence in this ${datasetKind.label.toLowerCase()} preview.`,
  }));
}

function buildImportedQuality(records, columns, profiles) {
  const rowCount = records.length;
  const fieldCount = columns.length;
  const totalCells = Math.max(rowCount * fieldCount, 1);
  const nullCells = profiles.reduce((total, profile) => total + profile.nullCount, 0);
  const keyCandidate =
    bestImportedProfile(profiles, (profile) => profile.role === "id") ||
    bestImportedProfile(profiles, (profile) => profile.uniqueRatio > 0.72);
  const duplicateCount = keyCandidate
    ? Math.max(0, rowCount - keyCandidate.uniqueCount)
    : 0;
  const missingRate = nullCells / totalCells;
  const duplicateRate = rowCount ? duplicateCount / rowCount : 0;
  const typedFields = profiles.filter(
    (profile) => !["text", "empty"].includes(profile.type),
  ).length;
  const qualityScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 -
          missingRate * 45 -
          duplicateRate * 35 -
          Math.max(0, fieldCount - typedFields) * 1.6,
      ),
    ),
  );
  return {
    rowCount,
    fieldCount,
    nullCells,
    missingRate,
    duplicateCount,
    keyCandidate: keyCandidate?.column || "",
    typedFields,
    qualityScore,
  };
}

function importedPeriodLabel(date) {
  if (!date) return "";
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function buildImportedAutoView(records, profiles) {
  const dateProfile = bestImportedProfile(profiles, (profile) => profile.role === "date");
  const measureProfile = bestImportedProfile(profiles, (profile) =>
    ["amount", "measure"].includes(profile.role),
  );
  const categoryProfile =
    bestImportedProfile(profiles, (profile) => profile.role === "category") ||
    bestImportedProfile(profiles, (profile) => profile.role === "entity");

  if (dateProfile && measureProfile) {
    const grouped = new Map();
    records.forEach((record) => {
      const label = importedPeriodLabel(parseDateLike(record[dateProfile.column]));
      const value = parseNumberLike(record[measureProfile.column]);
      if (!label || value == null) return;
      grouped.set(label, (grouped.get(label) || 0) + value);
    });
    return {
      title: `${measureProfile.column} by ${dateProfile.column}`,
      subtitle: "Automatic trend from detected date and value fields.",
      type: "trend",
      rows: Array.from(grouped.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .slice(-12)
        .map(([label, value]) => ({ label, value })),
    };
  }
  if (categoryProfile && measureProfile) {
    const grouped = new Map();
    records.forEach((record) => {
      const label = serializeImportedCell(record[categoryProfile.column]).trim();
      const value = parseNumberLike(record[measureProfile.column]);
      if (!label || value == null) return;
      grouped.set(label, (grouped.get(label) || 0) + value);
    });
    return {
      title: `${measureProfile.column} by ${categoryProfile.column}`,
      subtitle: "Automatic ranking from detected category and value fields.",
      type: "bar",
      rows: Array.from(grouped.entries())
        .sort((left, right) => right[1] - left[1])
        .slice(0, 10)
        .map(([label, value]) => ({ label, value })),
    };
  }
  if (categoryProfile) {
    const grouped = new Map();
    records.forEach((record) => {
      const label = serializeImportedCell(record[categoryProfile.column]).trim();
      if (!label) return;
      grouped.set(label, (grouped.get(label) || 0) + 1);
    });
    return {
      title: `Rows by ${categoryProfile.column}`,
      subtitle: "Automatic count by detected category field.",
      type: "count",
      rows: Array.from(grouped.entries())
        .sort((left, right) => right[1] - left[1])
        .slice(0, 10)
        .map(([label, value]) => ({ label, value })),
    };
  }
  return {
    title: "Column completeness",
    subtitle: "Fallback profile view when no chart-ready fields are detected.",
    type: "quality",
    rows: profiles.slice(0, 10).map((profile) => ({
      label: profile.column,
      value: Math.round(profile.completeness * 100),
    })),
  };
}

function analyzeImportedDataset(records, columns) {
  const profiles = columns.map((column) => inferImportedColumnProfile(column, records));
  const datasetKind = inferImportedDatasetKind(profiles);
  const mappingRows = buildImportedMappings(profiles, datasetKind);
  const quality = buildImportedQuality(records, columns, profiles);
  const autoView = buildImportedAutoView(records, profiles);
  return {
    profiles,
    datasetKind,
    mappingRows,
    quality,
    autoView,
    importNote:
      "Preview import: profiled and mapped in the workspace, but not promoted into official KPI models.",
  };
}

function buildLocalImportPreview({
  fileName,
  type,
  typeLabel,
  columns,
  records,
  parserName,
}) {
  const safeColumns = normalizeImportedHeaders(columns || []);
  const safeRecords = records.map((record) => normalizeImportedRecord(record, safeColumns));
  const analysis = analyzeImportedDataset(safeRecords, safeColumns);
  return {
    id: `local:${fileName}`,
    name: fileName,
    type,
    typeLabel,
    parserName,
    status: "Preview",
    createdAt: isoNow(),
    rowCount: safeRecords.length,
    columns: safeColumns,
    rows: compactImportedRecords(safeRecords, safeColumns, 12),
    analysis,
  };
}

function previewFromCsv(fileName, text) {
  const parsed = parseCsvRecords(text);
  return buildLocalImportPreview({
    fileName,
    type: "file_csv",
    typeLabel: "CSV file",
    columns: parsed.columns,
    records: parsed.records,
    parserName: parsed.parserName,
  });
}

function previewFromJson(fileName, text) {
  const parsed = JSON.parse(text);
  const records = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.records)
      ? parsed.records
      : [parsed];
  const objects = records.filter((item) => item && typeof item === "object");
  const columns = Array.from(
    objects.reduce((set, item) => {
      Object.keys(item).forEach((key) => set.add(key));
      return set;
    }, new Set()),
  );
  return buildLocalImportPreview({
    fileName,
    type: "file_json",
    typeLabel: "JSON file",
    columns,
    records: objects,
    parserName: "Native JSON parser",
  });
}

function findImportedDataset(datasetId) {
  return (
    state.importedDatasets.find((dataset) => dataset.id === datasetId) ||
    (state.localFilePreview?.id === datasetId ? state.localFilePreview : null)
  );
}

function upsertImportedDataset(dataset) {
  state.importedDatasets = [
    dataset,
    ...state.importedDatasets.filter((item) => item.id !== dataset.id),
  ].slice(0, 8);
  state.localFilePreview = dataset;
  persistImportedDatasets();
}

function formatImportedNumber(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return "-";
  return number.toLocaleString("en-US", {
    maximumFractionDigits: Math.abs(number) >= 100 ? 0 : 2,
  });
}

function importedQualityCards(dataset) {
  const quality = dataset.analysis?.quality || {};
  return [
    {
      title: "Rows",
      value: formatSourceCount(quality.rowCount ?? dataset.rowCount),
      subtitle: "Detected in uploaded file",
    },
    {
      title: "Fields",
      value: formatSourceCount(quality.fieldCount ?? dataset.columns?.length),
      subtitle: `${formatSourceCount(quality.typedFields || 0)} typed automatically`,
    },
    {
      title: "Quality",
      value: `${quality.qualityScore ?? "-"} / 100`,
      subtitle: `${formatSourceCount(quality.nullCells || 0)} blank cells found`,
    },
    {
      title: "Duplicates",
      value: formatSourceCount(quality.duplicateCount || 0),
      subtitle: quality.keyCandidate
        ? `Checked against ${quality.keyCandidate}`
        : "No key candidate yet",
    },
  ];
}

function importedProfileTablePayload(dataset) {
  return {
    title: "Column Profile",
    columns: [
      { key: "column", label: "Column" },
      { key: "type", label: "Type" },
      { key: "role", label: "Role" },
      { key: "complete", label: "Complete" },
      { key: "unique", label: "Unique" },
      { key: "sample", label: "Sample" },
    ],
    rows: (dataset.analysis?.profiles || []).map((profile) => ({
      values: {
        column: profile.column,
        type: profile.type,
        role: profile.role,
        complete: `${Math.round(profile.completeness * 100)}%`,
        unique: formatSourceCount(profile.uniqueCount),
        sample: profile.sample.join(", "),
      },
    })),
  };
}

function importedMappingTablePayload(dataset) {
  return {
    title: "Suggested Mapping",
    columns: [
      { key: "role", label: "Role" },
      { key: "column", label: "Column" },
      { key: "confidence", label: "Confidence" },
      { key: "note", label: "Use" },
    ],
    rows: (dataset.analysis?.mappingRows || []).map((row) => ({
      values: {
        role: row.role,
        column: row.column || "Not detected",
        confidence: row.confidence ? `${row.confidence}%` : "-",
        note: row.note,
      },
    })),
  };
}

function importedPreviewTablePayload(dataset) {
  return {
    title: `${dataset.name} preview`,
    columns: (dataset.columns || []).map((column) => ({ key: column, label: column })),
    rows: (dataset.rows || []).map((row) => ({ values: row })),
  };
}

function renderImportedAutoView(dataset) {
  const autoView = dataset.analysis?.autoView;
  if (!autoView?.rows?.length)
    return renderStateCard({
      title: "No chart-ready fields",
      message: "The profile is still useful, but this file needs clearer date, category, or numeric columns for an automatic chart.",
      stateType: "empty",
    });
  const maxValue = Math.max(...autoView.rows.map((row) => Number(row.value || 0)), 1);
  return `
    <div class="import-chart" data-chart-type="${escapeHtml(autoView.type)}">
      ${autoView.rows
        .map((row) => {
          const width = Math.max(3, (Number(row.value || 0) / maxValue) * 100);
          return `
            <div class="import-chart-row">
              <span title="${escapeHtml(row.label)}">${escapeHtml(truncateMiddle(row.label, 34))}</span>
              <div class="import-chart-bar"><i style="width:${width}%"></i></div>
              <strong>${escapeHtml(formatImportedNumber(row.value))}</strong>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderImportedDatasetBody(dataset) {
  const analysis = dataset.analysis || {};
  const kind = analysis.datasetKind || { label: "Imported Table", confidence: 0 };
  return `
    <div class="imported-dataset-shell">
      <section class="import-banner">
        <div>
          <span>Preview import</span>
          <strong>${escapeHtml(dataset.name)}</strong>
          <p>${escapeHtml(kind.reason || "The file was profiled automatically and is isolated from official KPI models.")}</p>
        </div>
        <div class="import-banner-status">
          <b>${escapeHtml(kind.label)}</b>
          <span>${escapeHtml(String(kind.confidence || 0))}% confidence</span>
        </div>
      </section>
      <div class="import-wizard">
        <article><b>1</b><span>Parsed with ${escapeHtml(dataset.parserName || "local parser")}</span></article>
        <article><b>2</b><span>${escapeHtml(formatSourceCount(dataset.rowCount))} rows profiled</span></article>
        <article><b>3</b><span>Mapping suggested</span></article>
        <article><b>4</b><span>Preview only</span></article>
      </div>
      <section class="lab-kpis imported-quality-grid">
        ${importedQualityCards(dataset)
          .map(
            (card) => `
              <article class="lab-card">
                <p class="lab-card-title">${escapeHtml(card.title)}</p>
                <p class="lab-card-value">${escapeHtml(card.value)}</p>
                <div class="lab-card-meta"><span>${escapeHtml(card.subtitle)}</span></div>
              </article>
            `,
          )
          .join("")}
      </section>
      <div class="lab-grid imported-grid">
        <section class="lab-panel">
          <div class="lab-panel-head">
            <strong>Suggested Mapping</strong>
            <span>Editable promotion would happen in a governed load step.</span>
          </div>
          ${buildTableHtml(importedMappingTablePayload(dataset), null)}
        </section>
        <section class="lab-panel">
          <div class="lab-panel-head">
            <strong>${escapeHtml(analysis.autoView?.title || "Auto View")}</strong>
            <span>${escapeHtml(analysis.autoView?.subtitle || "Generated from the detected fields.")}</span>
          </div>
          ${renderImportedAutoView(dataset)}
        </section>
      </div>
      <section class="lab-panel">
        <div class="lab-panel-head">
          <strong>Column Profile</strong>
          <div class="lab-panel-head-side">
            <span>Types, roles, blanks, uniqueness, and samples.</span>
            <button class="toolbar-button toolbar-button--micro" type="button" data-action="export-import-profile">Export profile CSV</button>
          </div>
        </div>
        ${buildTableHtml(importedProfileTablePayload(dataset), 40)}
      </section>
      <section class="lab-panel">
        <div class="lab-panel-head">
          <strong>Data Preview</strong>
          <div class="lab-panel-head-side">
            <span>The imported data is isolated from official dashboards.</span>
            <button class="toolbar-button toolbar-button--micro" type="button" data-action="back-to-data-center">Back to Data Center</button>
          </div>
        </div>
        ${buildTableHtml(importedPreviewTablePayload(dataset), 12)}
      </section>
    </div>
  `;
}

function buildImportedDatasetWindowMarkup(windowId, dataset) {
  return buildUtilityWindowMarkup({
    id: windowId,
    title: "Imported Dataset",
    iconClass: "task-mark--data-center",
    kind: "imported_dataset",
    width: 1020,
    height: 720,
    minWidth: 760,
    minHeight: 520,
    body: `<div data-role="imported-dataset-body">${renderImportedDatasetBody(dataset)}</div>`,
  });
}

function renderImportedDatasetWindow(windowId) {
  const win = document.querySelector(`.window[data-window-id="${windowId}"]`);
  if (!win) return;
  const dataset = findImportedDataset(win.dataset.importId);
  const body = win.querySelector('[data-role="imported-dataset-body"]');
  const status = win.querySelector('[data-role="status"]');
  if (!dataset) {
    if (status) status.textContent = "Imported dataset unavailable";
    if (body)
      body.innerHTML = renderStateCard({
        title: "Imported dataset unavailable",
        message: "Open Data Center and upload the file again to rebuild this preview.",
        stateType: "empty",
      });
    return;
  }
  if (status)
    status.textContent = `${dataset.analysis?.datasetKind?.label || "Imported table"} | Preview only`;
  if (body) body.innerHTML = renderImportedDatasetBody(dataset);
  win.querySelector('[data-action="back-to-data-center"]')?.addEventListener(
    "click",
    () => openWindow("data_center"),
  );
  win.querySelector('[data-action="export-import-profile"]')?.addEventListener(
    "click",
    () => {
      const rows = [
        ["column", "type", "role", "completeness", "unique_count", "sample"],
        ...(dataset.analysis?.profiles || []).map((profile) => [
          profile.column,
          profile.type,
          profile.role,
          `${Math.round(profile.completeness * 100)}%`,
          profile.uniqueCount,
          profile.sample.join(" | "),
        ]),
      ];
      downloadCsv(`${slugify(dataset.name)}-profile.csv`, rows);
    },
  );
}

function openImportedDatasetWindow(datasetId = "") {
  const dataset = findImportedDataset(datasetId || state.localFilePreview?.id);
  if (!dataset) return;
  const existing = Array.from(
    document.querySelectorAll('.window[data-window-kind="imported_dataset"]'),
  ).find((win) => win.dataset.importId === dataset.id);
  if (existing) {
    openWindow(existing.dataset.windowId);
    renderImportedDatasetWindow(existing.dataset.windowId);
    return;
  }
  const windowId = `imported-${slugify(dataset.id) || Date.now()}`;
  elements.windowsLayer.insertAdjacentHTML(
    "beforeend",
    buildImportedDatasetWindowMarkup(windowId, dataset),
  );
  const win = document.querySelector(`.window[data-window-id="${windowId}"]`);
  win.dataset.importId = dataset.id;
  bindDynamicWindowChrome(win, () => renderImportedDatasetWindow(windowId));
  elements.tasks.insertAdjacentHTML(
    "beforeend",
    createTaskButtonHtml(windowId, "Imported Dataset", "task-mark--data-center"),
  );
  bindTaskButton(elements.tasks.querySelector(`[data-task="${windowId}"]`));
  openWindow(windowId);
}

function handleLocalFile(file, win, payload) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result || "");
      const lowerName = file.name.toLowerCase();
      const preview = lowerName.endsWith(".json")
        ? previewFromJson(file.name, text)
        : previewFromCsv(file.name, text);
      upsertImportedDataset(preview);
      setSourceConnected(preview.id, true);
      renderDataCenterWindow(win, payload);
      openImportedDatasetWindow(preview.id);
      elements.taskbarMessage.textContent = `${file.name} was profiled and opened as an imported dataset preview.`;
    } catch (error) {
      elements.taskbarMessage.textContent = `Could not preview ${file.name}: ${error.message}`;
    }
  };
  reader.readAsText(file);
}

function bindDataCenterInteractions(win, payload) {
  win.querySelectorAll("[data-source-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const sourceName = button.dataset.sourceToggle;
      setSourceConnected(sourceName, !sourceConnected(sourceName));
      renderDataCenterWindow(win, payload);
    });
  });
  win.querySelectorAll('[data-action="open-imported-analysis"]').forEach((button) => {
    button.addEventListener("click", () =>
      openImportedDatasetWindow(button.dataset.importId),
    );
  });
  win.querySelectorAll("[data-connector-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const connector = connectorByKey(button.dataset.connectorKey);
      if (!connector) return;
      if (connector.action === "file") {
        const input = win.querySelector('[data-role="data-file-input"]');
        if (input) {
          input.setAttribute("accept", connector.accept || ".csv,.json");
          input.click();
        }
        return;
      }
      if (connector.action === "registered" && connector.sourceName) {
        setSourceConnected(connector.sourceName, true);
        renderDataCenterWindow(win, payload);
        return;
      }
      if (connector.action === "draft") {
        state.activeConnectorSetup =
          state.activeConnectorSetup === connector.key ? "" : connector.key;
        renderDataCenterWindow(win, payload);
      }
    });
  });
  win.querySelector('[data-role="data-file-input"]')?.addEventListener(
    "change",
    (event) => handleLocalFile(event.target.files?.[0], win, payload),
  );
  win.querySelector('[data-action="cancel-connector-setup"]')?.addEventListener(
    "click",
    () => {
      state.activeConnectorSetup = "";
      renderDataCenterWindow(win, payload);
    },
  );
  win.querySelector('[data-role="connector-setup"]')?.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const connector = connectorByKey(form.dataset.connector);
      const label = String(formData.get("label") || connector?.title || "Source").trim();
      const location = String(formData.get("location") || "").trim();
      const target = String(formData.get("target") || "").trim();
      const primaryKey = String(formData.get("primaryKey") || "").trim();
      const id = `draft:${form.dataset.connector}:${Date.now()}`;
      const draft = {
        name: id,
        label,
        source_type: form.dataset.connector,
        type_label: connector?.title || "Connection draft",
        connection_group: connector?.type || "Draft",
        target: target || "Not mapped yet",
        load_mode: "Draft",
        primary_key: primaryKey,
        grain: "Connection draft pending validation",
        business_purpose: location
          ? `Draft connection for ${location}.`
          : "Draft connection created inside the workspace.",
        columns: primaryKey ? [primaryKey] : [],
        row_count: 0,
        duplicate_key_count: 0,
        loaded_at: "Draft",
        status: "draft",
        status_label: "Draft",
      };
      state.sourceDrafts.unshift(draft);
      state.sourceDrafts = state.sourceDrafts.slice(0, 12);
      persistSourceDrafts();
      setSourceConnected(id, true);
      state.activeConnectorSetup = "";
      renderDataCenterWindow(win, payload);
    },
  );
  win.querySelector('[data-action="clear-local-preview"]')?.addEventListener(
    "click",
    () => {
      if (state.localFilePreview) {
        setSourceConnected(state.localFilePreview.id, false);
        state.importedDatasets = state.importedDatasets.filter(
          (dataset) => dataset.id !== state.localFilePreview.id,
        );
        persistImportedDatasets();
        state.localFilePreview = null;
      }
      renderDataCenterWindow(win, payload);
    },
  );
}

function tableRowsAsObjects(tablePayload) {
  if (!tablePayload?.rows?.length) return [];
  return tablePayload.rows.map((row) => row.values || {});
}

function accountHealthStatusClass(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "healthy" || normalized === "stable") return "ok";
  if (normalized === "watch" || normalized === "support_risk") return "warning";
  if (normalized === "risk" || normalized === "billing_risk") return "error";
  return "neutral";
}

function renderAccountBadge(value) {
  const css = accountHealthStatusClass(value);
  return `<span class="account-badge account-badge--${escapeHtml(css)}">${escapeHtml(value || "-")}</span>`;
}

function numberFromDisplay(value) {
  return Number(String(value || "0").replaceAll(",", "")) || 0;
}

function buildAccountTierVisualHtml(tablePayload) {
  const rows = tableRowsAsObjects(tablePayload);
  if (!rows.length) return `<div class="lab-empty">No health tier data available.</div>`;
  const maxAccounts = Math.max(...rows.map((row) => numberFromDisplay(row.accounts)), 1);
  return `
    <div class="account-tier-visual">
      ${rows
        .map((row) => {
          const accounts = numberFromDisplay(row.accounts);
          const score = numberFromDisplay(row.avg_score);
          const width = Math.max(6, (accounts / maxAccounts) * 100);
          const css = accountHealthStatusClass(row.tier);
          return `
            <article class="account-tier-row account-tier-row--${escapeHtml(css)}">
              <div class="account-tier-head">
                ${renderAccountBadge(row.tier)}
                <strong>${escapeHtml(row.accounts)} accounts</strong>
                <span>Avg score ${escapeHtml(row.avg_score)}</span>
              </div>
              <div class="account-tier-bar" aria-label="${escapeHtml(row.tier)} ${escapeHtml(row.accounts)} accounts">
                <span style="width: ${width}%"></span>
              </div>
              <div class="account-tier-detail">
                <span><b>${escapeHtml(row.outstanding)}</b> outstanding</span>
                <span><b>${escapeHtml(row.open_tickets)}</b> open tickets</span>
                <span><b>${escapeHtml(row.billed)}</b> billed</span>
                <span><b>${score}</b>/100 score</span>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function buildAccountDriverVisualHtml(tablePayload) {
  const grouped = new Map();
  tableRowsAsObjects(tablePayload).forEach((row) => {
    const driver = row.driver || "unknown";
    const current = grouped.get(driver) || { accounts: 0, outstanding: 0 };
    current.accounts += 1;
    current.outstanding += numberFromDisplay(row.outstanding);
    grouped.set(driver, current);
  });
  const rows = Array.from(grouped.entries()).sort(
    (a, b) => b[1].accounts - a[1].accounts || b[1].outstanding - a[1].outstanding,
  );
  if (!rows.length) return `<div class="lab-empty">No risk driver data available.</div>`;
  const maxAccounts = Math.max(...rows.map(([, value]) => value.accounts), 1);
  return `
    <div class="account-driver-visual">
      ${rows
        .map(([driver, value]) => {
          const width = Math.max(8, (value.accounts / maxAccounts) * 100);
          const css = accountHealthStatusClass(driver);
          return `
            <article class="account-driver-row account-driver-row--${escapeHtml(css)}">
              <div class="account-driver-label">
                ${renderAccountBadge(driver)}
                <span>${value.accounts} accounts</span>
              </div>
              <div class="account-driver-bar">
                <span style="width: ${width}%"></span>
              </div>
              <strong>${value.outstanding.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</strong>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function buildAccountWatchlistHtml(tablePayload, limit = 12) {
  if (!tablePayload?.columns?.length || !tablePayload?.rows?.length) {
    return `<div class="lab-empty">No account watchlist available.</div>`;
  }
  const rows = tablePayload.rows.slice(0, limit);
  return `
    <div class="account-watchlist">
      ${rows
        .map((row) => {
          const values = row.values || {};
          const score = Number(values.score || 0);
          return `
            <article class="account-watchlist-row account-watchlist-row--${escapeHtml(accountHealthStatusClass(values.tier))}">
              <div class="account-watchlist-main">
                <strong title="${escapeHtml(values.account || "")}">${escapeHtml(values.account || "-")}</strong>
                <span>${escapeHtml(values.owner || "-")} | ${escapeHtml(values.stage || "-")}</span>
              </div>
              <div class="account-watchlist-score" aria-label="Health score ${escapeHtml(values.score || "-")}">
                <span>${escapeHtml(values.score || "-")}</span>
                <meter min="0" max="100" low="70" high="85" optimum="100" value="${escapeHtml(String(score))}"></meter>
              </div>
              <div class="account-watchlist-tags">
                ${renderAccountBadge(values.tier)}
                ${renderAccountBadge(values.driver)}
              </div>
              <div class="account-watchlist-metrics">
                <span><b>${escapeHtml(values.outstanding || "0.00")}</b> outstanding</span>
                <span><b>${escapeHtml(values.open_tickets || "0")}</b> open tickets</span>
                <span><b>${escapeHtml(values.billed || "0.00")}</b> billed</span>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderAccountTierPlot(plotEl, payload) {
  if (!plotEl || typeof Plotly === "undefined") return false;
  const rows = tableRowsAsObjects(payload.tier_table);
  if (!rows.length) return false;
  const theme = themeConfig();
  const labels = rows.map((row) => row.tier);
  const accountCounts = rows.map((row) => Number(String(row.accounts).replaceAll(",", "")) || 0);
  const outstanding = rows.map((row) => Number(String(row.outstanding).replaceAll(",", "")) || 0);
  const avgScore = rows.map((row) => Number(row.avg_score) || 0);
  const colors = labels.map((tier) => {
    const css = accountHealthStatusClass(tier);
    if (css === "error") return theme.danger;
    if (css === "warning") return theme.accent;
    return theme.positive;
  });

  Plotly.react(
    plotEl,
    [
      {
        type: "bar",
        name: "Accounts",
        x: labels,
        y: accountCounts,
        marker: { color: colors },
        customdata: rows.map((row, index) => [
          row.avg_score,
          outstanding[index],
          row.open_tickets,
          row.billed,
        ]),
        hovertemplate:
          "<b>%{x}</b><br>Accounts: %{y:,.0f}<br>Avg Score: %{customdata[0]}<br>Outstanding: %{customdata[1]:,.2f}<br>Open Tickets: %{customdata[2]}<br>Billed: %{customdata[3]}<extra></extra>",
      },
      {
        type: "scatter",
        mode: "lines+markers",
        name: "Avg Score",
        x: labels,
        y: avgScore,
        yaxis: "y2",
        line: { color: theme.current, width: 3 },
        marker: { size: 8, color: theme.current },
        hovertemplate: "<b>%{x}</b><br>Avg Score: %{y:.0f}<extra></extra>",
      },
    ],
    basePlotLayout({
      xTitle: "Health Tier",
      yTitle: "Accounts",
      metricFormat: "number",
      plotEl,
      extra: {
        margin: { l: 58, r: 58, t: 18, b: 58 },
        yaxis: { rangemode: "tozero", dtick: 1 },
        yaxis2: {
          title: { text: "Avg Score", standoff: 10 },
          overlaying: "y",
          side: "right",
          range: [0, 100],
          color: theme.current,
          tickfont: { size: 11 },
          zeroline: false,
        },
        legend: {
          orientation: "h",
          x: 0,
          y: 1.14,
          xanchor: "left",
          font: { color: theme.text, size: 11 },
        },
      },
    }),
    { responsive: true, displaylogo: false },
  );
  return true;
}

function renderAccountDriverPlot(plotEl, payload) {
  if (!plotEl || typeof Plotly === "undefined") return false;
  const rows = tableRowsAsObjects(payload.account_table);
  if (!rows.length) return false;
  const theme = themeConfig();
  const grouped = new Map();
  rows.forEach((row) => {
    const driver = row.driver || "unknown";
    const current = grouped.get(driver) || { accounts: 0, outstanding: 0 };
    current.accounts += 1;
    current.outstanding += Number(String(row.outstanding || "0").replaceAll(",", "")) || 0;
    grouped.set(driver, current);
  });
  const points = Array.from(grouped.entries()).sort(
    (a, b) => b[1].accounts - a[1].accounts || b[1].outstanding - a[1].outstanding,
  );
  const labels = points.map(([driver]) => driver);
  const accounts = points.map(([, value]) => value.accounts);
  const outstanding = points.map(([, value]) => value.outstanding);
  Plotly.react(
    plotEl,
    [
      {
        type: "bar",
        orientation: "h",
        name: "Accounts",
        y: labels,
        x: accounts,
        marker: {
          color: labels.map((driver) => {
            const css = accountHealthStatusClass(driver);
            if (css === "error") return theme.danger;
            if (css === "warning") return theme.accent;
            return theme.current;
          }),
        },
        customdata: outstanding,
        hovertemplate:
          "<b>%{y}</b><br>Accounts: %{x:,.0f}<br>Outstanding: %{customdata:,.2f}<extra></extra>",
      },
    ],
    basePlotLayout({
      xTitle: "Accounts",
      yTitle: "Risk Driver",
      metricFormat: "number",
      plotEl,
      showLegend: false,
      extra: {
        margin: { l: 116, r: 18, t: 18, b: 46 },
        xaxis: { rangemode: "tozero", dtick: 1 },
        yaxis: {
          automargin: true,
          tickfont: { size: 11 },
        },
      },
    }),
    { responsive: true, displaylogo: false },
  );
  return true;
}

function renderAccountHealthWindow(win, payload) {
  const refs = windowRefs(win);
  win._payload = payload;
  win.dataset.loadedPage = "account_health";
  if (refs.status) {
    refs.status.textContent =
      payload.status === "ok"
        ? `Account Health loaded | ${payload.generated_at || ""}`
        : "Account Health unavailable";
  }

  refs.cards.innerHTML = renderSourceHealthCards(payload.cards || []);
  observeCardValueFit(refs.cards);
  refs.narrative.innerHTML = renderNarrative({
    summary: payload.summary || [],
    insight_note: payload.subtitle,
  });
  refs.annotations.innerHTML = renderAnnotations("account_health");
  refs.breadcrumb.classList.add("hidden");
  refs.primaryTitle.textContent =
        payload.tier_table?.title || "Health Tier Summary";
  refs.primaryMeta.textContent =
    "Account health tiers from CRM, billing, support, and ecommerce signals";
  refs.primaryBack.classList.add("hidden");
  refs.primaryBack.onclick = null;
  purgePlot(refs.primaryPlot);
  if (!renderAccountTierPlot(refs.primaryPlot, payload)) {
    refs.primaryPlot.innerHTML = buildAccountTierVisualHtml(payload.tier_table);
  }

  refs.secondaryPanel.classList.remove("hidden");
  refs.secondaryTitle.textContent = "Risk Driver Mix";
  refs.secondaryMeta.textContent =
    "How the watchlist splits across billing, support, and stable accounts";
  purgePlot(refs.secondaryPlot);
  if (!renderAccountDriverPlot(refs.secondaryPlot, payload)) {
    refs.secondaryPlot.innerHTML = buildAccountDriverVisualHtml(payload.account_table);
  }

  refs.tablePanel.classList.remove("hidden");
  refs.tableTitle.textContent =
    payload.account_table?.title || "Account Watchlist";
  refs.tableMeta.textContent = "Lowest score accounts first";
  refs.table.innerHTML = buildAccountWatchlistHtml(payload.account_table, 12);

  refs.detailPanel.panel.classList.add("hidden");
  refs.detailPanel.panel.dataset.interactionKey = "";
  refs.detailPanel.panel.dataset.interactionValue = "";
  refs.detailPanel.spotlightButton?.classList.add("hidden");
  refs.detailPanel.exportButton?.classList.add("hidden");
  refs.detailPanel.breadcrumbEl?.classList.add("hidden");

  win
    .querySelectorAll(".spotlight-button, [data-action='compare']")
    .forEach((button) => button.classList.add("hidden"));
}

function createSpotlightConfig(payload, options = {}) {
  const page = pageByKey(payload.page);
  return {
    id: options.id || `spotlight-${++state.spotlightCounter}`,
    kind: options.kind || "primary",
    focusType: options.focusType || options.kind || "primary",
    pageKey: payload.page,
    title: options.title || page?.windowLabel || payload.title,
    subtitle: options.subtitle || payload.subtitle || "",
    cardIndex: options.cardIndex ?? null,
    interactionKey: options.interactionKey || "",
    interactionValue: options.interactionValue || "",
    drilldownPeriodKey: options.drilldownPeriodKey || "",
    syncMode: options.syncMode || "sync",
    filters: options.filters
      ? filtersSnapshot(options.filters)
      : filtersSnapshot(),
  };
}

function buildSpotlightWindowMarkup(config) {
  const page = pageByKey(config.pageKey);
  const iconClass = page
    ? page.iconClass.replace("icon-art--", "task-mark--")
    : "task-mark--spotlight";
  return `
    <article class="window" data-window-id="${escapeHtml(config.id)}" data-page-key="${escapeHtml(config.pageKey)}" data-window-kind="spotlight" data-min-w="720" data-min-h="500" data-w="960" data-h="720">
      <div class="titlebar">
        <div class="title-meta">
          <span class="task-mark title-mark ${escapeHtml(iconClass)}" aria-hidden="true"></span>
          <span>${escapeHtml(config.title)} Spotlight</span>
        </div>
        <div class="titlebar-utility">
          <span class="toolbar-label titlebar-status window-status" data-role="status">Loading spotlight...</span>
          <div class="titlebar-buttons">
            <button class="toolbar-button toolbar-button--micro" type="button" data-action="reload">Reload</button>
            <button class="toolbar-button toolbar-button--micro" type="button" data-action="bookmark-spotlight">Bookmark</button>
          </div>
          <div class="window-controls">
            <button type="button" data-action="minimize" aria-label="Minimize">_</button>
            <button type="button" data-action="maximize" aria-label="Maximize">[]</button>
            <button type="button" data-action="close" aria-label="Close">x</button>
          </div>
        </div>
      </div>
      <div class="window-content">
        <div class="lab-shell">
          <div class="spotlight-shell">
            <div class="spotlight-controlbar">
              <button class="toolbar-button spotlight-sync-toggle" type="button" data-action="toggle-sync">Synced</button>
              <label class="spotlight-field spotlight-field--small">
                <span>Start</span>
                <input type="text" data-role="spotlight-start-date" inputmode="none" autocomplete="off" />
              </label>
              <label class="spotlight-field spotlight-field--small">
                <span>End</span>
                <input type="text" data-role="spotlight-end-date" inputmode="none" autocomplete="off" />
              </label>
              <label class="spotlight-field spotlight-field--small">
                <span>Granularity</span>
                <select data-role="spotlight-granularity">
                  <option value="Day">Day</option>
                  <option value="Month">Month</option>
                  <option value="Quarter">Quarter</option>
                  <option value="Year">Year</option>
                </select>
              </label>
              <label class="spotlight-field spotlight-field--small" data-role="spotlight-scenario-wrap">
                <span>Scenario</span>
                <select data-role="spotlight-scenario">
                  <option value="Base">Base</option>
                  <option value="Conservative">Conservative</option>
                  <option value="Upside">Upside</option>
                </select>
              </label>
            </div>
            <div class="spotlight-summary" data-role="spotlight-summary"></div>
            <div class="lab-breadcrumb hidden" data-role="spotlight-breadcrumb"></div>
            <div class="spotlight-body" data-role="spotlight-body"></div>
          </div>
        </div>
      </div>
      ${resizeDirections.map((direction) => `<div class="window-resize-handle" data-resize-direction="${direction}"></div>`).join("")}
    </article>
  `;
}

function bindSpotlightWindowControls(win, spotlightId) {
  const config = state.spotlights.get(spotlightId);
  if (!config) return;
  const syncButton = win.querySelector('[data-action="toggle-sync"]');
  const startInput = win.querySelector('[data-role="spotlight-start-date"]');
  const endInput = win.querySelector('[data-role="spotlight-end-date"]');
  const granularitySelect = win.querySelector(
    '[data-role="spotlight-granularity"]',
  );
  const scenarioWrap = win.querySelector(
    '[data-role="spotlight-scenario-wrap"]',
  );
  const scenarioSelect = win.querySelector('[data-role="spotlight-scenario"]');

  const applyFrozenUpdate = () => {
    if (config.syncMode !== "frozen") return;
    state.spotlights.set(config.id, config);
    loadSpotlightWindow(config.id, true);
  };

  syncButton.onclick = () => {
    config.syncMode = config.syncMode === "sync" ? "frozen" : "sync";
    if (config.syncMode === "sync") config.filters = filtersSnapshot();
    syncSpotlightControls(win, config, spotlightFilters(config));
    loadSpotlightWindow(config.id, true);
  };

  if (!win._spotlightPickersInitialized && typeof flatpickr !== "undefined") {
    const pickerBase = {
      dateFormat: "d / m / Y",
      allowInput: false,
      disableMobile: true,
      locale: { firstDayOfWeek: 1 },
    };
    win._spotlightStartPicker = flatpickr(startInput, {
      ...pickerBase,
      defaultDate: config.filters.startDate,
      onChange(selectedDates, _dateStr, instance) {
        const picked = selectedDates[0];
        if (!picked) return;
        config.filters.startDate = instance.formatDate(picked, "Y-m-d");
        applyFrozenUpdate();
      },
    });
    win._spotlightEndPicker = flatpickr(endInput, {
      ...pickerBase,
      defaultDate: config.filters.endDate,
      onChange(selectedDates, _dateStr, instance) {
        const picked = selectedDates[0];
        if (!picked) return;
        config.filters.endDate = instance.formatDate(picked, "Y-m-d");
        applyFrozenUpdate();
      },
    });
    win._spotlightPickersInitialized = true;
  }

  granularitySelect.onchange = () => {
    config.filters.granularity = granularitySelect.value;
    applyFrozenUpdate();
  };
  scenarioSelect.onchange = () => {
    config.filters.scenarioMode = scenarioSelect.value;
    applyFrozenUpdate();
  };

  scenarioWrap.classList.toggle("hidden", config.pageKey !== "predictive");
  syncSpotlightControls(win, config, spotlightFilters(config));
}

function syncSpotlightControls(win, config, filters) {
  const syncButton = win.querySelector('[data-action="toggle-sync"]');
  const startInput = win.querySelector('[data-role="spotlight-start-date"]');
  const endInput = win.querySelector('[data-role="spotlight-end-date"]');
  const granularitySelect = win.querySelector(
    '[data-role="spotlight-granularity"]',
  );
  const scenarioSelect = win.querySelector('[data-role="spotlight-scenario"]');
  const disabled = config.syncMode === "sync";
  syncButton.textContent = disabled ? "Synced" : "Frozen";
  syncButton.classList.toggle("is-frozen", !disabled);
  if (win._spotlightStartPicker)
    win._spotlightStartPicker.setDate(filters.startDate, false, "Y-m-d");
  else startInput.value = displayDate(filters.startDate);
  if (win._spotlightEndPicker)
    win._spotlightEndPicker.setDate(filters.endDate, false, "Y-m-d");
  else endInput.value = displayDate(filters.endDate);
  granularitySelect.value = filters.granularity;
  scenarioSelect.value = filters.scenarioMode || "Base";
  startInput.disabled = disabled;
  endInput.disabled = disabled;
  granularitySelect.disabled = disabled;
  scenarioSelect.disabled = disabled;
}

function renderSpotlightSelectedCard(card) {
  return `<section class="spotlight-layout"><article class="lab-card spotlight-card-accent"><p class="lab-card-title">${escapeHtml(card.title)}</p><p class="lab-card-value">${escapeHtml(card.formatted_value)}</p><div class="lab-card-meta"><span>Prev: ${escapeHtml(card.formatted_previous_value)}</span>${formatCardDelta(card.delta_pct)}</div></article></section>`;
}

function renderSpotlightWindow(win, config, payload) {
  const bodyEl = win.querySelector('[data-role="spotlight-body"]');
  const summaryEl = win.querySelector('[data-role="spotlight-summary"]');
  const breadcrumbEl = win.querySelector('[data-role="spotlight-breadcrumb"]');
  const statusEl = win.querySelector('[data-role="status"]');
  const filters = spotlightFilters(config);
  syncSpotlightControls(win, config, filters);
  statusEl.textContent = `${config.title} | ${currentFiltersSummary(filters)}`;
  summaryEl.innerHTML = `<div class="spotlight-summary-card"><strong>${escapeHtml(config.title)}</strong><span>${escapeHtml(config.subtitle || payload.subtitle || "")}</span></div>`;
  const spotlightBreadcrumb =
    config.pageKey === "sales" && config.drilldownPeriodKey
      ? `Sales Overview / Spotlight / ${payload.trend_title || config.drilldownPeriodKey}`
      : "";
  breadcrumbEl.textContent = spotlightBreadcrumb;
  breadcrumbEl.classList.toggle("hidden", !spotlightBreadcrumb);

  if (config.kind === "detail") {
    bodyEl.innerHTML = `
      <section class="lab-panel">
        <div class="lab-panel-head">
          <strong>${escapeHtml(payload.title || config.title)}</strong>
          <div class="lab-panel-head-side">
            <span>${escapeHtml(payload.subtitle || "")}</span>
            <button class="toolbar-button toolbar-button--micro" type="button" data-action="detail-export">Export CSV</button>
          </div>
        </div>
        ${buildTableHtml(payload.table)}
      </section>
    `;
    bodyEl
      .querySelector('[data-action="detail-export"]')
      ?.addEventListener("click", () => {
        const columns = payload.table?.columns || [];
        const dataRows = payload.table?.rows || [];
        if (!columns.length || !dataRows.length) return;
        const rows = [columns.map((column) => column.label)];
        dataRows.forEach((row) => {
          rows.push(columns.map((column) => row.values?.[column.key] ?? ""));
        });
        downloadCsv(
          `${slugify(config.pageKey)}-${slugify(config.interactionValue || "detail")}-detail.csv`,
          rows,
        );
      });
    return;
  }

  if (config.kind === "card") {
    const card = payload.cards?.[config.cardIndex];
    bodyEl.innerHTML = card
      ? renderSpotlightSelectedCard(card)
      : `<div class="lab-empty">Card not available for this slice.</div>`;
    return;
  }

  if (config.kind === "primary") {
    bodyEl.innerHTML = `
      <section class="lab-panel spotlight-metric-panel">
        <div class="lab-panel-head">
          <strong>${escapeHtml(payload.primary_heatmap?.title || payload.trend_title || config.title)}</strong>
          <div class="lab-panel-head-side">
            <span>${escapeHtml(payload.comparison_rule || "")}</span>
            <button class="toolbar-button toolbar-button--micro ${payload.view_mode === "drilldown" ? "" : "hidden"}" type="button" data-action="spotlight-back">Back</button>
          </div>
        </div>
        <div class="lab-plot" data-role="spotlight-primary-plot"></div>
      </section>
    `;
    const plotEl = bodyEl.querySelector('[data-role="spotlight-primary-plot"]');
    renderPrimaryPlot(plotEl, payload, {
      onPrimarySelect: (selectedPoint) => {
        config.drilldownPeriodKey = selectedPoint.period_key;
        state.spotlights.set(config.id, config);
        loadSpotlightWindow(config.id, true);
      },
    });
    bodyEl
      .querySelector('[data-action="spotlight-back"]')
      ?.addEventListener("click", () => {
        config.drilldownPeriodKey = "";
        state.spotlights.set(config.id, config);
        loadSpotlightWindow(config.id, true);
      });
    return;
  }

  if (config.kind === "secondary") {
    bodyEl.innerHTML = `
      <section class="lab-panel spotlight-metric-panel">
          <div class="lab-panel-head">
            <strong>${escapeHtml(payload.secondary_chart?.title || config.title)}</strong>
            <span>${escapeHtml(payload.secondary_chart?.interaction_label || "")}</span>
          </div>
          <div class="lab-plot" data-role="spotlight-secondary-plot"></div>
        </section>
        <section class="lab-panel detail-panel hidden" data-role="detail-panel">
          <div class="lab-panel-head">
            <strong data-role="detail-title">Detail</strong>
            <div class="lab-panel-head-side">
              <span data-role="detail-subtitle"></span>
              <button class="toolbar-button toolbar-button--micro hidden" type="button" data-action="detail-export">Export CSV</button>
              <button class="toolbar-button toolbar-button--micro spotlight-button hidden" type="button" data-spotlight-action="detail">Spotlight</button>
            </div>
          </div>
          <div class="lab-breadcrumb hidden" data-role="detail-breadcrumb"></div>
          <div data-role="detail-table"></div>
        </section>
    `;
    const detailPanel = {
      panel: bodyEl.querySelector('[data-role="detail-panel"]'),
      breadcrumbEl: bodyEl.querySelector('[data-role="detail-breadcrumb"]'),
      title: bodyEl.querySelector('[data-role="detail-title"]'),
      subtitle: bodyEl.querySelector('[data-role="detail-subtitle"]'),
      table: bodyEl.querySelector('[data-role="detail-table"]'),
      spotlightButton: bodyEl.querySelector('[data-spotlight-action="detail"]'),
      exportButton: bodyEl.querySelector('[data-action="detail-export"]'),
    };
    renderSecondaryPlot(
      bodyEl.querySelector('[data-role="spotlight-secondary-plot"]'),
      payload.secondary_chart,
      config.pageKey,
      detailPanel,
      { filtersOverride: filters },
    );
    detailPanel.spotlightButton?.addEventListener("click", () => {
      openSpotlight(
        createSpotlightConfig(payload, {
          kind: "detail",
          title:
            detailPanel.panel.dataset.detailTitle ||
            detailPanel.title.textContent,
          subtitle:
            detailPanel.panel.dataset.detailSubtitle ||
            detailPanel.subtitle.textContent,
          interactionKey: detailPanel.panel.dataset.interactionKey,
          interactionValue: detailPanel.panel.dataset.interactionValue,
          filters,
          syncMode: config.syncMode,
        }),
      );
    });
    return;
  }

  if (config.kind === "table") {
    bodyEl.innerHTML = `
      <section class="lab-panel spotlight-metric-panel">
        <div class="lab-panel-head">
          <strong>${escapeHtml(payload.detail_table?.title || config.title)}</strong>
          <span>${escapeHtml(payload.detail_hint || "")}</span>
        </div>
        <div data-role="spotlight-table"></div>
      </section>
        <section class="lab-panel detail-panel hidden" data-role="detail-panel">
          <div class="lab-panel-head">
            <strong data-role="detail-title">Detail</strong>
            <div class="lab-panel-head-side">
              <span data-role="detail-subtitle"></span>
              <button class="toolbar-button toolbar-button--micro hidden" type="button" data-action="detail-export">Export CSV</button>
              <button class="toolbar-button toolbar-button--micro spotlight-button hidden" type="button" data-spotlight-action="detail">Spotlight</button>
            </div>
          </div>
          <div class="lab-breadcrumb hidden" data-role="detail-breadcrumb"></div>
          <div data-role="detail-table"></div>
        </section>
    `;
    bodyEl.querySelector('[data-role="spotlight-table"]').innerHTML =
      buildTableHtml(payload.detail_table, 14);
    const detailPanel = {
      panel: bodyEl.querySelector('[data-role="detail-panel"]'),
      breadcrumbEl: bodyEl.querySelector('[data-role="detail-breadcrumb"]'),
      title: bodyEl.querySelector('[data-role="detail-title"]'),
      subtitle: bodyEl.querySelector('[data-role="detail-subtitle"]'),
      table: bodyEl.querySelector('[data-role="detail-table"]'),
      spotlightButton: bodyEl.querySelector('[data-spotlight-action="detail"]'),
      exportButton: bodyEl.querySelector('[data-action="detail-export"]'),
    };
    bindTableInteractions(
      bodyEl.querySelector('[data-role="spotlight-table"]'),
      config.pageKey,
      detailPanel,
      filters,
    );
    detailPanel.spotlightButton?.addEventListener("click", () => {
      openSpotlight(
        createSpotlightConfig(payload, {
          kind: "detail",
          title:
            detailPanel.panel.dataset.detailTitle ||
            detailPanel.title.textContent,
          subtitle:
            detailPanel.panel.dataset.detailSubtitle ||
            detailPanel.subtitle.textContent,
          interactionKey: detailPanel.panel.dataset.interactionKey,
          interactionValue: detailPanel.panel.dataset.interactionValue,
          filters,
          syncMode: config.syncMode,
        }),
      );
    });
  }
}

async function loadSpotlightWindow(spotlightId, force = false) {
  const config = state.spotlights.get(spotlightId);
  const win = document.querySelector(
    `.window[data-window-id="${spotlightId}"]`,
  );
  if (!config || !win) return;
  const key = spotlightCacheKey(config);
  const statusEl = win.querySelector('[data-role="status"]');
  if (!force && state.spotlightCache.has(key)) {
    renderSpotlightWindow(win, config, state.spotlightCache.get(key));
    return;
  }

  const requestKey = `spotlight:${spotlightId}`;
  state.requests.get(requestKey)?.abort?.();
  const controller = new AbortController();
  state.requests.set(requestKey, controller);
  statusEl.textContent = "Loading spotlight...";
  try {
    const filters = spotlightFilters(config);
    const url =
      config.kind === "detail"
        ? buildDetailUrlForFilters(
            config.pageKey,
            filters,
            config.interactionKey,
            config.interactionValue,
          )
        : buildDashboardUrlForFilters(
            config.pageKey,
            filters,
            config.drilldownPeriodKey
              ? { drilldown_period_key: config.drilldownPeriodKey }
              : {},
          );
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const payload = await response.json();
    state.spotlightCache.set(key, payload);
    if (state.requests.get(requestKey) !== controller) return;
    renderSpotlightWindow(win, config, payload);
  } catch (error) {
    if (error.name === "AbortError") return;
    renderWindowError(win, "Spotlight", error.message);
  } finally {
    if (state.requests.get(requestKey) === controller)
      state.requests.delete(requestKey);
  }
}

function openSpotlightWindow(id) {
  openWindow(id);
}

function openSpotlight(config) {
  let spotlightConfig = config;
  if (!spotlightConfig.id)
    spotlightConfig = {
      ...spotlightConfig,
      id: `spotlight-${++state.spotlightCounter}`,
    };
  markOnboardingStep("spotlightUsed");
  state.spotlights.set(spotlightConfig.id, spotlightConfig);
  trackRecent({
    kind: "spotlight",
    pageKey: spotlightConfig.pageKey,
    title: `${spotlightConfig.title} Spotlight`,
    context:
      spotlightConfig.interactionValue ||
      spotlightConfig.drilldownPeriodKey ||
      currentFiltersSummary(spotlightFilters(spotlightConfig)),
    focusType: spotlightConfig.focusType,
    config: {
      kind: spotlightConfig.kind,
      focusType: spotlightConfig.focusType,
      pageKey: spotlightConfig.pageKey,
      title: spotlightConfig.title,
      subtitle: spotlightConfig.subtitle,
      cardIndex: spotlightConfig.cardIndex,
      interactionKey: spotlightConfig.interactionKey,
      interactionValue: spotlightConfig.interactionValue,
      drilldownPeriodKey: spotlightConfig.drilldownPeriodKey,
      syncMode: spotlightConfig.syncMode,
      filters: spotlightConfig.filters,
    },
  });
  let win = document.querySelector(
    `.window[data-window-id="${spotlightConfig.id}"]`,
  );
  if (!win) {
    elements.windowsLayer.insertAdjacentHTML(
      "beforeend",
      buildSpotlightWindowMarkup(spotlightConfig),
    );
    win = document.querySelector(
      `.window[data-window-id="${spotlightConfig.id}"]`,
    );
    win
      .querySelector('[data-action="reload"]')
      .addEventListener("click", () =>
        loadSpotlightWindow(spotlightConfig.id, true),
      );
    win
      .querySelector('[data-action="bookmark-spotlight"]')
      .addEventListener("click", () => {
        const page = pageByKey(spotlightConfig.pageKey);
        const label = `Spotlight ${page?.windowLabel || spotlightConfig.pageKey} ${formatStamp(isoNow())}`;
        state.bookmarks.unshift(captureWorkspaceSnapshot(label));
        persistBookmarks();
        openBookmarksWindow();
      });
    win
      .querySelector('[data-action="minimize"]')
      .addEventListener("click", () => minimizeWindow(win));
    win
      .querySelector('[data-action="maximize"]')
      .addEventListener("click", () => toggleMaximize(win));
    win
      .querySelector('[data-action="close"]')
      .addEventListener("click", () => closeWindow(win));
    win
      .querySelector(".titlebar")
      .addEventListener("pointerdown", (event) => startDrag(event, win));
    win
      .querySelectorAll(".window-resize-handle")
      .forEach((handle) =>
        handle.addEventListener("pointerdown", (event) =>
          startResize(event, win, handle.dataset.resizeDirection),
        ),
      );
    bindSpotlightWindowControls(win, spotlightConfig.id);
    elements.tasks.insertAdjacentHTML(
      "beforeend",
      createTaskButtonHtml(
        spotlightConfig.id,
        `${spotlightConfig.title} Spotlight`,
        "task-mark--spotlight",
      ),
    );
    bindTaskButton(
      elements.tasks.querySelector(`[data-task="${spotlightConfig.id}"]`),
    );
  } else {
    bindSpotlightWindowControls(win, spotlightConfig.id);
  }
  openSpotlightWindow(spotlightConfig.id);
}

function bindWindowSpotlightActions(win, payload) {
  win.querySelectorAll("[data-spotlight-action]").forEach((button) => {
    button.onclick = () => {
      const action = button.dataset.spotlightAction;
      if (action === "card") {
        openSpotlight(
          createSpotlightConfig(payload, {
            kind: "card",
            title:
              payload.cards?.[Number(button.dataset.cardIndex)]?.title ||
              payload.title,
            subtitle: payload.summary?.[0] || payload.subtitle,
            cardIndex: Number(button.dataset.cardIndex),
            drilldownPeriodKey: win.dataset.drilldownPeriodKey || "",
          }),
        );
        return;
      }
      if (action === "primary") {
        openSpotlight(
          createSpotlightConfig(payload, {
            kind: "primary",
            title:
              payload.trend_title ||
              payload.primary_heatmap?.title ||
              payload.title,
            subtitle:
              payload.comparison_rule ||
              payload.interaction_hint ||
              payload.subtitle,
            drilldownPeriodKey: win.dataset.drilldownPeriodKey || "",
          }),
        );
        return;
      }
      if (action === "secondary") {
        openSpotlight(
          createSpotlightConfig(payload, {
            kind: "secondary",
            title: payload.secondary_chart?.title || payload.title,
            subtitle:
              payload.secondary_chart?.interaction_label || payload.subtitle,
          }),
        );
        return;
      }
      if (action === "table") {
        openSpotlight(
          createSpotlightConfig(payload, {
            kind: "table",
            title: payload.detail_table?.title || payload.title,
            subtitle: payload.detail_hint || payload.subtitle,
          }),
        );
        return;
      }
      if (action === "detail") {
        const detailPanel = win.querySelector('[data-role="detail-panel"]');
        const interactionKey = detailPanel?.dataset.interactionKey;
        const interactionValue = detailPanel?.dataset.interactionValue;
        if (!interactionKey || !interactionValue) return;
        openSpotlight(
          createSpotlightConfig(payload, {
            kind: "detail",
            title: detailPanel.dataset.detailTitle || "Detail",
            subtitle: detailPanel.dataset.detailSubtitle || "",
            interactionKey,
            interactionValue,
          }),
        );
      }
    };
  });
}

async function loadPageWindow(pageKey, force = false) {
  const win = document.querySelector(`.window[data-window-id="${pageKey}"]`);
  if (!win) return;
  if (pageKey === "data_center") {
    await loadDataCenterWindow(win, force);
    return;
  }
  if (pageKey === "source_health") {
    await loadSourceHealthWindow(win, force);
    return;
  }
  if (pageKey === "account_health") {
    await loadAccountHealthWindow(win, force);
    return;
  }
  const extra = win.dataset.drilldownPeriodKey
    ? { drilldown_period_key: win.dataset.drilldownPeriodKey }
    : {};
  const requestCacheKey = `${cacheKey(pageKey)}::${win.dataset.drilldownPeriodKey || ""}`;
  if (!force && state.cache.has(requestCacheKey)) {
    renderWindow(win, state.cache.get(requestCacheKey));
    return;
  }

  const requestKey = `page:${pageKey}`;
  state.requests.get(requestKey)?.abort?.();
  const controller = new AbortController();
  state.requests.set(requestKey, controller);
  const statusEl = win.querySelector('[data-role="status"]');
  if (statusEl)
    statusEl.textContent = `Loading ${pageByKey(pageKey)?.windowLabel || pageKey}...`;
  try {
    const response = await fetch(
      buildDashboardUrlForFilters(pageKey, state.filters, extra),
      { signal: controller.signal },
    );
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const payload = await response.json();
    state.cache.set(requestCacheKey, payload);
    if (state.requests.get(requestKey) !== controller) return;
    renderWindow(win, payload);
  } catch (error) {
    if (error.name === "AbortError") return;
    renderWindowError(
      win,
      `Failed to load ${pageByKey(pageKey)?.windowLabel || pageKey}`,
      error.message,
    );
  } finally {
    if (state.requests.get(requestKey) === controller)
      state.requests.delete(requestKey);
  }
}

async function loadDataCenterWindow(win, force = false) {
  const requestCacheKey = "data_center";
  if (!force && state.cache.has(requestCacheKey)) {
    renderDataCenterWindow(win, state.cache.get(requestCacheKey));
    return;
  }

  const requestKey = "page:data_center";
  state.requests.get(requestKey)?.abort?.();
  const controller = new AbortController();
  state.requests.set(requestKey, controller);
  const statusEl = win.querySelector('[data-role="status"]');
  if (statusEl) statusEl.textContent = "Loading Data Center...";

  try {
    const response = await fetch("/api/source-catalog", {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const payload = await response.json();
    state.cache.set(requestCacheKey, payload);
    if (state.requests.get(requestKey) !== controller) return;
    renderDataCenterWindow(win, payload);
  } catch (error) {
    if (error.name === "AbortError") return;
    renderWindowError(win, "Failed to load Data Center", error.message);
  } finally {
    if (state.requests.get(requestKey) === controller)
      state.requests.delete(requestKey);
  }
}

async function loadSourceHealthWindow(win, force = false) {
  const requestCacheKey = "source_health";
  if (!force && state.cache.has(requestCacheKey)) {
    renderSourceHealthWindow(win, state.cache.get(requestCacheKey));
    return;
  }

  const requestKey = "page:source_health";
  state.requests.get(requestKey)?.abort?.();
  const controller = new AbortController();
  state.requests.set(requestKey, controller);
  const statusEl = win.querySelector('[data-role="status"]');
  if (statusEl) statusEl.textContent = "Loading Source Health...";

  try {
    const response = await fetch("/api/source-health", {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const payload = await response.json();
    state.cache.set(requestCacheKey, payload);
    if (state.requests.get(requestKey) !== controller) return;
    renderSourceHealthWindow(win, payload);
  } catch (error) {
    if (error.name === "AbortError") return;
    renderWindowError(win, "Failed to load Source Health", error.message);
  } finally {
    if (state.requests.get(requestKey) === controller)
      state.requests.delete(requestKey);
  }
}

async function loadAccountHealthWindow(win, force = false) {
  const requestCacheKey = "account_health";
  if (!force && state.cache.has(requestCacheKey)) {
    renderAccountHealthWindow(win, state.cache.get(requestCacheKey));
    return;
  }

  const requestKey = "page:account_health";
  state.requests.get(requestKey)?.abort?.();
  const controller = new AbortController();
  state.requests.set(requestKey, controller);
  const statusEl = win.querySelector('[data-role="status"]');
  if (statusEl) statusEl.textContent = "Loading Account Health...";

  try {
    const response = await fetch("/api/account-health", {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const payload = await response.json();
    state.cache.set(requestCacheKey, payload);
    if (state.requests.get(requestKey) !== controller) return;
    renderAccountHealthWindow(win, payload);
  } catch (error) {
    if (error.name === "AbortError") return;
    renderWindowError(win, "Failed to load Account Health", error.message);
  } finally {
    if (state.requests.get(requestKey) === controller)
      state.requests.delete(requestKey);
  }
}

function clearPageCaches() {
  state.cache.clear();
}

function clearSyncSpotlightCaches() {
  for (const [id, config] of state.spotlights.entries()) {
    if (config.syncMode !== "sync") continue;
    Array.from(state.spotlightCache.keys()).forEach((key) => {
      if (key.startsWith(`${id}::`)) state.spotlightCache.delete(key);
    });
  }
}

function refreshOpenWindows(force = false) {
  if (force) {
    clearPageCaches();
    clearSyncSpotlightCaches();
  }
  getOpenWindows().forEach((win) => {
    if (win.dataset.windowKind === "spotlight") {
      const config = state.spotlights.get(win.dataset.windowId);
      if (!config) return;
      if (force && config.syncMode !== "sync") return;
      loadSpotlightWindow(win.dataset.windowId, force);
      return;
    }
    if (win.dataset.windowKind === "compare") {
      renderCompareWindow(win.dataset.windowId, force);
      return;
    }
    if (win.dataset.windowKind === "bookmarks") {
      renderBookmarksWindow(win.dataset.windowId);
      return;
    }
    if (win.dataset.windowKind === "actions") {
      renderActionBoardWindow(win.dataset.windowId);
      return;
    }
    if (win.dataset.windowKind === "recent") {
      renderRecentWindow(win.dataset.windowId);
      return;
    }
    if (win.dataset.windowKind === "imported_dataset") {
      renderImportedDatasetWindow(win.dataset.windowId);
      return;
    }
    loadPageWindow(win.dataset.pageKey, force);
  });
}

function scheduleRefresh() {
  window.clearTimeout(state.refreshTimer);
  state.refreshTimer = window.setTimeout(() => {
    savePreferences();
    syncShellStatusText();
    refreshOpenWindows(true);
  }, 140);
}

function buildWindowMarkup(page) {
  const taskIcon = page.iconClass.replace("icon-art--", "task-mark--");
  const minWindow =
    page.key === "predictive"
      ? { width: 760, height: 520 }
      : page.key === "retention"
        ? { width: 740, height: 500 }
        : { width: 680, height: 460 };
  return `
    <article class="window" data-window-id="${escapeHtml(page.key)}" data-page-key="${escapeHtml(page.key)}" data-window-kind="page" data-x="${page.rect.x}" data-y="${page.rect.y}" data-w="${page.rect.w}" data-h="${page.rect.h}" data-min-w="${minWindow.width}" data-min-h="${minWindow.height}">
      <div class="titlebar">
        <div class="title-meta">
          <span class="task-mark title-mark ${escapeHtml(taskIcon)}" aria-hidden="true"></span>
          <span>${escapeHtml(page.windowLabel)}</span>
        </div>
        <div class="titlebar-utility">
          <span class="toolbar-label titlebar-status window-status" data-role="status">Waiting to load...</span>
          <div class="titlebar-buttons">
            <button class="toolbar-button toolbar-button--micro" type="button" data-action="reload">Reload</button>
            <button class="toolbar-button toolbar-button--micro" type="button" data-action="compare">Compare</button>
            <button class="toolbar-button toolbar-button--micro" type="button" data-action="add-note">Note</button>
            <button class="toolbar-button toolbar-button--micro" type="button" data-action="add-action">Action</button>
          </div>
          <div class="window-controls">
            <button type="button" data-action="minimize" aria-label="Minimize">_</button>
            <button type="button" data-action="maximize" aria-label="Maximize">[]</button>
            <button type="button" data-action="close" aria-label="Close">x</button>
          </div>
        </div>
      </div>
      <div class="window-content">
        <div class="lab-shell">
          <div class="lab-layout">
            <section class="lab-kpis" data-role="cards"></section>
            <div data-role="narrative"></div>
            <div class="lab-breadcrumb hidden" data-role="breadcrumb"></div>
            <div class="lab-grid">
              <section class="lab-panel">
                <div class="lab-panel-head">
                  <strong data-role="primary-title"></strong>
                  <div class="lab-panel-head-side">
                    <span data-role="primary-meta"></span>
                    <button class="toolbar-button toolbar-button--micro hidden" type="button" data-action="primary-back">Back</button>
                    <button class="toolbar-button toolbar-button--micro spotlight-button" type="button" data-spotlight-action="primary">Spotlight</button>
                  </div>
                </div>
                <div class="lab-plot" data-role="primary-plot"></div>
              </section>
              <section class="lab-panel" data-role="secondary-panel">
                <div class="lab-panel-head">
                  <strong data-role="secondary-title"></strong>
                  <div class="lab-panel-head-side">
                    <span data-role="secondary-meta"></span>
                    <button class="toolbar-button toolbar-button--micro spotlight-button" type="button" data-spotlight-action="secondary">Spotlight</button>
                  </div>
                </div>
                <div class="lab-plot" data-role="secondary-plot"></div>
              </section>
            </div>
            <section class="lab-panel" data-role="table-panel">
              <div class="lab-panel-head">
                <strong data-role="table-title"></strong>
                <div class="lab-panel-head-side">
                  <span data-role="table-meta"></span>
                  <button class="toolbar-button toolbar-button--micro spotlight-button" type="button" data-spotlight-action="table">Spotlight</button>
                </div>
              </div>
              <div data-role="table-body"></div>
            </section>
            <section class="lab-panel detail-panel hidden" data-role="detail-panel">
              <div class="lab-panel-head">
                <strong data-role="detail-title">Detail</strong>
                <div class="lab-panel-head-side">
                  <span data-role="detail-subtitle"></span>
                  <button class="toolbar-button toolbar-button--micro hidden" type="button" data-action="detail-export">Export CSV</button>
                  <button class="toolbar-button toolbar-button--micro spotlight-button hidden" type="button" data-spotlight-action="detail">Spotlight</button>
                </div>
              </div>
              <div class="lab-breadcrumb hidden" data-role="detail-breadcrumb"></div>
              <div data-role="detail-table"></div>
            </section>
            <section class="lab-panel lab-annotations">
              <div class="lab-panel-head">
                <strong>Annotations</strong>
                <div class="lab-annotation-head">
                  <span>Short notes pinned to this page.</span>
                </div>
              </div>
              <div data-role="annotations"></div>
            </section>
          </div>
        </div>
      </div>
      ${resizeDirections.map((direction) => `<div class="window-resize-handle" data-resize-direction="${direction}"></div>`).join("")}
    </article>
  `;
}

function renderDesktop() {
  elements.icons.innerHTML = DESKTOP_PAGES.map(
    (page) => `
    <button class="desktop-icon" type="button" data-window="${escapeHtml(page.key)}" aria-label="${escapeHtml(page.windowLabel)}">
      <span class="icon-art ${escapeHtml(page.iconClass)}" aria-hidden="true"></span>
      <span class="desktop-icon-label">${escapeHtml(page.desktopLabel)}</span>
    </button>
  `,
  ).join("");
  elements.windowsLayer.innerHTML =
    DESKTOP_PAGES.map(buildWindowMarkup).join("");
  elements.tasks.innerHTML = DESKTOP_PAGES.map((page) =>
    createTaskButtonHtml(
      page.key,
      page.windowLabel,
      page.iconClass.replace("icon-art--", "task-mark--"),
    ),
  ).join("");

  elements.icons
    .querySelectorAll("[data-window]")
    .forEach((button) =>
      button.addEventListener("click", () => openWindow(button.dataset.window)),
    );
  elements.tasks
    .querySelectorAll("[data-task]")
    .forEach((button) => bindTaskButton(button));
  elements.windowsLayer.querySelectorAll(".window").forEach((win) => {
    win
      .querySelector('[data-action="reload"]')
      .addEventListener("click", () => {
        if (win.dataset.windowKind === "spotlight")
          loadSpotlightWindow(win.dataset.windowId, true);
        else loadPageWindow(win.dataset.pageKey, true);
      });
    win
      .querySelector('[data-action="compare"]')
      .addEventListener("click", () => openCompareWindow(win.dataset.pageKey));
    win
      .querySelector('[data-action="add-note"]')
      .addEventListener("click", () => {
        const note = window.prompt(
          `Add a note for ${pageByKey(win.dataset.pageKey)?.windowLabel || win.dataset.pageKey}`,
        );
        if (!note || !note.trim()) return;
        addAnnotation(
          win.dataset.pageKey,
          note.trim(),
          pageByKey(win.dataset.pageKey)?.windowLabel || win.dataset.pageKey,
        );
        if (win._payload) {
          windowRefs(win).annotations.innerHTML = renderAnnotations(
            win.dataset.pageKey,
          );
        }
      });
    win
      .querySelector('[data-action="add-action"]')
      .addEventListener("click", () => {
        const payload = win._payload;
        const detailPanel = win.querySelector('[data-role="detail-panel"]');
        const contextTitle =
          detailPanel?.dataset.detailTitle ||
          payload?.summary?.[0] ||
          `${pageByKey(win.dataset.pageKey)?.windowLabel || win.dataset.pageKey} follow-up`;
        const notes =
          detailPanel?.dataset.detailSubtitle ||
          payload?.summary?.[1] ||
          payload?.interaction_hint ||
          "";
        createContextAction(win.dataset.pageKey, contextTitle, { notes });
        openActionBoardWindow();
      });
    win
      .querySelector('[data-action="minimize"]')
      .addEventListener("click", () => minimizeWindow(win));
    win
      .querySelector('[data-action="maximize"]')
      .addEventListener("click", () => toggleMaximize(win));
    win
      .querySelector('[data-action="close"]')
      .addEventListener("click", () => closeWindow(win));
    win
      .querySelector(".titlebar")
      .addEventListener("pointerdown", (event) => startDrag(event, win));
    win
      .querySelectorAll(".window-resize-handle")
      .forEach((handle) =>
        handle.addEventListener("pointerdown", (event) =>
          startResize(event, win, handle.dataset.resizeDirection),
        ),
      );
  });
  syncTasks();
}

function applyWindowTheme(themeKey) {
  state.windowTheme = WINDOW_THEMES[themeKey] ? themeKey : "glass";
  elements.desktop.dataset.windowTheme = state.windowTheme;
  document.body.dataset.windowTheme = state.windowTheme;
  if (elements.windowTheme) elements.windowTheme.value = state.windowTheme;
  savePreferences();
  getOpenWindows().forEach((win) => {
    if (win.dataset.windowKind === "spotlight")
      loadSpotlightWindow(win.dataset.windowId, false);
    else if (win.dataset.windowKind === "compare")
      renderCompareWindow(win.dataset.windowId, true);
    else if (win.dataset.windowKind === "bookmarks")
      renderBookmarksWindow(win.dataset.windowId);
    else if (win.dataset.windowKind === "actions")
      renderActionBoardWindow(win.dataset.windowId);
    else if (win.dataset.windowKind === "recent")
      renderRecentWindow(win.dataset.windowId);
    else if (win.dataset.windowKind === "imported_dataset")
      renderImportedDatasetWindow(win.dataset.windowId);
    else loadPageWindow(win.dataset.pageKey, false);
  });
}

function syncGranularityPills() {
  elements.granularityPills
    .querySelectorAll("[data-granularity]")
    .forEach((button) =>
      button.classList.toggle(
        "active",
        button.dataset.granularity === state.filters.granularity,
      ),
    );
}

function bindTopControls() {
  elements.desktopToggle.addEventListener("click", toggleDesktopWorkspace);
  elements.openGuide?.addEventListener("click", openGuidePanel);
  elements.workspaceMenuToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = !elements.workspaceMenu?.classList.contains("hidden");
    setWorkspaceMenu(!isOpen);
  });
  elements.saveBookmark?.addEventListener("click", () => {
    setWorkspaceMenu(false);
    const name =
      window.prompt("Bookmark name", `Workspace ${formatStamp(isoNow())}`) ||
      "";
    if (!name.trim()) return;
    state.bookmarks.unshift(captureWorkspaceSnapshot(name.trim()));
    persistBookmarks();
    openBookmarksWindow();
  });
  elements.openRecent?.addEventListener("click", () => {
    setWorkspaceMenu(false);
    openRecentWindow();
  });
  elements.openBookmarks?.addEventListener("click", () => {
    setWorkspaceMenu(false);
    openBookmarksWindow();
  });
  elements.openActions?.addEventListener("click", () => {
    setWorkspaceMenu(false);
    openActionBoardWindow();
  });
  elements.lockWorkspace?.addEventListener("click", lockWorkspace);
  document.addEventListener("click", (event) => {
    if (!elements.workspaceMenu || !elements.workspaceMenuToggle) return;
    if (elements.workspaceMenu.classList.contains("hidden")) return;
    const target = event.target;
    if (
      target instanceof Node &&
      !elements.workspaceMenu.contains(target) &&
      !elements.workspaceMenuToggle.contains(target)
    ) {
      setWorkspaceMenu(false);
    }
  });
  elements.granularityPills
    .querySelectorAll("[data-granularity]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        state.filters.granularity = button.dataset.granularity;
        syncGranularityPills();
        scheduleRefresh();
      });
    });
  elements.scenario.addEventListener("change", () => {
    state.filters.scenarioMode = elements.scenario.value;
    scheduleRefresh();
  });
  elements.category?.addEventListener("change", () => {
    state.filters.categories = elements.category.value
      ? [elements.category.value]
      : [];
    scheduleRefresh();
  });
  elements.city?.addEventListener("change", () => {
    state.filters.cities = elements.city.value ? [elements.city.value] : [];
    scheduleRefresh();
  });
  elements.windowTheme.addEventListener("change", () =>
    applyWindowTheme(elements.windowTheme.value),
  );
}

async function loadMeta() {
  const response = await fetch("/api/meta/filters");
  if (!response.ok) throw new Error(`Metadata failed (${response.status})`);
  state.meta = await response.json();
  hydrateFilterSelect(
    elements.category,
    state.meta.categories || [],
    "All categories",
  );
  hydrateFilterSelect(elements.city, state.meta.cities || [], "All cities");
  state.filters.startDate =
    state.filters.startDate || state.meta.default_start_date;
  state.filters.endDate = state.filters.endDate || state.meta.default_end_date;
  normalizeTopbarSelections();
  elements.startDate.value = displayDate(state.filters.startDate);
  elements.endDate.value = displayDate(state.filters.endDate);
  syncGlobalFilterSelects();
  elements.scenario.value = state.filters.scenarioMode || "Base";
  syncGranularityPills();
  syncShellStatusText();
}

async function init() {
  loadPreferences();
  loadOnboardingState();
  const preset = applyQueryPreset();
  loadSourceConnections();
  loadSourceDrafts();
  loadWorkspaceCollections();
  elements.desktop.dataset.windowTheme = state.windowTheme;
  document.body.dataset.windowTheme = state.windowTheme;
  if (elements.windowTheme) elements.windowTheme.value = state.windowTheme;
  if (elements.scenario) elements.scenario.value = state.filters.scenarioMode;
  renderDesktop();
  renderOnboarding();
  bindLoginScreen();
  bindPointerInteractions();
  bindTopControls();
  try {
    await loadMeta();
  } catch (error) {
    elements.status.textContent = error.message;
    elements.taskbarMessage.textContent =
      "Metadata failed. Reload the page to retry.";
    return;
  }
  bindDatePickers();
  applyWindowTheme(state.windowTheme);
  if (elements.startDate)
    elements.startDate.value = displayDate(state.filters.startDate);
  if (elements.endDate)
    elements.endDate.value = displayDate(state.filters.endDate);
  syncGlobalFilterSelects();
  syncGranularityPills();
  syncShellStatusText();
  renderOnboarding();
  if (preset.openPages.length) {
    window.setTimeout(() => {
      preset.openPages.forEach((pageKey) => openWindow(pageKey));
      if (preset.maximizePage) {
        const target = document.querySelector(
          `.window[data-window-id="${preset.maximizePage}"]`,
        );
        if (target && !target.classList.contains("is-maximized"))
          toggleMaximize(target);
      }
    }, 240);
  }
  syncClock();
  window.setInterval(syncClock, 30000);
}

document.addEventListener("DOMContentLoaded", init);
