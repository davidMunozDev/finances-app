-- =========================================================
--  CREACIÓN DE BASE DE DATOS
-- =========================================================
CREATE DATABASE IF NOT EXISTS budget_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE budget_app;

-- =========================================================
--  TABLA: users
--  Usuario de la aplicación
-- =========================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  default_currency VARCHAR(10) DEFAULT 'EUR',  -- para el primer presupuesto / resumen
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================
--  TABLA: categories
--  Categorías de gasto.
--  user_id NULL  -> categoría predefinida del sistema
--  user_id NO NULL -> categoría creada por el usuario
-- =========================================================
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_categories_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_categories_user ON categories(user_id);

-- =========================================================
--  TABLA: budgets
--  Presupuesto (ej: "Enero 2026")
-- =========================================================
CREATE TABLE budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  start_date DATE,
  end_date DATE,
  currency VARCHAR(10) DEFAULT 'EUR',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_budgets_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_budgets_user ON budgets(user_id);

-- =========================================================
--  TABLA: budget_incomes
--  Ingresos previstos de un presupuesto
-- =========================================================
CREATE TABLE budget_incomes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,             -- Salario, Extra, etc.
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_budget_incomes_budget
    FOREIGN KEY (budget_id)
    REFERENCES budgets(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_budget_incomes_budget ON budget_incomes(budget_id);

-- =========================================================
--  TABLA: budget_categories
--  Relación presupuesto ↔ categoría.
--  planned_amount = total previsto para esa categoría
-- =========================================================
CREATE TABLE budget_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_id INT NOT NULL,
  category_id INT NOT NULL,
  planned_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_budget_categories_budget
    FOREIGN KEY (budget_id)
    REFERENCES budgets(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_budget_categories_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_budget_categories_budget ON budget_categories(budget_id);
CREATE INDEX idx_budget_categories_category ON budget_categories(category_id);

-- =========================================================
--  TABLA: budget_expenses
--  Partidas previstas dentro de una categoría del presupuesto
--  (Restaurante, Teatro, Luz, Agua, etc.)
-- =========================================================
CREATE TABLE budget_expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_budget_expenses_budget_category
    FOREIGN KEY (budget_category_id)
    REFERENCES budget_categories(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_budget_expenses_budget_category
  ON budget_expenses(budget_category_id);

-- =========================================================
--  TABLA: transactions
--  Movimientos reales (para verificar el cumplimiento
--  del presupuesto)
-- =========================================================
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  budget_id INT NULL,           -- puede estar fuera de cualquier presupuesto
  category_id INT NOT NULL,     -- Casa, Ocio, etc.
  type ENUM('income','expense') NOT NULL,
  description VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_transactions_budget
    FOREIGN KEY (budget_id)
    REFERENCES budgets(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_transactions_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_budget ON transactions(budget_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(date);

-- =========================================================
--  CATEGORÍAS PREDEFINIDAS DE EJEMPLO
--  (user_id = NULL -> globales, disponibles para todos)
-- =========================================================
INSERT INTO categories (user_id, name, icon) VALUES
  (NULL, 'Casa',        '🏠'),
  (NULL, 'Comida',      '🍽️'),
  (NULL, 'Transporte',  '🚗'),
  (NULL, 'Ocio',        '🎉'),
  (NULL, 'Servicios',   '💡'),
  (NULL, 'Salud',       '⚕️'),
  (NULL, 'Educación',   '📚');
