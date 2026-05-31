# 🧠 MindFlow | Software Architecture & Design

**MindFlow** is a minimalist microblogging platform designed to capture and organize streams of thought.

---

## 🎯 Functional Requirements (FR)

1. **Identity Management:** Secure user registration, login, and logout.
2. **Content Creation:** Post publishing via personal dashboard.
3. **Post CRUD:** Editing and deleting own publications.
4. **Global Feed:** Viewing posts from other users on the Home Page.
5. **Search Engine & Pagination:** Full-text post search with dynamic pagination system.
6. **Sorting Filters:** Sorting by _Newest_, _Oldest_, and filter clearing.
7. **Personal Curation:** "Favorites" system to save third-party posts (N:N relationship).

---

## 🏗️ Architecture & Patterns

The project was structured to be scalable and highly testable, adopting **MVC (Model-View-Controller) architecture** at the HTTP delivery layer, decoupled from a strict Application layer based on Clean Architecture principles.

### Applied Design Patterns:

- **Use Cases (Interactors):** All business rule flows are isolated in atomic, testable Use Cases at the Application layer.
- **Adapter Pattern:** Isolation of external libraries, such as data validation (**Zod**) and hashing algorithms (**Argon2**), ensuring business rules do not depend on third-party frameworks.
- **Repository Pattern:** Full abstraction of database logic, making it easy to swap providers and create _mocks_ (Harness) for tests.
- **Factory Pattern:** Clean and centralized dependency injection for instantiating Controllers, Use Cases, and Repositories.

---

## 🛠️ Tech Stack

| Category          | Technology                         | Purpose                                                                                   |
| :---------------- | :--------------------------------- | :---------------------------------------------------------------------------------------- |
| **Language**      | **TypeScript**                     | Type safety and improved DX (Developer Experience).                                       |
| **Framework**     | **Express.js**                     | HTTP server and middleware pipeline orchestration.                                        |
| **Templates**     | **Handlebars**                     | _Logic-less templates_ with custom helpers for SSR (Server-Side Rendering).               |
| **Styles**        | **Tailwind CSS**                   | Agile, responsive, and modern utility-first styling.                                      |
| **Database**      | **PostgreSQL**                     | Persistent and consistent relational storage.                                             |
| **ORM**           | **Drizzle ORM**                    | _Type-safe_, low overhead, keeping performance close to raw SQL.                          |
| **Auth & Hash**   | **Argon2 + Express Session**       | GPU attack-resistant password hashing and server-side session management.                 |
| **Session Store** | **connect-pg-simple**              | Session persistence directly in the PostgreSQL pool.                                      |
| **Security**      | **@dr.pogodin/csurf**              | Robust protection against CSRF (Cross-Site Request Forgery) attacks using signed cookies. |
| **Validation**    | **Zod**                            | Request payload validation (Schemas) and strict `.env` typing.                            |
| **Errors**        | **express-flash**                  | Management of temporary feedback messages (Success/Error) injected globally.              |
| **Testing**       | **Vitest, Supertest & Playwright** | Full pyramid: Unit tests (logic), integration tests (HTTP routes), and E2E (user flow).   |

---

## 🧪 Testing Strategy

To ensure the reliability and resilience of **MindFlow**, the test suite covers the three fundamental application layers:

- **Vitest:** Main runner responsible for ultra-fast execution of **Unit Tests** for Use Cases and **Integration Tests** (Repositories and Adapters).
- **Supertest:** Validation of the web delivery layer, simulating HTTP requests to Controllers to ensure the integrity of flows and middlewares.
- **Playwright:** _End-to-End_ (E2E) tests that simulate real end-user behavior navigating the platform, validating UI rendering and interactivity.

---

## 🎨 Design System

- **Background:** `#121212`
- **Primary:** `#0E4EB2`
- **Secondary:** `#2078CF`
- **Tertiary:** `#011F65`

---

## 🌐 Deploy

- **Database:** [Neon.tech](https://neon.tech) (Serverless PostgreSQL)
- **Application:** [Render](https://render.com) (PaaS for Node.js hosting)

---

### Technical Implementation Notes

1. **Environment Variable Management:** The system features strong `.env` file validation via Zod. The application aborts initialization (_fail-fast_) if critical keys (such as database URLs or encryption secrets shorter than 32 characters) are missing or incorrect.
2. **Session Resilience:** Using `connect-pg-simple` is a strategic infrastructure decision. It ensures that even if the Railway application container is restarted or scaled, active user sessions are not lost, as they reside on the database disk (Neon) rather than in the Express server's volatile memory (RAM).
