# ⚡ QUICK START GUIDE

## 🚀 Get Running in 5 Minutes

### **1. Install Dependencies**
```bash
cd c:\Users\fidoh_ba\estate-management-system
npm install
```

### **2. Create Database**
```bash
# Open PostgreSQL (psql)
psql -U postgres

# Create database
CREATE DATABASE estate_management;
\q

# Load schema
psql -U postgres -d estate_management -f database/schema.sql
```

### **3. Setup Environment**
```bash
# Copy example
copy .env.example .env

# Edit .env - update these:
# DB_PASSWORD=your_postgres_password
# JWT_SECRET=your-random-secret-key
```

### **4. Start Server**
```bash
npm start
```

### **5. Open Browser**
```
http://localhost:5000/login.html
```

---

## 🔑 TEST LOGIN CREDENTIALS

### Create Test Users (in PostgreSQL)
```sql
INSERT INTO users (email, password_hash, role, full_name, status)
VALUES 
  ('admin@test.com', '$2a$10$SlwjDfqSXvYlHAFGFQ5k..', 'SUPER_ADMIN', 'Admin', 'ACTIVE'),
  ('agent@test.com', '$2a$10$SlwjDfqSXvYlHAFGFQ5k..', 'AGENT', 'Agent', 'ACTIVE');
```

**Password hashes for testing** (use any bcrypt tool):
- User: `test@test.com`
- Password: `Test@123`

---

## 📱 KEY PAGES

| Role | URL | Features |
|------|-----|----------|
| Admin | `/admin/dashboard.html` | Manage agents, view system stats |
| Agent | `/agent/dashboard.html` | Manage estates, courts, blocks, houses |
| Employee | `/employee/dashboard.html` | View assigned houses, record rent |

---

## 🆘 COMMON ISSUES

**Port 5000 in use?**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <number> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**Database connection error?**
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure `estate_management` database exists

**npm packages missing?**
```bash
npm install --save
```

---

## 📚 FILE STRUCTURE

```
estate-management-system/
├── backend/          → API server
├── frontend/         → Web pages
├── database/         → SQL schema
├── package.json      → Dependencies
├── .env.example      → Config template
└── DEPLOY.md         → Full deployment guide
```

---

## ✅ WHAT'S READY

✅ **Fully Working:**
- Login system
- Admin dashboard
- Agent dashboard  
- Estate management
- Database schema
- API routes

🔄 **Placeholders (to build):**
- Courts, Blocks, Houses pages
- Billing interface
- Employee management
- Notifications
- Reports

---

## 🎯 NEXT: BUILD THE PAGES

All placeholder pages are in:
- `frontend/agent/*.html`
- `frontend/admin/*.html`
- `frontend/employee/*.html`

Use the existing dashboards as templates!

---

**Ready? Start with:** `npm start` ✨
