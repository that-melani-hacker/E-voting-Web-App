# Trinity University E-Voting System

## 1. Project Summary

### Project Name
Trinity University E-Voting System

### Purpose
Build a secure, transparent, and auditable web-based voting platform for Trinity University Student Union elections. The system must allow eligible students to vote online, enforce one-student-one-vote, preserve ballot secrecy, support election administration, and maintain a verifiable audit trail of key actions.

### Primary Goals
- Enable eligible students to authenticate and vote securely online.
- Enforce one vote per student per election at the backend and database levels.
- Preserve ballot privacy by separating participation tracking from vote records.
- Provide election administrators with tools to create, manage, monitor, and publish elections.
- Produce an audit-ready record of authentication events, election changes, voting activity, and result publication.

### Out of Scope
- National or public election use cases.
- Biometric authentication.
- Blockchain-based voting.
- Offline voting devices or kiosk integrations.
- Native mobile applications.

## 2. Stakeholders and User Roles

### Student (Voter)
- Logs in using matriculation number and password.
- Views the active election and available positions.
- Selects one candidate per position.
- Submits vote once per election.
- Receives a confirmation receipt after successful submission.

### Election Administrator
- Creates and configures elections.
- Creates positions under an election.
- Adds and manages candidates per position.
- Activates or closes elections.
- Reviews results and publishes them after the election ends.
- Views audit logs relevant to election operations.

### System Administrator
- Manages admin accounts and access roles.
- Manages student/admin user status.
- Reviews system-wide audit trails and access events.
- Maintains operational oversight of the platform.

## 3. Functional Requirements

### 3.1 Voter Authentication
- Students log in with `matric_no` and password.
- Passwords must be stored using `bcrypt` with `saltRounds = 12`.
- On successful login, the server issues a JWT that expires in 2 hours.
- All login attempts, both successful and failed, are logged to `audit_logs`.
- Accounts are temporarily blocked after 5 consecutive failed login attempts.
- Locked or inactive users cannot authenticate.
- Protected APIs require a valid JWT in the `Authorization: Bearer <token>` header.

### 3.2 Election Setup and Administration
- Election administrators can create an election with title, start date, end date, and status.
- An election can contain multiple positions.
- Each position supports a configurable `max_selection`, defaulting to `1`.
- Candidates are linked to existing students and attached to a specific position.
- Only administrators may create, edit, activate, close, or publish elections.
- All admin changes are captured in `audit_logs`.

### 3.3 Voting Flow
- A logged-in student can view the currently active election.
- The ballot displays all positions and candidates for that election.
- The student may choose only one candidate per position unless `max_selection` allows otherwise.
- On submit, the backend must:
  - Verify that an election is active and within the valid voting window.
  - Verify the student is eligible and not locked or inactive.
  - Verify the student has not already voted in that election.
  - Insert vote rows without attaching `student_id` to the vote records.
  - Insert one `voter_participation` row for that student and election.
  - Log the vote submission event.
- A clear error message must be returned if the student already voted or the election is closed/ineligible.

### 3.4 Results and Audit Dashboard
- Admins can view aggregated results by election, position, and candidate.
- The leading candidate or winner per position is highlighted.
- Results can be exported to CSV.
- Results are only visible after election close, unless explicitly allowed for internal admin review.
- Audit logs are searchable and filterable by action type.
- Audit log listing must support pagination for large datasets.

## 4. Non-Functional Requirements

### Security
- HTTPS enforced in deployment.
- Role-Based Access Control for all protected routes.
- Input validation and sanitization on all request bodies, params, and query values.
- SQL injection prevention via parameterized queries.
- Secure password storage with bcrypt.
- JWT expiry fixed at 2 hours.
- Rate limiting for login endpoints.

### Privacy
- Ballot secrecy must be preserved at the database level.
- `votes` must not include `student_id`.
- Student participation must be tracked separately in `voter_participation`.
- Admins can confirm who voted, but not how any individual voted.

### Auditability
- Log login attempts, vote submissions, election changes, publication actions, and privileged access.
- Audit entries must include actor, action, IP address, details, and timestamp.
- Write audit logs from backend services only, not from the frontend.

