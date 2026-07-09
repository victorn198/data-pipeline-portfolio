# Data Pipeline Portfolio

[English](./README.md) | [Português](./README.pt.md)

[![Qualidade do portfólio](https://github.com/victorn198/data-pipeline-portfolio/actions/workflows/quality.yml/badge.svg)](https://github.com/victorn198/data-pipeline-portfolio/actions/workflows/quality.yml)

![Social preview](./assets/social-preview.png)

Um produto analítico ponta a ponta que transforma sinais de ecommerce, CRM,
billing, suporte e marketing em decisões de receita, retenção e saúde de contas.

Construído com `Python`, `PostgreSQL`, `dbt`, `FastAPI` e uma interface de BI
desktop-first. O repositório funciona como estudo de caso do fluxo completo:
da ingestão de fontes às métricas confiáveis e às telas de investigação.

> **Transparência do portfólio:** a camada de ecommerce usa uma amostra pública
> do UCI Online Retail. Os registros de CRM, billing, suporte e marketing são
> dados sintéticos criados para este estudo. Nenhum dado de cliente foi incluído.

**Explore a demonstração pública:** [tour do NextGen Analytics Desktop](https://victorn198.github.io/data-pipeline-portfolio/) | [demonstração do produto em 90 segundos](./assets/gallery/nextgen-demo.webm) | [roteiro guiado](./docs/DEMO_SCRIPT.md)

## O que este projeto comprova

- `100.000` transações públicas de varejo, com `4.151` clientes e `3.379` produtos
- fluxo governado `raw -> staging -> marts -> API semântica -> BI`, com testes e snapshots em dbt
- análises de receita, Pareto/ABC, RFM, retenção, previsão, qualidade de fontes e saúde de contas
- investigação operacional que une CRM, billing, suporte e ecommerce em uma watchlist acionável

## Demonstração do Produto

### Account Health

<img src="./assets/gallery/desktop-account-health.png" alt="Account Health combinando sinais de CRM, billing, suporte e ecommerce" width="900">

O caso de negócio principal: identificar quais contas precisam de atenção, por
que precisam e qual sinal operacional está elevando a prioridade.

### Decisões de Receita e Produto

<img src="./assets/gallery/desktop-sales-overview.png" alt="Sales Overview com tendências de receita e análise Pareto por categoria" width="900">

Receita, volume de pedidos, ticket médio e concentração Pareto aparecem na
mesma visão de decisão, sem depender de páginas de dashboard desconectadas.

### Saúde das Fontes

<img src="./assets/gallery/desktop-source-health.png" alt="Source Health com cargas registradas, chaves duplicadas e profiling de nulos" width="900">

A camada de fontes torna metadados de carga, checagens de duplicidade e
profiling de nulos visíveis antes de promover os dados para os modelos de BI.

### Fluxo de Investigação

<img src="./assets/gallery/desktop-workflow.png" alt="Fluxo de investigação entre Sales Overview, Predictive Outlook e Account Health" width="900">

<img src="./assets/gallery/nextgen-demo.gif" alt="Demo curta do desktop analítico NextGen" width="900">

O GIF acima é a prévia compatível com o navegador. A gravação interativa completa está disponível para [download em WebM](./assets/gallery/nextgen-demo.webm).

## Escopo Técnico

- ingestão de fontes `CSV`/`JSON`/`API`, profiling e mapeamento sugerido no app
- warehouse em dbt com camadas `raw`, staging, marts, testes e snapshot
- definições semânticas de métricas e entrega analítica via FastAPI
- recursos de investigação: `Data Center`, `Spotlight`, `Compare`, `Bookmarks`, `Recent` e `Action Board`

## Referências do Case de Account Health

- [Account Health Case Study](./docs/ACCOUNT_HEALTH_CASE_STUDY.md)
- [Demo Script](./docs/DEMO_SCRIPT.md)
- mart dbt: `dbtproject/models/marts/mart_account_health.sql`
- endpoint de API: `GET /api/account-health`

## Arquitetura

<img src="./assets/diagrams/architecture-overview.png" alt="Arquitetura analítica do projeto" width="900">

## Estrutura de warehouse

<img src="./assets/diagrams/warehouse-model.png" alt="Modelo de warehouse e camadas do banco derivadas do repositório" width="900">

A imagem acima é derivada da estrutura do repositório, não de uma GUI de banco
em tempo real. Mantive assim para preservar o desenho técnico mesmo quando o
banco local não está rodando.

## Métodos analíticos incluídos

- comparação entre períodos com alinhamento de bordas parciais
- análise de concentração com Pareto e `ABC`
- segmentação de clientes com `RFM`
- cohorts de retenção
- detecção de anomalias e mudança estrutural
- cenários preditivos: `Base`, `Conservative`, `Upside`
- drilldown até os membros subjacentes

## Recursos de produto incluídos

- navegação desktop com janelas e taskbar
- janela `Data Center` com biblioteca de conectores, seleção de fontes, rascunhos de conexão e analise local de CSV/JSON sem programacao
- janela `Imported Dataset` com qualidade, mapeamento sugerido, auto view, perfil de colunas e amostra isolada dos KPIs oficiais
- `Spotlight` com filtros locais e contexto congelado
- `Compare` para investigação lado a lado
- `Bookmarks` para restaurar workspaces
- `Recent` e `Action Board`
- exportação CSV de detalhes e comparações
- temas visuais dentro do shell desktop
- janela `Source Health` para auditoria e profiling das fontes registradas
- janela `Account Health` para análise operacional de contas e risco de cliente

## Início rápido

### Pré-requisitos

- Python `3.10+`
- Docker Desktop ou PostgreSQL local

### Windows: rodar a demonstração completa

```powershell
.\scripts\run-demo.ps1
```

O script cria o ambiente virtual e o perfil dbt quando faltarem, inicia o
PostgreSQL, carrega as fontes, constrói e testa o warehouse, e abre a jornada
de Account Health. Nas execuções seguintes, use `-SkipInstall` para não
reinstalar as dependências.

### Execução manual

```bash
cp .env.example .env
cp dbtproject/profiles.yml.example dbtproject/profiles.yml
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip setuptools
pip install -r requirements.txt -c constraints.txt
docker compose up -d
python scripts/loadsampledata.py --mode full_refresh
python scripts/load_registered_sources.py
cd dbtproject
export DBT_PROFILES_DIR=$(pwd)
dbt deps
dbt run --full-refresh
dbt snapshot
dbt test
cd ..
python -m uvicorn nextgen_dashboard.backend.main:app --reload --port 8601
```

Acesse `http://127.0.0.1:8601`

## Qualidade e segurança

```bash
.\scripts\verify-portfolio.ps1
```

Acrescente `-IncludeWarehouse` depois de preparar a demo local para executar os
testes dbt também.

Hardening aplicado:

- CORS explícito
- mutações de agente desligadas por padrão
- token para mutações quando habilitadas
- allowlist de assets estáticos
- escrita atômica do estado governado

Veja:

- [AI Agent Security](./docs/AI_AGENT_SECURITY.md)
- [Quality Gates](./docs/QUALITY_GATES.md)
- [SECURITY.md](./SECURITY.md)

## Transparência sobre IA

Eu usei IA durante implementação e revisão, e isso está explícito.

A IA ajudou com:

- trabalho repetitivo de implementação
- iteração de UI
- refatoração e limpeza
- expansão de testes
- rascunho de documentação
- apoio em review de segurança

A IA não definiu direção de produto, framing de negócio, critérios de aceite ou
revisão final. Essas decisões continuaram manuais.

Mais detalhe: [AI Collaboration Disclosure](./docs/AI_COLLABORATION_DISCLOSURE.md)

## Guia rápido do repositório

- `fivetran_simulator/`: simuladores de ingestão e geração de amostra
- `fivetran_simulator/source_registry.yml`: contratos governados de fontes em arquivo
- `dbtproject/models/`: transformações do warehouse
- `dbtproject/tests/`: testes SQL
- `nextgen_dashboard/`: backend FastAPI e frontend desktop
- `scripts/setup_*.sql`: monitoramento e objetos operacionais
- `scripts/benchmark_dashboard.py`: benchmark do dashboard
- `assets/gallery/`: screenshots reais e capturas de demo do projeto
- `assets/diagrams/`: visuais de arquitetura e warehouse

## Documentação útil

- [GitHub Repository Setup](./docs/GITHUB_REPOSITORY_SETUP.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Data Lineage](./docs/DATA_LINEAGE.md)
- [Multi-Source Analytics Roadmap](./docs/MULTI_SOURCE_ANALYTICS_ROADMAP.md)
- [Business Source Decision](./docs/BUSINESS_SOURCE_DECISION.md)
- [dbt Models](./docs/DBT_MODELS.md)
- [Measure Dictionary](./docs/MEASURE_DICTIONARY.md)
- [Predictive Outlook Method](./docs/PREDICTIVE_OUTLOOK_METHOD.md)
- [Statistical Analytics Stack](./docs/STATISTICAL_ANALYTICS_STACK.md)
