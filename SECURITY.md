# Security Policy

This is a public portfolio repository, not a production SaaS application.

Even so, security issues should be handled responsibly.

## Reporting A Vulnerability

- Do not open a public issue with exploit details.
- Use GitHub private vulnerability reporting if it is enabled for this
  repository.
- If private reporting is not available, contact the repository owner through
  GitHub before disclosing technical details publicly.

## Scope

Security-sensitive areas in this repository include:

- API surface in `nextgen_dashboard/backend/`
- local agent mutation flow
- static asset serving
- environment variable handling
- sample infrastructure and SQL setup scripts

## Additional Documentation

For implementation hardening already applied in this repository, see:

- [docs/AI_AGENT_SECURITY.md](./docs/AI_AGENT_SECURITY.md)
- [docs/QUALITY_GATES.md](./docs/QUALITY_GATES.md)
