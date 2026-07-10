# Power BI API Portfolio

Projeto simples de BI com dados públicos da GitHub API.

## Arquitetura

```text
GitHub API -> Python -> PostgreSQL -> view SQL -> Power BI
```

## Objetivo

Demonstrar um fluxo completo e reproduzível de ingestão, tratamento SQL e
consumo analítico no Power BI.

## Escopo inicial

- coletar repositórios públicos de um usuário ou organização;
- armazenar os dados brutos no PostgreSQL;
- preparar uma view analítica para o Power BI;
- acompanhar repositórios, issues, pull requests e atividade mensal;
- validar os indicadores com queries SQL simples.

## Estrutura

```text
powerbi-api-portfolio/
├── data/
├── powerbi/
├── sql/
│   ├── 001_schema.sql
│   ├── 002_powerbi_view.sql
│   └── 003_validation_queries.sql
├── src/
│   └── ingest_github.py
├── scripts/
│   └── setup.ps1
├── docker-compose.yml
├── .env.example
└── README.md
```

## Executar localmente

Pré-requisitos: Docker Desktop e Python instalados.

```powershell
cd D:\projects\data-pipeline-portfolio-presentation\powerbi-api-portfolio
.\scripts\setup.ps1
```

O script cria o ambiente Python, sobe PostgreSQL, cria o schema, coleta os
repositórios e cria a view para o Power BI. Antes da execução, revise
`.env`, principalmente `GITHUB_OWNER`.

## Conexão no Power BI

Use o conector PostgreSQL com:

- servidor: `localhost:5434`;
- banco: `github_bi`;
- schema: `mart`;
- tabela/view: `vw_powerbi_repositories`.

As medidas iniciais estão em `powerbi/measures.dax`. O arquivo do relatório
deve ser salvo em `powerbi/`.
