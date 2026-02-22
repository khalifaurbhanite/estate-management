# Estate Management System

A comprehensive, professional property management platform built for housing estates, courts, blocks, and houses management.

## Features

- **Role-Based Access Control**: Super Admin, Agent, Employee
- **Property Hierarchy**: Estates → Courts → Blocks → Houses
- **Tenant Management**: Track tenants with lease dates
- **Billing System**: Rent, Water, Electricity, Service Charges
- **Payment Tracking**: Record and track all payments
- **Automated Reminders**: Rent due, overdue notices, lease expiry
- **Employee Management**: Create and manage agents and employees
- **Audit Logging**: Track all system changes
- **Legal Compliance**: Kenyan law-compliant terms and conditions

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Installation

1. **Clone/Download the project**
   ```bash
   cd estate-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Create database**
   ```bash
   createdb estate_management
   ```

5. **Run database schema**
   ```bash
   psql -U postgres -d estate_management -f database/schema.sql
   ```

6. **Start the application**
   ```bash
   npm start
   ```

7. **Access the application**
   - Open http://localhost:5000/login.html

## Default Login

After running the seed script:
```bash
npm run seed-db
```

**Super Admin:**
- Email: admin@estate.local
- Password: Admin@123

**Sample Agent:**
- Email: agent@estate.local
- Password: Agent@123

## Project Structure

```
estate-management-system/
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── permissions.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── agent.js
│   │   └── employee.js
│   └── services/
│       ├── auth.service.js
│       ├── billing.service.js
│       ├── property.service.js
│       └── reminders.service.js
├── frontend/
│   ├── css/
│   │   ├── style.css
│   │   ├── dashboard.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── app.js
│   │   ├── api.js
│   │   └── auth.js
│   ├── login.html
│   ├── terms-modal.html
│   ├── admin/
│   │   ├── dashboard.html
│   │   ├── agents.html
│   │   ├── reports.html
│   │   └── settings.html
│   ├── agent/
│   │   ├── dashboard.html
│   │   ├── estates.html
│   │   ├── courts.html
│   │   ├── blocks.html
│   │   ├── houses.html
│   │   ├── billing.html
│   │   ├── employees.html
│   │   ├── notifications.html
│   │   └── reports.html
│   └── employee/
│       ├── dashboard.html
│       ├── houses.html
│       ├── bills.html
│       └── tasks.html
├── database/
│   └── schema.sql
├── package.json
├── .env.example
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/accept-terms` - Accept terms & conditions
- `POST /api/auth/reset-password` - Reset password

### Admin (Super Admin only)
- `GET /api/admin/dashboard` - Get admin dashboard
- `GET /api/admin/agents` - List all agents
- `POST /api/admin/agents/:id/suspend` - Suspend agent
- `POST /api/admin/agents/:id/activate` - Activate agent

### Agent
- `GET /api/agent/dashboard` - Get agent dashboard
- `POST /api/agent/estates` - Create estate
- `GET /api/agent/estates` - List estates
- `POST /api/agent/courts` - Create court
- `POST /api/agent/blocks` - Create block
- `POST /api/agent/houses` - Create house
- `GET /api/agent/houses` - List houses
- `POST /api/agent/generate-bills` - Generate monthly bills

## Database Schema

The system uses PostgreSQL with the following main tables:

- `users` - User accounts (Super Admin, Agent, Employee)
- `agents` - Estate managers
- `employees` - Staff members
- `estates` - Property estates
- `courts` - Court groupings
- `blocks` - Block groupings
- `houses` - Individual houses/units
- `tenants` - House occupants
- `bills` - Billing records
- `payments` - Payment records
- `reminders` - Automated reminders
- `audit_logs` - Activity tracking

## Legal Compliance

This system is designed to comply with Kenyan laws:
- Computer Misuse and Cybercrimes Act, 2018
- Data Protection Act, 2019
- Consumer Protection Act, 2012
- Companies Act, 2015

## Support

For issues or feature requests, contact your system administrator.

## License

Proprietary - All rights reserved
