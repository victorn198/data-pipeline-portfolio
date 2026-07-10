# Power BI report

`OpenSourceLandscape/` is a source-controlled PBIP project generated from the
report specification and PostgreSQL semantic model.

```powershell
node ..\scripts\generate_pbip.mjs
powerbi-report-author validate OpenSourceLandscape\OpenSourceLandscape.Report
```

Open `OpenSourceLandscape/OpenSourceLandscape.pbip`, refresh the model and use
the local PostgreSQL credentials configured in the project `.env` file.
