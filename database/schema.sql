CREATE DATABASE IF NOT EXISTS trinity_evoting;
USE trinity_evoting;

CREATE TABLE IF NOT EXISTS students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  matric_no VARCHAR(30) NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admins (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('election_admin', 'system_admin') NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS elections (
  election_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status ENUM('upcoming', 'active', 'closed') NOT NULL DEFAULT 'upcoming',
  results_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_by INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_elections_created_by FOREIGN KEY (created_by) REFERENCES admins(admin_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS positions (
  position_id INT AUTO_INCREMENT PRIMARY KEY,
  election_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  max_selection INT NOT NULL DEFAULT 1,
  display_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_positions_election FOREIGN KEY (election_id) REFERENCES elections(election_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS candidates (
  candidate_id INT AUTO_INCREMENT PRIMARY KEY,
  position_id INT NOT NULL,
  matric_no VARCHAR(30) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  department VARCHAR(100) NULL,
  manifesto TEXT NULL,
  photo_url MEDIUMTEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_candidates_position FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE CASCADE,
  CONSTRAINT uq_candidates_position_matric UNIQUE (position_id, matric_no)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS votes (
  vote_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  election_id INT NOT NULL,
  position_id INT NOT NULL,
  candidate_id INT NOT NULL,
  ballot_ref CHAR(36) NOT NULL,
  voted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_votes_election FOREIGN KEY (election_id) REFERENCES elections(election_id),
  CONSTRAINT fk_votes_position FOREIGN KEY (position_id) REFERENCES positions(position_id),
  CONSTRAINT fk_votes_candidate FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS voter_participation (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  election_id INT NOT NULL,
  receipt_code VARCHAR(50) NOT NULL UNIQUE,
  voted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_participation_student FOREIGN KEY (student_id) REFERENCES students(student_id),
  CONSTRAINT fk_participation_election FOREIGN KEY (election_id) REFERENCES elections(election_id),
  CONSTRAINT uq_participation_student_election UNIQUE (student_id, election_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  actor_id INT NOT NULL,
  actor_type ENUM('student', 'admin', 'system') NOT NULL,
  action_type ENUM(
    'login_success',
    'login_failed',
    'vote_submitted',
    'election_created',
    'election_updated',
    'election_closed',
    'candidate_added',
    'result_published',
    'admin_action',
    'access_denied'
  ) NOT NULL,
  details TEXT NULL,
  ip_address VARCHAR(45) NULL,
  correlation_id CHAR(36) NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_elections_status_dates ON elections (status, start_time, end_time);
CREATE INDEX idx_positions_election_id ON positions (election_id);
CREATE INDEX idx_candidates_position_id ON candidates (position_id);
CREATE INDEX idx_votes_election_position_candidate ON votes (election_id, position_id, candidate_id);
CREATE INDEX idx_participation_election_student ON voter_participation (election_id, student_id);
CREATE INDEX idx_audit_logs_action_time ON audit_logs (action_type, timestamp);
CREATE INDEX idx_audit_logs_actor_time ON audit_logs (actor_type, actor_id, timestamp);

