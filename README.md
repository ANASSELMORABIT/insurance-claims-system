<div align="center">

# 🛡️ InsureClaims
### Enterprise Insurance Claims Management System

![.NET](https://img.shields.io/badge/.NET_8-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

A full-stack enterprise web application for managing insurance claims, built with **ASP.NET Core 8 Web API**, **React + TypeScript**, and **SQL Server**. Designed to demonstrate real-world enterprise architecture, role-based security, and production-ready features.

[Live Demo](#) · [API Docs](#) · [Report Bug](#)

</div>

---

## 📸 Screenshots

> Dashboard · Claims · Reports · Mobile View

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT authentication with refresh token support
- **3 roles with different visibility:** Admin, Agent, Client
- Protected routes on both frontend and backend
- Role-based UI — each role sees only what they need

### 📋 Claims Management
- Full CRUD with complete status history tracking
- Filter by status, type, date range with pagination
- **Auto-assign** — system automatically assigns the least loaded agent
- Document upload/download per claim (PDF, images, Word)
- Email notifications on claim creation and status changes

### 📊 Dashboard & Analytics
- Real-time KPI cards with growth indicators
- Claims by month area chart (created vs resolved)
- Claims by type donut chart
- Daily activity bar chart

### 📈 Admin Analytics (Admin only)
- 8+ interactive charts with Recharts
- Agent workload & performance ranking table
- Cost analysis by claim type (horizontal bar chart)
- Status distribution pie chart
- Top 5 most costly claims
- Monthly revenue trend line chart

### 👥 User Management (Admin only)
- Create agents and clients directly from the UI
- Enable/disable accounts with confirm modal
- View stats per user (claims, documents)
- Filter users by role

### 📜 Policy Management
- Full CRUD for insurance policies
- Active/Expired/Inactive badge status
- Inline edit without leaving the page
- Linked to claims — selector in claim form

### 🔔 In-App Notifications
- Bell icon with unread counter badge
- Auto-triggered on claim creation and status changes
- Mark as read / mark all / delete
- Polling every 30 seconds

### 🔍 Global Search
- **Ctrl+K** shortcut to open
- Search across claims, policies and users simultaneously
- Keyboard navigation (↑↓ Enter)
- Results grouped by type with badges

### 📤 Export
- Export claims to **Excel (.xlsx)** with ClosedXML
- Export claims to **PDF report** with QuestPDF
- Applies current filters to export

### 👤 Profile
- Edit name and phone number
- Change password with validation
- Personal stats (claims, pending, approved, documents)
- Member since date

### 📱 Responsive Design
- Full mobile support with drawer sidebar
- Bottom navigation bar on mobile
- Tables → cards on small screens
- Adaptive grids for all screen sizes

### 🌓 Dark / Light Mode
- Toggle with smooth transition
- Persists in localStorage
- Respects OS preference by default

### 🧪 Tests
- **Backend:** xUnit + FluentAssertions + Moq (20 tests)
- **Frontend:** Vitest + Testing Library (15 tests)
- InMemory database for integration tests
- Mocked services for unit tests

---

## 🏗️ Architecture

```
InsuranceClaims/
├── InsuranceClaims.Core/           # Entities, Interfaces, DTOs
│   ├── Entities/                   # Domain models
│   ├── Interfaces/                 # Service contracts
│   ├── DTOs/                       # Data transfer objects
│   └── Enums/                      # Domain enumerations
│
├── InsuranceClaims.Infrastructure/ # EF Core, Services, Repositories
│   ├── Data/                       # DbContext + migrations
│   └── Services/                   # Business logic implementations
│
├── InsuranceClaims.API/            # ASP.NET Core Web API
│   ├── Controllers/                # HTTP endpoints
│   └── Middleware/                 # Custom middleware
│
├── InsuranceClaims.Tests/          # xUnit test project
│   ├── Services/                   # Unit tests
│   ├── Controllers/                # Integration tests
│   └── Helpers/                    # Test utilities
│
└── insurance-claims-ui/            # React + TypeScript (Vite)
    └── src/
        ├── components/             # Reusable UI components
        ├── pages/                  # Page components
        ├── services/               # API service layer
        ├── context/                # React contexts
        ├── hooks/                  # Custom hooks
        └── test/                   # Vitest tests
```

**Clean Architecture** with 3 layers:
- **Core** — zero external dependencies, pure domain logic
- **Infrastructure** — depends on Core, implements interfaces
- **API** — depends on both, handles HTTP concerns

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core 8 Web API |
| Frontend | React 18 + TypeScript + Vite |
| Database | SQL Server + Entity Framework Core 8 |
| Auth | JWT Bearer + ASP.NET Identity |
| Charts | Recharts |
| PDF Export | QuestPDF |
| Excel Export | ClosedXML |
| Email | MailKit |
| Validation | FluentValidation |
| API Docs | Swagger / OpenAPI |
| Backend Tests | xUnit + FluentAssertions + Moq |
| Frontend Tests | Vitest + Testing Library |
| Containerization | Docker (SQL Server) |

---

## 🚀 Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 1. Clone the repository
```bash
git clone https://github.com/tu-usuario/insurance-claims-system.git
cd insurance-claims-system
```

### 2. Start SQL Server with Docker
```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Admin@1234!" \
  -p 1433:1433 --name sqlserver-insurance \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

### 3. Run database migrations
```bash
dotnet ef database update \
  --project InsuranceClaims.Infrastructure \
  --startup-project InsuranceClaims.API
```

### 4. Start the API
```bash
dotnet run --project InsuranceClaims.API
# API runs on http://localhost:5172
# Swagger UI at http://localhost:5172/swagger
```

### 5. Start the Frontend
```bash
cd insurance-claims-ui
npm install
npm run dev
# App runs on http://localhost:5173
```

### 6. Login
```
Email:    admin@insurance.com
Password: Admin@1234!
```

---

## 🧪 Running Tests

### Backend
```bash
dotnet test --verbosity normal
# Expected: 20 passed, 0 failed
```

### Frontend
```bash
cd insurance-claims-ui
npm run test:run
# Expected: 15 passed, 0 failed
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login and get JWT | Public |
| POST | `/api/auth/register` | Register new user | Public |
| GET | `/api/auth/me` | Get current user profile | Required |
| PUT | `/api/auth/profile` | Update profile | Required |
| PUT | `/api/auth/change-password` | Change password | Required |
| GET | `/api/auth/profile/stats` | Get profile stats | Required |

### Claims
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/claims` | List all claims (paginated) | Admin, Agent |
| GET | `/api/claims/my` | List my claims | Client |
| GET | `/api/claims/{id}` | Get claim detail | All |
| POST | `/api/claims` | Create claim | Admin, Agent |
| PUT | `/api/claims/{id}` | Update claim | Admin, Agent |
| PATCH | `/api/claims/{id}/status` | Update status | Admin, Agent |
| DELETE | `/api/claims/{id}` | Delete claim | Admin |
| PATCH | `/api/claims/{id}/assign` | Assign agent | Admin |
| GET | `/api/claims/agent-workloads` | Agent workloads | Admin |

### Policies
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/policies` | List policies | All |
| GET | `/api/policies/{id}` | Get policy | All |
| POST | `/api/policies` | Create policy | Admin |
| PUT | `/api/policies/{id}` | Update policy | Admin |
| PATCH | `/api/policies/{id}/toggle` | Toggle active | Admin |
| DELETE | `/api/policies/{id}` | Delete policy | Admin |

### Users
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/users` | List users | Admin |
| GET | `/api/users/{id}` | Get user | Admin |
| POST | `/api/users` | Create user | Admin |
| PUT | `/api/users/{id}` | Update user | Admin |
| PATCH | `/api/users/{id}/toggle-active` | Enable/Disable | Admin |

### Dashboard & Reports
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/dashboard/stats` | Global stats | Admin |
| GET | `/api/dashboard/stats/agent` | Agent stats | Agent |
| GET | `/api/dashboard/stats/client` | Client stats | Client |
| GET | `/api/reports/overview` | Full analytics | Admin |

### Search & Export
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/search?q=texto` | Global search | All |
| GET | `/api/export/claims/excel` | Export Excel | All |
| GET | `/api/export/claims/pdf` | Export PDF | All |

### Notifications
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/notifications` | Get notifications | All |
| GET | `/api/notifications/unread-count` | Unread count | All |
| PATCH | `/api/notifications/{id}/read` | Mark as read | All |
| PATCH | `/api/notifications/read-all` | Mark all read | All |
| DELETE | `/api/notifications/{id}` | Delete | All |

---

## 🔑 Role Permissions

| Feature | Admin | Agent | Client |
|---------|-------|-------|--------|
| Dashboard | Global stats | Own stats | Own stats |
| Claims | All claims | All claims | Own claims only |
| Create Claim | ✅ | ✅ | ❌ |
| Delete Claim | ✅ | ❌ | ❌ |
| Update Status | ✅ | ✅ | ❌ |
| Upload Docs | ✅ | ✅ | ✅ |
| Delete Docs | ✅ | ✅ | ❌ |
| Users Management | ✅ | ❌ | ❌ |
| Policies | Full CRUD | View only | View only |
| Reports | ✅ | ❌ | ❌ |
| Global Search | ✅ | ✅ | ✅ |
| Export | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ |

---

## 👤 Author

**ANASS EL MORABIT**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](www.linkedin.com/in/anass-el-morabit-98310929a)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ANASSELMORABIT)

---

<div align="center">

Made with ❤️ using ASP.NET Core 8 + React 18

</div>
