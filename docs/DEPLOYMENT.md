# Guia de Deployment

Guia de deploy para a versao PostgreSQL do projeto.

## 1. CI do pipeline com GitHub Actions

O workflow ja existe em `.github/workflows/dbt_run.yml`.
Ele sobe um PostgreSQL de servico no job e executa:
- carga RAW
- `dbt run`
- `dbt snapshot`
- `dbt test`

### Como usar

1. Suba o codigo para o GitHub.
2. Garanta que o workflow esta habilitado para `main`.
3. Opcional: adicione gatilho por horario.

Exemplo de schedule diario (UTC):

```yaml
on:
  schedule:
    - cron: '0 1 * * *'
```

## 2. Deploy do servidor FastAPI (opcional)

Se quiser expor o endpoint SQL para consultas read-only:

1. Crie um web service (Render, Railway, etc).
2. Build command:
- `pip install -r requirements.txt`
3. Start command:
- `uvicorn mcp_tools.mcp_server_fastapi:app --host 0.0.0.0 --port $PORT`
4. Variaveis de ambiente obrigatorias:
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

## 3. Checklist de producao

- Rodar `dbt test` com sucesso antes de publicar.
- Confirmar latencia e volume de consulta no dashboard proprio.
- Monitorar `monitoring.vw_pipeline_operational_kpis` diariamente.
- Revisar politicas de backup e retention do PostgreSQL.
