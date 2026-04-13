# Trinity University E-Voting System

Web-based e-voting platform for Trinity University Student Union elections.

## Structure

- `client` - React + Tailwind frontend
- `server` - Node.js + Express API
- `database` - MySQL schema
- `PROJECT_SPEC.md` - approved project specification

## Quick Start

### Backend
1. Copy `server/.env.example` to `server/.env`
2. Create the MySQL database
3. Run `database/schema.sql`
4. Run `npm install` inside `server`
5. Seed demo data with `npm run seed:demo`
6. Start the API server with `npm run dev`

### Frontend
1. Copy `client/.env.example` to `client/.env`
2. Run `npm install` inside `client`
3. Start the React development server with `npm run dev`

## API Highlights

- `POST /api/auth/student/login`
- `POST /api/auth/admin/login`
- `GET /api/student/elections/active`
- `POST /api/student/elections/:electionId/vote`
- `GET /api/admin/elections`
- `POST /api/admin/elections`
- `GET /api/admin/elections/:electionId/results`
- `GET /api/admin/audit-logs`

## Demo Credentials

After running `npm run seed:demo` in `server`:

- System admin email: `grace.adebayo@trinity.edu.ng`
- Election admin email: `daniel.okafor@trinity.edu.ng`
- Admin password: `AdminPass123!`
- Sample student matric numbers: `TU/24/0001` to `TU/24/0006`
- Student password: `StudentPass123!`

## Notes

- Passwords are hashed with bcrypt using 12 salt rounds.
- Votes are stored without `student_id` to preserve ballot secrecy.
- Vote participation is tracked separately in `voter_participation`.
- Audit logging is built into authentication, voting, and admin actions.
- Login lockout activates after 5 failed attempts and uses a temporary lock window.
- I was not able to run installs or execute the app in this environment, so dependency installation and runtime verification are still needed.