### Reliability and Performance
- Voting submission must be transactional.
- System should support concurrent student submissions without duplicate participation records.
- Queries for results and logs should be indexed for fast admin access.

### Usability
- Clean, simple, mobile-responsive interface.
- Compatible with Chrome, Firefox, and Edge.
- University-branded green and white visual theme.
- Clear success, warning, and error feedback throughout the user journey.

## 5. High-Level System Architecture

### Frontend
- React.js single-page application.
- Tailwind CSS for styling and responsive layouts.
- React Router for role-based navigation.
- Axios or Fetch wrapper for authenticated API calls.

### Backend
- Node.js with Express.js REST API.
- Layered structure using routes, controllers, services, middleware, and models.
- JWT authentication middleware.
- RBAC middleware for admin-only and system-admin-only endpoints.
- Validation middleware for all inputs.
- Audit logging service used across authentication, voting, and admin workflows.

### Database
- MySQL relational database.
- InnoDB tables with foreign keys and transactional vote submission.
- Indexes on election, participation, candidate, and audit log access patterns.

## 6. Recommended Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios
- React Hook Form

### Backend
- Node.js
- Express.js
- mysql2
- jsonwebtoken
- bcrypt
- express-validator
- helmet
- cors
- dotenv
- morgan or pino for request logging

### Development and Quality
- Git
- Postman
- Visual Studio Code
- ESLint
- Prettier

## 7. Security Design

### Authentication
- Student login uses `matric_no + password`.
- Admin login uses `email + password`.
- Password hashes are stored with bcrypt salt rounds of 12.
- JWT payload should contain:
  - `sub`: user ID
  - `role`: `student`, `election_admin`, or `system_admin`
  - `type`: `student` or `admin`
  - `exp`: 2-hour expiry

### Authorization
- `student` role can access only voter endpoints.
- `election_admin` can manage elections, candidates, results, and audit logs as allowed.
- `system_admin` can manage users, roles, and system-wide settings.

### Login Protection
- Track consecutive failed attempts.
- Lock account after 5 failed attempts.
- Recommended temporary lock duration: 15 minutes.
- Record both failed and successful login attempts in `audit_logs`.

### Voting Integrity
- Use a database transaction during vote submission.
- Insert participation record first or within the same transaction using a unique constraint.
- If `UNIQUE(student_id, election_id)` is violated, reject the vote as already submitted.
- Verify each candidate belongs to the submitted position and active election before insert.

### Ballot Secrecy
- Do not persist `student_id` in `votes`.
- Optional `ballot_ref` may be used to group vote rows for one anonymous ballot.
- Confirmation shown to student should use a generated receipt or reference code stored in `voter_participation`, not a vote-to-student mapping.

## 8. Data Model

The following schema keeps the user-provided structure while adding a few implementation-oriented columns needed for locking, status control, and anonymous receipt handling.

### 8.1 `students`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `student_id` | INT | PK, AUTO_INCREMENT | Internal student ID |
| `matric_no` | VARCHAR(30) | UNIQUE, NOT NULL | Login identifier |
| `full_name` | VARCHAR(150) | NOT NULL | Student full name |
| `email` | VARCHAR(150) | UNIQUE, NOT NULL | Student email |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash |
| `is_active` | BOOLEAN | DEFAULT TRUE | Eligibility/access flag |
| `failed_login_attempts` | INT | DEFAULT 0 | Login protection |
| `locked_until` | DATETIME | NULL | Temporary lock time |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Created timestamp |

### 8.2 `admins`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `admin_id` | INT | PK, AUTO_INCREMENT | Internal admin ID |
| `full_name` | VARCHAR(150) | NOT NULL | Admin name |
| `email` | VARCHAR(150) | UNIQUE, NOT NULL | Admin login |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash |
| `role` | ENUM | `election_admin`, `system_admin` | RBAC role |
| `is_active` | BOOLEAN | DEFAULT TRUE | Access control |
| `failed_login_attempts` | INT | DEFAULT 0 | Login protection |
| `locked_until` | DATETIME | NULL | Temporary lock time |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Created timestamp |

