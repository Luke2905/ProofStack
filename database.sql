-- =============================================================================
-- ProofStack (PortifólioHub) - Script Completo de Banco de Dados (MySQL 8.0+)
-- Compatível com: MySQL Local, TiDB Cloud, PlanetScale, Railway, Aiven, RDS
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `portifoliohub`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `portifoliohub`;

-- -----------------------------------------------------------------------------
-- 1. Tabela de Usuários (Autenticação JWT & Ownership)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `portfolio_id` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  UNIQUE KEY `users_portfolio_id_key` (`portfolio_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Tabela Principal de Portfólios
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `portfolios` (
  `id` VARCHAR(255) NOT NULL,
  `user_id` VARCHAR(255) DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `is_owner_profile` BOOLEAN DEFAULT FALSE,
  `is_published` BOOLEAN DEFAULT TRUE,
  `show_in_hub` BOOLEAN DEFAULT TRUE,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Identidade Básica
  `name` VARCHAR(255) NOT NULL,
  `avatar_url` VARCHAR(1000) NOT NULL,
  `headline` VARCHAR(500) NOT NULL,
  `role_category` VARCHAR(100) NOT NULL,
  `seniority` VARCHAR(100) NOT NULL,
  `years_of_experience` INT DEFAULT 1,
  `short_bio` TEXT NOT NULL,
  `about_markdown` MEDIUMTEXT,
  `location` VARCHAR(255) NOT NULL,
  `languages` JSON,

  -- Metadados para Recrutadores & Empresas
  `availability_status` VARCHAR(100) NOT NULL,
  `preferred_modalities` JSON,
  `contract_types` JSON,
  `compensation_expectation` VARCHAR(255) DEFAULT NULL,
  `notice_period` VARCHAR(255) DEFAULT NULL,

  -- Links de Contato & Validação
  `email` VARCHAR(255) NOT NULL,
  `whatsapp` VARCHAR(255) DEFAULT NULL,
  `linkedin_url` VARCHAR(1000) DEFAULT NULL,
  `github_username` VARCHAR(255) DEFAULT NULL,
  `github_url` VARCHAR(1000) DEFAULT NULL,
  `website_url` VARCHAR(1000) DEFAULT NULL,
  `calendly_url` VARCHAR(1000) DEFAULT NULL,
  `resume_url` VARCHAR(1000) DEFAULT NULL,

  -- Telemetria GitHub & Customização Visual (Theme)
  `github_stats` JSON,
  `theme` JSON,

  -- Métricas de Engajamento no Hub
  `views_count` INT DEFAULT 0,
  `likes_count` INT DEFAULT 0,
  `verified_github` BOOLEAN DEFAULT FALSE,

  PRIMARY KEY (`id`),
  UNIQUE KEY `portfolios_slug_key` (`slug`),
  KEY `idx_portfolios_user_id` (`user_id`),
  KEY `idx_portfolios_role_category` (`role_category`),
  KEY `idx_portfolios_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Tabela de Projetos & Case Studies
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `projects` (
  `id` VARCHAR(255) NOT NULL,
  `portfolio_id` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(500) NOT NULL,
  `problem_statement` TEXT NOT NULL,
  `solution_details` TEXT NOT NULL,
  `impact_metrics` TEXT NOT NULL,
  `cover_image_url` VARCHAR(1000) NOT NULL,
  `demo_url` VARCHAR(1000) DEFAULT NULL,
  `repo_url` VARCHAR(1000) DEFAULT NULL,
  `tech_stack` JSON,
  `is_from_github` BOOLEAN DEFAULT FALSE,
  `github_repo_id` BIGINT DEFAULT NULL,
  `stars_count` INT DEFAULT 0,
  `forks_count` INT DEFAULT 0,
  `language` VARCHAR(100) DEFAULT NULL,
  `role` VARCHAR(255) DEFAULT NULL,
  `client_or_company` VARCHAR(255) DEFAULT NULL,
  `year` VARCHAR(50) DEFAULT NULL,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `is_visible` BOOLEAN DEFAULT TRUE,
  `display_order` INT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_projects_portfolio_id` (`portfolio_id`),
  CONSTRAINT `fk_projects_portfolio`
    FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Tabela de Competências Técnicas (Skills)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `skills` (
  `id` VARCHAR(255) NOT NULL,
  `portfolio_id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `level` VARCHAR(100) NOT NULL,
  `years` INT DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_skills_portfolio_id` (`portfolio_id`),
  CONSTRAINT `fk_skills_portfolio`
    FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. Tabela de Experiências Profissionais
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `experiences` (
  `id` VARCHAR(255) NOT NULL,
  `portfolio_id` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) NOT NULL,
  `role` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `start_date` VARCHAR(100) NOT NULL,
  `end_date` VARCHAR(100) NOT NULL,
  `is_current` BOOLEAN DEFAULT FALSE,
  `description` TEXT NOT NULL,
  `achievements` JSON,
  `technologies` JSON,
  PRIMARY KEY (`id`),
  KEY `idx_experiences_portfolio_id` (`portfolio_id`),
  CONSTRAINT `fk_experiences_portfolio`
    FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
