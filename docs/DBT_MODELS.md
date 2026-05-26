# Documentação dos Modelos dbt

Este documento fornece uma visão geral dos modelos dbt utilizados neste projeto, organizados por suas respectivas camadas: Staging, Intermediate e Marts.

---

## Visão Geral da Modelagem

O projeto segue uma abordagem de modelagem em camadas para garantir a separação de responsabilidades, a qualidade dos dados e a facilidade de manutenção.

1.  **Staging**: A primeira camada, onde os dados brutos do schema `RAW` são limpos, padronizados e preparados para transformação. As tarefas incluem renomear colunas, ajustar tipos de dados e realizar testes básicos de qualidade.
2.  **Intermediate**: A camada intermediária, onde a lógica de negócio principal é aplicada. Modelos aqui podem juntar diferentes fontes de dados, calcular métricas complexas e criar a base para os modelos finais.
3.  **Marts**: A camada final de apresentação. Consiste em tabelas de fatos e dimensões otimizadas para análise e consumo por ferramentas de Business Intelligence e pela interface analítica do projeto.

---

## 1. Modelos de Staging (`models/staging`)

Os modelos de staging são a porta de entrada dos dados brutos no pipeline de transformação.

-   **Convenção de Nomenclatura**: `stg_<source>__<entity>` (ex: `stg_customers`).
-   **Materialização**: `view`.
-   **Responsabilidades**:
    -   Selecionar colunas necessárias da fonte (`RAW`).
    -   Renomear colunas para um padrão consistente (ex: `customer_id`).
    -   Realizar a conversão de tipos de dados (casting).
    -   Testes básicos: `not_null`, `unique`.

### Modelos:
-   `stg_customers.sql`: Limpa e padroniza os dados de clientes.
-   `stg_orders.sql`: Limpa e padroniza os dados de pedidos.
-   `stg_products.sql`: Limpa e padroniza os dados de produtos.
-   `stg_marketing_campaigns.sql`: Limpa e padroniza campanhas vindas de fonte CSV registrada.
-   `stg_support_tickets.sql`: Limpa e padroniza tickets vindos de fonte JSON registrada.
-   `stg_crm_accounts.sql`: Limpa e padroniza contas vindas de uma fonte API paginada simulada.
-   `stg_billing_invoices.sql`: Limpa e padroniza invoices vindas de uma fonte API paginada simulada.

---

## 2. Modelos Intermediários (`models/intermediate`)

Estes modelos contêm lógicas de negócio que são reutilizadas ou que são muito complexas para serem aplicadas diretamente na camada de `marts`.

-   **Convenção de Nomenclatura**: `int_<business_entity>`.
-   **Materialização**: `table` ou `ephemeral`.
-   **Responsabilidades**:
    -   Unir modelos de staging.
    -   Aplicar lógicas de negócio complexas.
    -   Agregar dados em um nível intermediário.

### Modelos:
-   `int_orders_enhanced.sql`: Enriquece os dados de pedidos juntando informações de clientes e produtos, servindo como uma base pré-agregada para a tabela de fatos.

---

## 3. Modelos de Marts (`models/marts`)

A camada final do pipeline, pronta para o consumo analítico. Segue a metodologia de modelagem dimensional.

-   **Convenção de Nomenclatura**: `dim_<dimension>` e `fct_<fact>`.
-   **Materialização**: `table`.
-   **Responsabilidades**:
    -   Criar tabelas de dimensão com atributos descritivos.
    -   Criar tabelas de fatos com chaves estrangeiras para as dimensões e as métricas de negócio.
    -   Garantir a integridade referencial através de testes (`relationships`).

### Modelos:
-   `dim_customer.sql`: Tabela de dimensão contendo todos os atributos dos clientes.
-   `dim_product.sql`: Tabela de dimensão com os atributos dos produtos.
-   `fct_sales.sql`: Tabela de fatos principal, registrando cada item de pedido como um evento de venda. Contém métricas como `quantity`, `price` e chaves para as dimensões `customer` e `product`.
-   `mart_account_health.sql`: Mart operacional no grao de conta CRM, unindo CRM, billing, suporte e ecommerce para criar score de saude, tier de risco, driver principal e watchlist de contas.
