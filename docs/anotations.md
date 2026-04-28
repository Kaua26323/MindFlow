# 🧠 MindFlow | Software Architecture & Design

**MindFlow** é uma plataforma de microblogging minimalista projetada para capturar e organizar fluxos de pensamentos.

---

## 🎯 Requisitos Funcionais (RF)

1.  **Gestão de Identidade:** Cadastro, login e logout seguro de usuários.
2.  **Criação de Conteúdo:** Publicação de posts via dashboard pessoal.
3.  **CRUD de de posts:** Edição e exclusão de publicações próprias.
4.  **Feed Global:** Visualização de posts de outros usuários em tempo real na Home Page.
5.  **Motor de Busca:** Pesquisa textual de posts na Home Page.
6.  **Filtros de Ordenação:** Organização por _Newest_, _Oldest_ e limpeza de filtros.
7.  **Curadoria Pessoal:** Sistema de "Favoritos" para salvar posts de terceiros (Relação N:N).

---

## 🏗️ Arquitetura e Padrões

O projeto adota a arquitetura **MVC (Model-View-Controller)** com uma **Service Layer**, aplicando princípios de **Clean Architecture**.

### Design Patterns Aplicados:

- **Adapter Pattern:** Isolamento das bibliotecas de validação (**Zod**) e persistência (**Drizzle**).
- **Repository Pattern:** Abstração da lógica de banco de dados, facilitando a troca de provedores e o mocking em testes.

---

## 🛠️ Stack Técnica

| Categoria         | Tecnologia                          | Finalidade                                                          |
| :---------------- | :---------------------------------- | :------------------------------------------------------------------ |
| **Linguagem**     | **TypeScript**                      | Segurança de tipos e melhor DX                                      |
| **Framework**     | **Express.js**                      | Servidor HTTP e gerenciamento de rotas SSR.                         |
| **Templates**     | **Handlebars**                      | _Logic-less templates_ para garantir separação entre View e Lógica. |
| **Estilos**       | **Tailwind CSS**                    | Estilização utilitária rápida com suporte nativo a temas.           |
| **Database**      | **PostgreSQL**                      | Armazenamento relacional persistente.                               |
| **ORM**           | **Drizzle**                         | _Type-safe_ e leve, mantendo a performance próxima ao SQL puro.     |
| **Auth & Hash**   | **Argon2 + Express Session**        | Hash de senhas de última geração e gerenciamento de sessões.        |
| **Session Store** | **connect-pg-simple**               | Persistência de sessões diretamente no PostgreSQL.                  |
| **Security**      | **express-csrf-protection**         | Proteção contra ataques de Cross-Site Request Forgery.              |
| **Validação**     | **Zod**                             | Validação de schemas e inferência de tipos.                         |
| **Erros**         | **express-flash**                   | Mensagens temporárias de feedback ao usuário.                       |
| **Ambiente**      | **dotenv**                          | Gerenciamento seguro de variáveis de ambiente.                      |
| **Testes**        | **Vitest, Supertest e Playwright.** | Testes unitários ultrarrápidos e testes E2E para garantir a UI.     |

---

## 🧪 Estratégia de Testes

Para garantir a confiabilidade do **MindFlow**, a suíte de testes cobre diferentes níveis da aplicação:

- **Vitest:** Runner principal para testes unitários da lógica de negócio.
- **Supertest:** Testes de integração das rotas API/HTTP, simulando requisições ao Express.
- **Playwright:** Testes _End-to-End_ (E2E) para validar o fluxo completo do usuário no navegador.

---

## 🎨 Design System

- **Background:** `#121212`
- **Primary:** `#0E4EB2`
- **Secondary:** `#2078CF`Aplicação:
- **Tertiary:** `#011F65`

---

## 🌐 Deploy

- **Database:** [Neon.tech](https://neon.tech)
- **Aplicação:** [Railway](https://railway.app)

---

### Notas de Implementação

O uso do `connect-pg-simple` é estratégico: ele garante que, mesmo que o servidor do Railway reinicie, as sessões dos usuários não sejam perdidas, pois estão salvas no banco de dados da Neon e não na memória volátil do servidor.

---