### 8.3 `elections`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `election_id` | INT | PK, AUTO_INCREMENT | Election ID |
| `title` | VARCHAR(200) | NOT NULL | Election title |
| `description` | TEXT | NULL | Optional description |
| `start_time` | DATETIME | NOT NULL | Voting opens |
| `end_time` | DATETIME | NOT NULL | Voting closes |
| `status` | ENUM | `upcoming`, `active`, `closed` | Admin-set status |
| `results_published` | BOOLEAN | DEFAULT FALSE | Publication flag |
| `created_by` | INT | FK -> `admins.admin_id` | Creator |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Created timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Updated timestamp |

### 8.4 `positions`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `position_id` | INT | PK, AUTO_INCREMENT | Position ID |
| `election_id` | INT | FK -> `elections.election_id` | Parent election |
| `name` | VARCHAR(120) | NOT NULL | Position name |
| `max_selection` | INT | DEFAULT 1 | Selection limit |
| `display_order` | INT | DEFAULT 0 | Ballot ordering |

### 8.5 `candidates`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `candidate_id` | INT | PK, AUTO_INCREMENT | Candidate ID |
| `position_id` | INT | FK -> `positions.position_id` | Position |
| `student_id` | INT | FK -> `students.student_id` | Candidate student record |
| `full_name` | VARCHAR(150) | NOT NULL | Snapshot for display |
| `manifesto` | TEXT | NULL | Optional manifesto |
| `photo_url` | VARCHAR(255) | NULL | Optional profile photo |
| `is_active` | BOOLEAN | DEFAULT TRUE | Candidate visibility |

Recommended constraint:
- `UNIQUE(position_id, student_id)` to prevent duplicate candidature per position.

### 8.6 `votes`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `vote_id` | BIGINT | PK, AUTO_INCREMENT | Vote row ID |
| `election_id` | INT | FK -> `elections.election_id` | Election |
| `position_id` | INT | FK -> `positions.position_id` | Position |
| `candidate_id` | INT | FK -> `candidates.candidate_id` | Candidate |
| `ballot_ref` | CHAR(36) | NOT NULL | Anonymous ballot grouping ID |
| `voted_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Time recorded |

Important rule:
- No `student_id` may exist in this table.

### 8.7 `voter_participation`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Participation ID |
| `student_id` | INT | FK -> `students.student_id` | Voter identity |
| `election_id` | INT | FK -> `elections.election_id` | Election |
| `receipt_code` | VARCHAR(50) | UNIQUE, NOT NULL | Confirmation code |
| `voted_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Participation timestamp |

Required constraint:
- `UNIQUE(student_id, election_id)` to enforce one-student-one-vote.

### 8.8 `audit_logs`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `audit_id` | BIGINT | PK, AUTO_INCREMENT | Audit ID |
| `actor_id` | INT | NOT NULL | User ID performing action |
| `actor_type` | ENUM | `student`, `admin`, `system` | Actor category |
| `action_type` | ENUM | `login_success`, `login_failed`, `vote_submitted`, `election_created`, `election_updated`, `election_closed`, `candidate_added`, `result_published`, `admin_action`, `access_denied` | Action type |
| `details` | TEXT | NULL | Human-readable event details |
| `ip_address` | VARCHAR(45) | NULL | IPv4/IPv6 |
| `correlation_id` | CHAR(36) | NULL | Request trace ID |
| `timestamp` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Event timestamp |

### 8.9 Core Relationships
- One `election` has many `positions`.
- One `position` has many `candidates`.
- One `student` may be a candidate in many elections or positions.
- One `student` may have one `voter_participation` per election.
- One submitted ballot produces many rows in `votes`, one per selected position/candidate.
- `votes` are linked to elections and positions, but not to the student identity.

## 9. Database Constraints and Indexing

### Required Constraints
- `students.matric_no` unique
- `students.email` unique
- `admins.email` unique
- `voter_participation(student_id, election_id)` unique
- `candidates(position_id, student_id)` unique

