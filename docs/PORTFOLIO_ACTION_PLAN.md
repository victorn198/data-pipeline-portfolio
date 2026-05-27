# Portfolio Action Plan

This file is intentionally focused on the work that only the repository owner
can complete. The codebase can be improved by automation, but employability
also depends on public proof, positioning, and consistency.

## What Has Already Been Improved In The Repo

- recruiter-facing `README.md` and `README.pt.md`
- clearer `nextgen_dashboard/README.md`
- API smoke tests for the web dashboard
- project now positioned as end-to-end analytics engineering, not only a final BI report
- multi-source analytics expansion roadmap in
  `docs/MULTI_SOURCE_ANALYTICS_ROADMAP.md`
- registered source ingestion, Source Health, and Account Health are now
  implemented
- portfolio screenshots, interactive GIF, and WebM demo are now available in
  `assets/gallery/`

## Next Technical Expansion

The next highest-value technical direction is not to claim universal ingestion
or to turn the portfolio into a GTM/prospecting product. It is to add a
governed multi-source foundation for the company data families analysts most
often handle: files, relational tables, REST APIs, SaaS-style business
extracts, events/logs, and operational reference tables.

Recommended first slice:

- add a source registry
- add CSV and JSON loaders into `raw`
- store load metadata and profiling output
- add one dbt staging model for a new source
- preserve existing ecommerce metrics and dashboard behavior

This keeps the project employability-focused: SQL, Python, dbt, data quality,
semantic BI, and a clear company analytics workflow.

## What Only You Can Do

### 1. Publish a Public Demo

Without a live demo, recruiters must trust screenshots. That is weaker.

Your task:

- deploy the FastAPI dashboard to a public URL
- verify the URL works on desktop and mobile
- add that link to the repository header and CV

Recommended output:

- one public app URL
- one GitHub repo URL

### 2. Capture Final Visual Proof

Status: done for repository-level proof.

Current outputs:

- screenshots in `assets/gallery/`
- interactive demo video: `assets/gallery/nextgen-demo.webm`
- interactive preview GIF: `assets/gallery/nextgen-demo.gif`
- step captures in `assets/gallery/interactive-steps/`

Optional remaining visual proof:

- capture dbt docs lineage if you decide to publish dbt docs
- capture a BI model/report only if you want external BI tooling to be central in
  the application narrative

### 3. Update Your Resume

Only you can decide what you are comfortable claiming professionally.

Your task:

- add a `Projects` section
- include this repository as a featured project
- keep only claims you can defend in interview
- fix the English CV so there is no mixed-language residue

Suggested bullets:

- Built an end-to-end analytics platform with Python, PostgreSQL, dbt, FastAPI, and a custom BI interface, modeling 100K real retail transaction lines across 4K+ customers and 3K+ products.
- Developed dbt models, snapshots, SQL quality checks, and operational monitoring views to support reliable BI reporting.
- Created an API-first multi-page analytics dashboard with period-over-period KPIs, drilldown analysis, and shared filters across business views.

### 4. Update LinkedIn And GitHub Positioning

Even a strong project underperforms if your public profile is generic.

Your task:

- pin this repository on GitHub
- add the project link to LinkedIn featured section
- rewrite your headline to reflect analytics delivery, not just job title
- rewrite your About section with 3 themes:
  - analytics engineering
  - BI and business storytelling
  - automation with Python and SQL

### 5. Prepare Interview Narratives

This project will only help if you can explain it cleanly.

Your task:

- prepare a 60-second explanation of the project
- prepare a 3-minute technical walkthrough
- prepare 3 tradeoff examples:
  - why dbt was used
  - why FastAPI plus custom frontend replaced Streamlit
  - how you handled data quality and monitoring

### 6. Run A Targeted Application Process

Random applications will waste this project.

Your task:

- target roles such as:
  - Data Analyst
  - BI Analyst
  - Analytics Engineer Junior
  - Product/Data Operations Analyst
- prioritize companies asking for:
  - SQL
  - Custom BI dashboarding
  - Python
  - ETL or dbt
  - dashboards and stakeholder reporting
- avoid roles that require deep ML production experience if that is not your profile yet

### 7. Collect Real Evidence From Your Current Work

Recruiters trust quantified impact more than tool lists.

Your task:

- write down 5 to 10 concrete results from your current or previous work
- quantify them if possible:
  - time saved
  - dashboards delivered
  - stakeholders served
  - manual tasks automated
  - reporting frequency improved

## Recommended 14-Day Execution

### Days 1-3

- deploy the app
- verify the published README renders the GIF/video links correctly
- add the public demo and repository links to CV and LinkedIn

### Days 4-6

- rewrite both resumes
- update LinkedIn and GitHub

### Days 7-10

- apply to a focused batch of remote roles
- send tailored messages to recruiters or hiring managers

### Days 11-14

- practice project walkthrough
- refine weak parts of the pitch based on application feedback

## Where Codex Can Help Next

After you complete the user-only items above, the next highest-value tasks I can
do are:

- rewrite both resumes in full
- create LinkedIn headline and About options
- draft application messages for remote jobs and freelance leads
- improve specific dashboard pages to strengthen the portfolio story

Current application copy is centralized in
`docs/APPLICATION_MATERIAL.md`.

The short demo walkthrough is centralized in `docs/DEMO_SCRIPT.md`.
