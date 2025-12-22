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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
-- reset_type: weekly | monthly | yearly
-- reset_dow: 1..7 (Mon..Sun) para weekly
-- reset_dom: 1..28/31 para monthly (recomendado limitar a 1..28)
-- reset_month: 1..12 y reset_day: 1..31 para yearly
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
-- siempre hay 1 ciclo "actual" (el de end_date >= today)
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
-- fixed expenses: se aplican siempre al inicio de cada ciclo
-- ======================
CREATE TABLE budget_fixed_expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_fixed_budget
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  CONSTRAINT fk_fixed_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_fixed_budget ON budget_fixed_expenses(budget_id);

-- ======================
-- recurring expenses: se generan automáticamente según regla
-- - weekly: dow (1..7)
-- - monthly: dom (1..28/31)
-- - yearly: month + day
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
-- transactions: histórico real (manual + generadas por sistema)
-- source: fixed | recurring | manual
-- cycle_id: a qué ciclo pertenece (para consultas rápidas)
-- unique_key: para evitar duplicados de transacciones generadas (idempotencia)
-- ======================
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  budget_id INT NOT NULL,
  cycle_id INT NOT NULL,
  category_id INT NOT NULL,
  type ENUM('income','expense') NOT NULL DEFAULT 'expense',
  description VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  source ENUM('fixed','recurring','manual') NOT NULL DEFAULT 'manual',
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
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_budget ON transactions(budget_id);
CREATE INDEX idx_transactions_cycle ON transactions(cycle_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE UNIQUE INDEX uq_transactions_unique_key ON transactions(unique_key);

-- ======================
-- Categorías predefinidas
-- ======================
INSERT INTO categories (user_id, name, icon) VALUES
  (NULL, 'Casa', '🏠'),
  (NULL, 'Comida', '🍽️'),
  (NULL, 'Transporte', '🚗'),
  (NULL, 'Ocio', '🎉'),
  (NULL, 'Servicios', '💡'),
  (NULL, 'Salud', '⚕️'),
  (NULL, 'Educación', '📚');