### Recommended Indexes
- `elections(status, start_time, end_time)`
- `positions(election_id)`
- `candidates(position_id)`
- `votes(election_id, position_id, candidate_id)`
- `voter_participation(election_id, student_id)`
- `audit_logs(action_type, timestamp)`
- `audit_logs(actor_type, actor_id, timestamp)`

## 10. API Design

### Authentication
- `POST /api/auth/student/login`
- `POST /api/auth/admin/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Student Voting
- `GET /api/student/elections/active`
- `GET /api/student/elections/:electionId/ballot`
- `POST /api/student/elections/:electionId/vote`
- `GET /api/student/elections/:electionId/confirmation`

### Election Administration
- `POST /api/admin/elections`
- `GET /api/admin/elections`
- `GET /api/admin/elections/:electionId`
- `PATCH /api/admin/elections/:electionId`
- `PATCH /api/admin/elections/:electionId/status`
- `POST /api/admin/elections/:electionId/positions`
- `PATCH /api/admin/positions/:positionId`
- `POST /api/admin/positions/:positionId/candidates`
- `PATCH /api/admin/candidates/:candidateId`

### Results and Audit
- `GET /api/admin/elections/:electionId/results`
- `GET /api/admin/elections/:electionId/results/export`
- `POST /api/admin/elections/:electionId/publish-results`
- `GET /api/admin/audit-logs`

### System Administration
- `GET /api/system/users`
- `POST /api/system/admins`
- `PATCH /api/system/admins/:adminId`
- `PATCH /api/system/students/:studentId/status`

## 11. Core Backend Workflow Specifications

### 11.1 Student Login Flow
1. Validate `matric_no` and `password`.
2. Lookup student by `matric_no`.
3. Reject inactive or locked accounts.
4. Compare password using `bcrypt.compare`.
5. On failure:
   - Increment failed attempts.
   - Lock account when count reaches 5.
   - Write `login_failed` audit entry.
6. On success:
   - Reset failed attempt counter.
   - Issue JWT with 2-hour expiry.
   - Write `login_success` audit entry.

### 11.2 Vote Submission Flow
1. Authenticate student JWT.
2. Validate election ID and submitted selections.
3. Fetch election and verify `status = active` and current time is between `start_time` and `end_time`.
4. Start database transaction.
5. Insert into `voter_participation`.
6. If unique constraint fails, abort and return `You have already voted in this election`.
7. Generate anonymous `ballot_ref`.
8. Insert one row in `votes` for each selected candidate.
9. Insert `vote_submitted` audit log.
10. Commit transaction.
11. Return receipt code and confirmation summary.

### 11.3 Result Publication Flow
1. Authenticate admin JWT.
2. Verify role is `election_admin` or `system_admin`.
3. Confirm election is closed.
4. Aggregate votes by position and candidate.
5. Mark `results_published = true`.
6. Log `result_published` action.

## 12. Validation Rules

### Authentication
- `matric_no`: required, trimmed, alphanumeric or institution-approved format
- `email`: required, valid email format for admin login
- `password`: required, minimum 8 characters

### Election Setup
- `title`: required, 3 to 200 characters
- `start_time`: required, valid datetime
- `end_time`: required, valid datetime and greater than `start_time`
- `status`: one of `upcoming`, `active`, `closed`

### Positions and Candidates
- `name`: required, unique within an election if possible
- `max_selection`: integer, minimum 1
- `student_id`: required, must reference an existing student

### Vote Submission
- Submitted positions must belong to the target election.
- Submitted candidates must belong to the stated positions.
- Selection count must not exceed `max_selection` per position.

## 13. Audit Logging Requirements

### Events to Capture
- Student login success
- Student login failure
- Admin login success
- Admin login failure
- Vote submission
- Election creation and update
- Position creation/update
- Candidate addition/update
- Election activation/closure
- Results publication
- Access denied or invalid privilege attempts

### Minimum Audit Data
- Actor ID
- Actor type
- Action type
- Human-readable details
- IP address
- Timestamp
- Optional request correlation ID

## 14. Reporting Requirements

### Results Dashboard
- Show election title and status.
- Group results by position.
- Display candidate names and vote totals.
- Highlight winner or leading candidate.
- Handle ties explicitly.

### CSV Export
Suggested columns:
- `election_title`
- `position_name`
- `candidate_name`
- `vote_count`
- `result_rank`
- `generated_at`

### Audit Log Dashboard
- Filter by action type
- Filter by actor type
- Filter by date range
- Paginate results
- Sort descending by timestamp

## 15. Frontend UI Specification

### Student Screens
- Login Page
- Active Election Overview
- Ballot Page
- Vote Confirmation Page

### Admin Screens
- Admin Login
- Dashboard Overview
- Elections Management
- Positions and Candidates Management
- Results Dashboard
- Audit Logs Dashboard

### UI/UX Guidelines
- Mobile-first responsive layout.
- Trinity University green and white brand palette.
- Clear call-to-action buttons.
- Disabled submit state during vote processing.
- Confirmatory messaging after successful vote submission.
- Friendly but explicit error messages.

## 16. Suggested Folder Structure

```text
/trinity-evoting
  /client
    /public
    /src
      /api
      /app
      /components
      /features
        /auth
        /student
        /admin
        /system
      /layouts
      /pages
      /routes
      /utils
      /styles
    package.json
  /server
    /src
      /config
      /controllers
      /middleware
      /models
      /repositories
      /routes
      /services
      /utils
      /validators
      app.js
      server.js
    package.json
  /database
    /migrations
    /seeds
    schema.sql
  PROJECT_SPEC.md
  README.md
