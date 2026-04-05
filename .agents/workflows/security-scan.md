---
description: Perform a security audit of the project — secrets, dependencies, headers, SQL
---

# /security-scan — Security Audit

Comprehensive security review inspired by ECC AgentShield, adapted for this project.

## 1. Secrets Check

Ensure no secrets are committed:

```powershell
git log --all -p -- "*.env" "*.key" "*.pem" "*.token" | Select-String -Pattern "(password|secret|token|api_key)" -CaseSensitive:$false
```

Verify `.gitignore` blocks `.env*` (except `.env.example`).

## 2. Dependency Audit

Check for known vulnerabilities in Python dependencies:

```powershell
venv\Scripts\pip.exe audit 2>$null; if ($LASTEXITCODE -ne 0) { Write-Output "pip-audit not installed, skipping" }
```

## 3. SQL Injection Review

Search for f-string or format-string SQL:

```
grep -rn "f\".*SELECT\|f\".*INSERT\|f\".*UPDATE\|f\".*DELETE\|\.format.*SELECT" nextgen_dashboard/ mcp_tools/ scripts/
```

All SQL must use parameterized queries.

## 4. XSS Review

Check frontend files for raw `innerHTML` without `escapeHTML()`:

```
grep -rn "innerHTML" nextgen_dashboard/frontend/
```

All user-controlled content must be escaped.

## 5. Authentication & Authorization

Verify:
- [ ] Agent mutation endpoints require `NEXTGEN_AGENT_TOKEN` (check `_require_agent_mutation_access`)
- [ ] MCP SQL API requires `MCP_API_TOKEN` when set (check `_require_mcp_auth`)
- [ ] CORS origins are explicitly allowlisted (not `*`)

## 6. HTTP Security Headers

Verify these headers are set in `main.py`:
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `Referrer-Policy: same-origin`
- [ ] `Content-Security-Policy`
- [ ] `Permissions-Policy`

## 7. Rate Limiting

Verify rate limiter is active:
- [ ] `rate_limit_middleware` exists in `main.py`
- [ ] Default: 120 req/min per IP

## 8. Report

Summarize findings as: CRITICAL / WARNING / INFO with recommendations.
