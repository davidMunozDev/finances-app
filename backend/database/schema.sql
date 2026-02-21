-- ======================
-- PostgreSQL Schema for Budget App
-- ======================

-- Custom ENUM types
CREATE TYPE reset_type_enum AS ENUM ('weekly', 'monthly', 'yearly');
CREATE TYPE frequency_enum AS ENUM ('weekly', 'monthly', 'yearly');
CREATE TYPE transaction_type_enum AS ENUM ('income', 'expense');
CREATE TYPE transaction_source_enum AS ENUM ('recurring', 'manual');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ======================
-- users
-- ======================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  default_currency VARCHAR(10) DEFAULT 'EUR',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================
-- refresh_tokens
-- ======================
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  replaced_by_token_hash VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_user ON refresh_tokens(user_id);
CREATE UNIQUE INDEX uq_refresh_token_hash ON refresh_tokens(token_hash);

-- ======================
-- categories (global + user)
-- ======================
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NULL,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_categories_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_categories_user ON categories(user_id);

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================
-- budgets (configuración permanente)
-- ======================
CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  reset_type reset_type_enum NOT NULL,
  reset_dow SMALLINT NULL,
  reset_dom SMALLINT NULL,
  reset_month SMALLINT NULL,
  reset_day SMALLINT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_budgets_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_budgets_user ON budgets(user_id);

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================
-- budget_cycles (histórico de ciclos)
-- ======================
CREATE TABLE budget_cycles (
  id SERIAL PRIMARY KEY,
  budget_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cycles_budget
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
);

CREATE INDEX idx_cycles_budget ON budget_cycles(budget_id);
CREATE INDEX idx_cycles_dates ON budget_cycles(start_date, end_date);

-- ======================
-- budget provisions (planned/allocated expenses)
-- ======================
CREATE TABLE budget_provisions (
  id SERIAL PRIMARY KEY,
  budget_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_provisions_budget
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  CONSTRAINT fk_provisions_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE INDEX idx_provisions_budget ON budget_provisions(budget_id);
CREATE INDEX idx_provisions_category ON budget_provisions(category_id);

-- ======================
-- recurring expenses
-- ======================
CREATE TABLE budget_recurring_expenses (
  id SERIAL PRIMARY KEY,
  budget_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  frequency frequency_enum NOT NULL,
  dow SMALLINT NULL,
  dom SMALLINT NULL,
  month SMALLINT NULL,
  day SMALLINT NULL,
  CONSTRAINT fk_recurring_budget
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  CONSTRAINT fk_recurring_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE INDEX idx_recurring_budget ON budget_recurring_expenses(budget_id);

-- ======================
-- transactions (incluye incomes)
-- category_id ahora es NULLABLE para permitir incomes sin categoría
-- FK category: ON DELETE SET NULL para mantener histórico si se borra categoría
-- ======================
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  budget_id INTEGER NOT NULL,
  cycle_id INTEGER NOT NULL,
  category_id INTEGER NULL,
  provision_id INTEGER NULL,
  type transaction_type_enum NOT NULL DEFAULT 'expense',
  description VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  source transaction_source_enum NOT NULL DEFAULT 'manual',
  unique_key VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_budget
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_cycle
    FOREIGN KEY (cycle_id) REFERENCES budget_cycles(id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_transactions_provision
    FOREIGN KEY (provision_id) REFERENCES budget_provisions(id) ON DELETE SET NULL
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_budget ON transactions(budget_id);
CREATE INDEX idx_transactions_cycle ON transactions(cycle_id);
CREATE INDEX idx_transactions_provision ON transactions(provision_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE UNIQUE INDEX uq_transactions_unique_key ON transactions(unique_key);

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================
-- Categorías predefinidas (gastos)
-- ======================
INSERT INTO categories (user_id, name, icon) VALUES
  (NULL, 'Casa', '🏠'),
  (NULL, 'Comida', '🍽️'),
  (NULL, 'Transporte', '🚗'),
  (NULL, 'Ocio', '🎉'),
  (NULL, 'Servicios', '💡'),
  (NULL, 'Salud', '⚕️'),
  (NULL, 'Educación', '📚'),
  (NULL, 'Otros', '📦');