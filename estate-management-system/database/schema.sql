-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS employee_role_type CASCADE;
DROP TYPE IF EXISTS house_status CASCADE;
DROP TYPE IF EXISTS bill_status CASCADE;
DROP TYPE IF EXISTS bill_type CASCADE;
DROP TYPE IF EXISTS reminder_type CASCADE;
DROP TYPE IF EXISTS maintenance_status CASCADE;

-- Create enums
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'AGENT', 'EMPLOYEE');
CREATE TYPE employee_role_type AS ENUM ('CARETAKER', 'BILLING_OFFICER', 'WATER_READER', 'ACCOUNTANT', 'OTHER');
CREATE TYPE house_status AS ENUM ('OCCUPIED', 'VACANT', 'MAINTENANCE');
CREATE TYPE bill_status AS ENUM ('PAID', 'PARTIAL', 'OVERDUE', 'ADVANCE');
CREATE TYPE bill_type AS ENUM ('RENT', 'WATER', 'ELECTRICITY', 'SERVICE_CHARGE', 'GARBAGE', 'CUSTOM');
CREATE TYPE reminder_type AS ENUM ('RENT_DUE', 'WATER_DUE', 'OVERDUE', 'LEASE_EXPIRY');
CREATE TYPE maintenance_status AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  agent_id UUID,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  suspended_at TIMESTAMP,
  last_login TIMESTAMP,
  ip_address_on_signup VARCHAR(45),
  status VARCHAR(50) DEFAULT 'ACTIVE'
);

-- Terms & Conditions acceptance
CREATE TABLE terms_acceptance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  terms_version INT DEFAULT 1,
  privacy_policy_version INT DEFAULT 1,
  accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  UNIQUE(user_id, terms_version)
);

-- Agents (Estate Managers)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  suspended_at TIMESTAMP,
  suspension_reason TEXT,
  data_export_requested_at TIMESTAMP,
  data_export_completed_at TIMESTAMP,
  account_closed_at TIMESTAMP
);

-- Employees
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role_type employee_role_type NOT NULL,
  permissions JSONB DEFAULT '{}',
  assigned_houses UUID[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deactivated_at TIMESTAMP
);

-- Estates
CREATE TABLE estates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  location TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  total_houses INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(agent_id, name)
);

-- Courts
CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  block_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(estate_id, name)
);

-- Blocks
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  house_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(court_id, name)
);

-- Houses
CREATE TABLE houses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_id UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  house_number VARCHAR(50) NOT NULL,
  bedrooms INT,
  bathrooms INT,
  status house_status DEFAULT 'VACANT',
  monthly_rent DECIMAL(10,2),
  water_meter_number VARCHAR(50),
  electricity_meter_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(block_id, house_number)
);

-- Tenants
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  id_number VARCHAR(50) UNIQUE,
  lease_start_date DATE,
  lease_end_date DATE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bills
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  bill_type bill_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status bill_status DEFAULT 'OVERDUE',
  month_year DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  penalty DECIMAL(10,2) DEFAULT 0
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_method VARCHAR(100),
  reference VARCHAR(100),
  recorded_by UUID REFERENCES employees(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reminders
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  type reminder_type NOT NULL,
  due_date DATE NOT NULL,
  message TEXT,
  sent_at TIMESTAMP,
  acknowledged_at TIMESTAMP,
  acknowledged_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance requests
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  issue_type VARCHAR(255),
  description TEXT,
  assigned_to UUID REFERENCES employees(id),
  status maintenance_status DEFAULT 'OPEN',
  priority VARCHAR(50) DEFAULT 'NORMAL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  agent_id UUID REFERENCES agents(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id),
  type VARCHAR(100),
  title VARCHAR(255),
  message TEXT,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_agent_id ON users(agent_id);
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_employees_agent_id ON employees(agent_id);
CREATE INDEX idx_estates_agent_id ON estates(agent_id);
CREATE INDEX idx_courts_estate_id ON courts(estate_id);
CREATE INDEX idx_courts_agent_id ON courts(agent_id);
CREATE INDEX idx_blocks_court_id ON blocks(court_id);
CREATE INDEX idx_blocks_agent_id ON blocks(agent_id);
CREATE INDEX idx_houses_block_id ON houses(block_id);
CREATE INDEX idx_houses_agent_id ON houses(agent_id);
CREATE INDEX idx_tenants_house_id ON tenants(house_id);
CREATE INDEX idx_tenants_agent_id ON tenants(agent_id);
CREATE INDEX idx_bills_house_id ON bills(house_id);
CREATE INDEX idx_bills_agent_id ON bills(agent_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_payments_bill_id ON payments(bill_id);
CREATE INDEX idx_reminders_house_id ON reminders(house_id);
CREATE INDEX idx_reminders_agent_id ON reminders(agent_id);
CREATE INDEX idx_maintenance_house_id ON maintenance_requests(house_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_agent_id ON audit_logs(agent_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
