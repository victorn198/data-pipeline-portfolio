# Guia de Configuração do Projeto de Pipeline de Dados

Este documento fornece um guia passo a passo para configurar e executar este projeto, garantindo uma conexão bem-sucedida com o Snowflake e o uso correto dos scripts.

## 1. Pré-requisitos

- **Python 3.9+**: Certifique-se de que uma versão compatível do Python esteja instalada.
- **Conta Snowflake**: Você precisa de uma conta Snowflake ativa com um usuário, senha e acesso a um warehouse, banco de dados e schema.

## 2. Instalação

Primeiro, configure um ambiente virtual Python para isolar as dependências do projeto.

```bash
# Crie um ambiente virtual na pasta do projeto
python -m venv venv

# Ative o ambiente virtual
# No Windows:
.\venv\Scripts\activate
# No macOS/Linux:
# source venv/bin/activate
```

Com o ambiente ativado, instale os pacotes Python necessários:

```bash
pip install -r requirements.txt
```

## 3. Configuração (Passo Crítico)

O projeto foi padronizado para usar um único arquivo `.env` para gerenciar todas as credenciais e configurações.

**3.1. Crie o arquivo `.env`**

Na pasta principal do projeto, crie um arquivo chamado exatamente `.env`.

**3.2. Adicione as Variáveis de Configuração**

Copie o modelo abaixo para o seu arquivo `.env` e substitua os valores de exemplo pelas suas credenciais reais.

```env
# --- Conexão Snowflake ---
SNOWFLAKE_ACCOUNT="seu_identificador_de_conta"
SNOWFLAKE_USER="seu_usuario_snowflake"
SNOWFLAKE_PASSWORD="sua_senha_snowflake"
SNOWFLAKE_WAREHOUSE="seu_warehouse_de_computacao"
SNOWFLAKE_DATABASE="seu_banco_de_dados"
SNOWFLAKE_SCHEMA="seu_schema"

# --- API do Google Gemini ---
GEMINI_API_KEY="sua_chave_de_api_do_gemini"
```

**3.3. Entendendo as Variáveis do Snowflake**

- `SNOWFLAKE_ACCOUNT`: Este é o seu **identificador de conta**. Você pode encontrá-lo na URL que usa para acessar o Snowflake (ex: `identificador_de_conta.snowflakecomputing.com`). **Não inclua** a parte `.snowflakecomputing.com`.

- `SNOWFLAKE_USER`: O nome de usuário que você usa para fazer login no Snowflake.

- `SNOWFLAKE_PASSWORD`: A senha para o usuário especificado.
    - **MUITO IMPORTANTE**: Se sua senha contiver caracteres especiais como `#`, `$`, ou `!`, é mais seguro envolvê-la em **aspas duplas (`