```

## 17. Backend Module Responsibilities

### `controllers`
Handle HTTP request and response logic.

### `services`
Contain business logic such as voting, result aggregation, audit logging, and authentication.

### `repositories` or `models`
Handle parameterized MySQL queries and data persistence.

### `middleware`
JWT auth, RBAC, validation error handling, rate limiting, and centralized error handling.

### `validators`
Express-validator rules for auth, elections, candidates, votes, and admin operations.

## 18. Environment Variables

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=trinity_evoting
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=2h
BCRYPT_SALT_ROUNDS=12
```

## 19. Suggested Development Milestones

### Phase 1
- Project setup
- Database schema
- Authentication and RBAC

### Phase 2
- Election management
- Position and candidate management

### Phase 3
- Student ballot and vote submission
- Transactional participation enforcement

### Phase 4
- Results dashboard
- CSV export
- Audit log filters and pagination

### Phase 5
- Security hardening
- Cross-browser QA
- Documentation and demo preparation

## 20. Acceptance Criteria

- Students can log in using matric number and password.
- Passwords are hashed with bcrypt using 12 salt rounds.
- JWT tokens expire after 2 hours.
- Failed login attempts are logged and accounts lock after 5 consecutive failures.
- Admins can create elections, positions, and candidates.
- Students can vote only once per election.
- Votes are stored without student identity in the `votes` table.
- Participation is tracked separately in `voter_participation`.
- Results are aggregated correctly and exportable as CSV.
- Audit logs record all major system actions.
- Protected routes enforce correct role access.
- UI is responsive and aligned with Trinity University branding.

## 21. Implementation Notes

- All vote submissions must run inside a MySQL transaction.
- Time comparisons should use a single trusted server timezone strategy, preferably UTC in storage and localized display in the client.
- Use server-generated receipt codes for confirmation rather than exposing vote IDs.
- Prefer soft access control through `is_active` flags over hard deletes for users participating in audit-sensitive workflows.
- Avoid editing or deleting audit log rows once written.

## 22. Assumptions

- Students and admins are pre-registered by institutional processes.
- A student can contest as a candidate and still vote as a voter, subject to university policy.
- Only one election needs to be active at a time unless later expanded.
- MySQL version supports foreign keys, transactions, and indexed queries required by the design.

## 23. Next Step

After approval of this specification, implementation should begin in this order:
1. Initialize `client`, `server`, and `database` structure.
2. Create MySQL schema and seed files.
3. Build authentication and RBAC.
4. Build election management workflows.
5. Build voting and anonymous participation tracking.
6. Build results, export, and audit dashboards.
