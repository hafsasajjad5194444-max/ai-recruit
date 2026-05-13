CREATE DATABASE IF NOT EXISTS airecruit
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE airecruit;

CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  city VARCHAR(100) NOT NULL UNIQUE,
  province VARCHAR(100),
  country VARCHAR(50) DEFAULT "Pakistan",
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  logo_url VARCHAR(255),
  website VARCHAR(255),
  description TEXT,
  location_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE TABLE jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  deadline DATE,
  company_id INT NOT NULL,
  category_id INT NOT NULL,
  location_id INT NOT NULL,
  type_id INT NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  FOREIGN KEY (type_id) REFERENCES job_types(id)
);

CREATE TABLE candidates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  resume_path VARCHAR(255),
  skills TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  job_id INT NOT NULL,
  candidate_id INT NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  cover_letter TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_application (job_id, candidate_id),
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

CREATE TABLE bookmarks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  job_id INT NOT NULL,
  candidate_id INT NOT NULL,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_bookmark (job_id, candidate_id),
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

-- Sample data
INSERT INTO categories (name, icon) VALUES
  ('Information Technology', '💻'),
  ('Finance & Banking', '💰'),
  ('Marketing', '📣'),
  ('Healthcare', '💊'),
  ('Education', '🎓');

INSERT INTO locations (city, province) VALUES
  ('Peshawar', 'Khyber Pakhtunkhwa'),
  ('Karachi', 'Sindh'),
  ('Lahore', 'Punjab'),
  ('Islamabad', 'Federal Capital'),
  ('Remote', 'Anywhere');

INSERT INTO job_types (name) VALUES
  ('Full-Time'),
  ('Part-Time'),
  ('Remote'),
  ('Internship'),
  ('Contract');

INSERT INTO companies (name, website, description, location_id) VALUES
  ('TechCorp Pakistan', 'https://techcorp.pk', 'Leading software house', 1);

INSERT INTO jobs (title, description, salary_min, salary_max, deadline, company_id, category_id, location_id, type_id) VALUES
  ('Flutter Developer', 'Build mobile and desktop apps', 80000, 150000, '2025-12-31', 1, 1, 1, 1);
