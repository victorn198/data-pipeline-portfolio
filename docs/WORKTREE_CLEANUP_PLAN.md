# Worktree Cleanup Plan

This file maps the current local worktree so cleanup can happen deliberately
instead of through a risky bulk reset.

Review date: 2026-03-30
Repository: `D:\projects\data-pipeline-portfolio`

## Current Change Inventory By Area

- `.github`: 1
- `dbtproject`: 12
- `docs`: 10
- `fivetran_simulator`: 3
- `scripts`: 9
- `assets`: 2
- `mcp_tools`: 1
- `tools`: 1
- root files and tests: multiple

## Recommended Cleanup Order

### 1. Documentation Triage

Files involved:

- `docs/ARCHITECTURE.md`
- `docs/DATA_LINEAGE.md`
- `docs/DEPLOYMENT.md`
- `docs/ZED_REOPEN_CHECKLIST.md`
- plus new private planning docs

Goal:

- keep portfolio-facing docs
- separate private notes from publishable docs
- remove outdated setup or one-off operational notes from the public path if needed

### 2. dbt And Warehouse Changes

Files involved:

- `dbtproject/dbt_project.yml`
- models in `staging`, `intermediate`, and `marts`
- snapshot and SQL test files

Goal:

- decide whether these reflect the intended warehouse state
- run dbt validation before any future commit
- avoid mixing half-finished warehouse refactors with portfolio packaging commits

### 3. Simulator And Data Loading Scripts

Files involved:

- `fivetran_simulator/*`
- `scripts/loadsampledata.py`
- `scripts/run_pipeline.sh`
- data-quality setup SQL scripts

Goal:

- keep only scripts that support the current repo story
- remove obsolete or duplicated script paths
- verify names and paths are still accurate

### 4. Old Or Orphaned Files

Files involved:

- deleted `scripts/setup_snowflake.sql`
- deleted `test_snowflake.py`
- deleted `scripts/scripts/loadsampledata.py`
- untracked `test_postgres.py`
- untracked `AGENTS.md`
- untracked `tools/`
- untracked `assets/design_refs/`
- untracked `assets/prompts/`

Goal:

- decide which are private support files versus real repo content
- avoid accidental publication of design references, prompts, or abandoned setup files

### 5. CI And Dependency Review

Files involved:

- `.github/workflows/dbt_run.yml`
- `requirements.txt`
- `mcp_tools/mcp_server_fastapi.py`

Goal:

- keep CI aligned with the repo story
- avoid shipping dependencies that exist only for local experiments

## Safe Working Method

Use this order for the actual cleanup round:

1. review one area at a time
2. validate technically before committing
3. commit by theme, not by date
4. do not use bulk revert commands on the whole repository

## Suggested Commit Split For A Future Cleanup

1. `Clean portfolio-facing docs and setup guidance`
2. `Finalize dbt and simulator changes`
3. `Remove obsolete files and local-only artifacts`
4. `Align CI and dependencies with current project scope`

## What Should Stay Separate From Cleanup

Do not mix these with the broader worktree cleanup:

- portfolio packaging changes already published
- private launch planning docs
- social preview adjustments
- profile and LinkedIn copy
