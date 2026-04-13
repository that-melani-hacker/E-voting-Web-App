USE trinity_evoting;


-- Production admin password hashes (bcrypt cost 12).
-- Keep these credentials private and share only with authorised personnel.
SET @sys_hash  = '$2b$12$8QR2vDlQUsmYNEkxKBvZ7.uYd9efOaZ88LMXNOYvICNeckd9rErrG';
SET @elec_hash = '$2b$12$zRsm.gPpE8tf4etwJRoUfeGwiqJJ2uwXsd79WdDu9molxV1cmHzIO';
-- Student default hash  (StudentPass123!)
SET @student_hash = '$2b$12$k7Y5g9iyY4M5X2ZMdgoMueIBAehhuWNviRtBNNz6LDICCchl8RPwe';

-- ────────────────────────────────────────────────────────────
-- Admins
-- ────────────────────────────────────────────────────────────
INSERT INTO admins (full_name, email, password_hash, role, is_active)
VALUES
  ('Trinity System Administrator', 'sysadmin@trinity.edu.ng',  @sys_hash,  'system_admin',   TRUE),
  ('Trinity Elections Administrator', 'elections@trinity.edu.ng', @elec_hash, 'election_admin', TRUE)
AS new_row
ON DUPLICATE KEY UPDATE
  full_name     = new_row.full_name,
  password_hash = new_row.password_hash,
  role          = new_row.role,
  is_active     = TRUE;

-- ────────────────────────────────────────────────────────────
-- Students
-- ────────────────────────────────────────────────────────────
INSERT INTO students (matric_no, full_name, email, password_hash, is_active)
VALUES
  ('TU/24/0001', 'Adaobi Nwosu',     'adaobi.nwosu@stu.trinity.edu.ng',    @student_hash, TRUE),
  ('TU/24/0002', 'Michael Yusuf',    'michael.yusuf@stu.trinity.edu.ng',    @student_hash, TRUE),
  ('TU/24/0003', 'Deborah Ogunleye', 'deborah.ogunleye@stu.trinity.edu.ng', @student_hash, TRUE),
  ('TU/24/0004', 'Samuel Eze',       'samuel.eze@stu.trinity.edu.ng',       @student_hash, TRUE),
  ('TU/24/0005', 'Favour Bassey',    'favour.bassey@stu.trinity.edu.ng',    @student_hash, TRUE),
  ('TU/24/0006', 'Joshua Bello',     'joshua.bello@stu.trinity.edu.ng',     @student_hash, TRUE)
AS new_row
ON DUPLICATE KEY UPDATE
  full_name     = new_row.full_name,
  email         = new_row.email,
  password_hash = new_row.password_hash,
  is_active     = TRUE;

-- ────────────────────────────────────────────────────────────
-- Election  (active: started 1 h ago, ends in 24 h)
-- Skipped if the demo election already exists.
-- ────────────────────────────────────────────────────────────
INSERT INTO elections
  (title, description, start_time, end_time, status, results_published, created_by)
SELECT
  'Trinity University Student Union Election',
  'Official Student Union Election for Trinity University, Yaba.',
  DATE_SUB(NOW(), INTERVAL 1 HOUR),
  DATE_ADD(NOW(), INTERVAL 24 HOUR),
  'active',
  FALSE,
  admin_id
FROM admins
WHERE role = 'system_admin'
  AND NOT EXISTS (
    SELECT 1 FROM elections
    WHERE title = 'Trinity University Student Union Election'
  )
ORDER BY admin_id ASC
LIMIT 1;

SET @election_id = (
  SELECT election_id FROM elections
  WHERE title = 'Trinity University Student Union Election'
  LIMIT 1
);

-- ────────────────────────────────────────────────────────────
-- Positions  (skipped individually if already present)
-- ────────────────────────────────────────────────────────────
INSERT INTO positions (election_id, name, max_selection, display_order)
SELECT @election_id, 'President', 1, 1
WHERE NOT EXISTS (
  SELECT 1 FROM positions WHERE election_id = @election_id AND name = 'President'
);

INSERT INTO positions (election_id, name, max_selection, display_order)
SELECT @election_id, 'Secretary', 1, 2
WHERE NOT EXISTS (
  SELECT 1 FROM positions WHERE election_id = @election_id AND name = 'Secretary'
);

INSERT INTO positions (election_id, name, max_selection, display_order)
SELECT @election_id, 'Treasurer', 1, 3
WHERE NOT EXISTS (
  SELECT 1 FROM positions WHERE election_id = @election_id AND name = 'Treasurer'
);

-- ────────────────────────────────────────────────────────────
-- Candidates  (skipped if already present via unique constraint)
-- ────────────────────────────────────────────────────────────
-- President: Adaobi Nwosu (TU/24/0001), Michael Yusuf (TU/24/0002)
INSERT IGNORE INTO candidates (position_id, student_id, full_name, manifesto, is_active)
SELECT
  p.position_id,
  s.student_id,
  s.full_name,
  CONCAT(s.full_name, ' is contesting for President in the demo election.'),
  TRUE
FROM positions p
JOIN students s ON s.matric_no IN ('TU/24/0001', 'TU/24/0002')
WHERE p.election_id = @election_id
  AND p.name = 'President';

-- Secretary: Deborah Ogunleye (TU/24/0003), Samuel Eze (TU/24/0004)
INSERT IGNORE INTO candidates (position_id, student_id, full_name, manifesto, is_active)
SELECT
  p.position_id,
  s.student_id,
  s.full_name,
  CONCAT(s.full_name, ' is contesting for Secretary in the demo election.'),
  TRUE
FROM positions p
JOIN students s ON s.matric_no IN ('TU/24/0003', 'TU/24/0004')
WHERE p.election_id = @election_id
  AND p.name = 'Secretary';

-- Treasurer: Favour Bassey (TU/24/0005), Joshua Bello (TU/24/0006)
INSERT IGNORE INTO candidates (position_id, student_id, full_name, manifesto, is_active)
SELECT
  p.position_id,
  s.student_id,
  s.full_name,
  CONCAT(s.full_name, ' is contesting for Treasurer in the demo election.'),
  TRUE
FROM positions p
JOIN students s ON s.matric_no IN ('TU/24/0005', 'TU/24/0006')
WHERE p.election_id = @election_id
  AND p.name = 'Treasurer';
