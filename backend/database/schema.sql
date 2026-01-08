CREATE DATABASE IF NOT EXISTS budget_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE budget_app;

-- ======================
-- users
-- ======================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  default_currency VARCHAR(10) DEFAULT 'EUR',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ======================
-- refresh_tokens
-- ======================
CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  replaced_by_token_hash VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_refresh_user (user_id),
  UNIQUE INDEX uq_refresh_token_hash (token_hash)
) ENGINE=InnoDB;

-- ======================
-- categories (global + user)
-- ======================
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_categories_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_categories_user ON categories(user_id);

-- ======================
-- budgets (configuración permanente)
-- ======================
CREATE TABLE budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  reset_type ENUM('weekly','monthly','yearly') NOT NULL,
  reset_dow TINYINT NULL,
  reset_dom TINYINT NULL,
  reset_month TINYINT NULL,
  reset_day TINYINT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_budgets_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_budgets_user ON budgets(user_id);

-- ======================
-- budget_cycles (histórico de ciclos)
-- ======================
CREATE TABLE budget_cycles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cycles_budget
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_cycles_budget ON budget_cycles(budget_id);
CREATE INDEX idx_cycles_dates ON budget_cycles(start_date, end_date);

-- ======================
-- budget provisions (planned/allocated expenses)
-- ======================
CREATE TABLE budget_provisions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_provisions_budget
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  CONSTRAINT fk_provisions_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_provisions_budget ON budget_provisions(budget_id);
CREATE INDEX idx_provisions_category ON budget_provisions(category_id);

-- ======================
-- recurring expenses
-- ======================
CREATE TABLE budget_recurring_expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  frequency ENUM('weekly','monthly','yearly') NOT NULL,
  dow TINYINT NULL,
  dom TINYINT NULL,
  month TINYINT NULL,
  day TINYINT NULL,
  CONSTRAINT fk_recurring_budget
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  CONSTRAINT fk_recurring_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_recurring_budget ON budget_recurring_expenses(budget_id);

-- ======================
-- transactions (incluye incomes)
-- category_id ahora es NULLABLE para permitir incomes sin categoría
-- FK category: ON DELETE SET NULL para mantener histórico si se borra categoría
-- ======================
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  budget_id INT NOT NULL,
  cycle_id INT NOT NULL,
  category_id INT NULL,
  provision_id INT NULL,
  type ENUM('income','expense') NOT NULL DEFAULT 'expense',
  description VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  source ENUM('recurring','manual') NOT NULL DEFAULT 'manual',
  unique_key VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
) ENGINE=InnoDB;

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_budget ON transactions(budget_id);
CREATE INDEX idx_transactions_cycle ON transactions(cycle_id);
CREATE INDEX idx_transactions_provision ON transactions(provision_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE UNIQUE INDEX uq_transactions_unique_key ON transactions(unique_key);

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
  (NULL, 'Educación', '📚');