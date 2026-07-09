const views = {
  "account-health": {
    kicker: "Operational priority",
    title: "Account Health",
    tag: "Multi-source watchlist",
    image: "assets/gallery/desktop-account-health.png",
    alt: "Account Health dashboard watchlist combining CRM, billing, support, and ecommerce signals",
    question: "Who needs follow-up first?",
    copy: "CRM, billing, support, and ecommerce signals are consolidated into one account-level priority queue.",
    facts: [["Decision", "Prioritize owner follow-up"], ["Signals", "Risk tier, balance, tickets"], ["Output", "Explainable watchlist"]],
  },
  "sales-overview": {
    kicker: "Revenue decision",
    title: "Sales Overview",
    tag: "Revenue and concentration",
    image: "assets/gallery/desktop-sales-overview.png",
    alt: "Sales Overview with revenue trends and category Pareto analysis",
    question: "Where is revenue concentrated?",
    copy: "Revenue, order volume, average ticket, and Pareto concentration appear together for a faster commercial read.",
    facts: [["Decision", "Focus the revenue mix"], ["Signals", "Net sales, orders, category share"], ["Output", "Pareto drilldown"]],
  },
  "source-health": {
    kicker: "Data reliability",
    title: "Source Health",
    tag: "Governed ingestion",
    image: "assets/gallery/desktop-source-health.png",
    alt: "Source Health showing registered loads, duplicate checks, and null profiling",
    question: "Can this source support BI?",
    copy: "Load metadata, duplicate-key checks, and null profiling are visible before the data is promoted into analytics models.",
    facts: [["Decision", "Promote or repair a source"], ["Signals", "Loads, duplicates, nulls"], ["Output", "Source reliability view"]],
  },
  "predictive-outlook": {
    kicker: "Forward view",
    title: "Predictive Outlook",
    tag: "Scenario comparison",
    image: "assets/gallery/desktop-predictive-outlook.png",
    alt: "Predictive Outlook showing forecast scenarios and next-step watchlist",
    question: "What changes under each scenario?",
    copy: "Base, conservative, and upside scenarios translate the warehouse signals into a concrete next-step watchlist.",
    facts: [["Decision", "Plan the next commercial move"], ["Signals", "Forecast range, category shift"], ["Output", "Scenario watchlist"]],
  },
};

const image = document.querySelector("#demo-image");
const kicker = document.querySelector("#view-kicker");
const title = document.querySelector("#view-title");
const tag = document.querySelector("#view-tag");
const contextTitle = document.querySelector("#context-title");
const contextCopy = document.querySelector("#context-copy");
const contextFacts = document.querySelector("#context-facts");
const buttons = document.querySelectorAll("[data-view]");

function renderFacts(facts) {
  contextFacts.replaceChildren(...facts.map(([label, value]) => {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    row.append(term, description);
    return row;
  }));
}

function selectView(key) {
  const view = views[key];
  if (!view) return;

  image.src = view.image;
  image.alt = view.alt;
  kicker.textContent = view.kicker;
  title.textContent = view.title;
  tag.textContent = view.tag;
  contextTitle.textContent = view.question;
  contextCopy.textContent = view.copy;
  renderFacts(view.facts);

  buttons.forEach((button) => {
    const active = button.dataset.view === key;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

buttons.forEach((button) => {
  button.addEventListener("click", () => selectView(button.dataset.view));
});
