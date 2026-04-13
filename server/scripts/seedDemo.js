const bcrypt = require("bcrypt");
const pool = require("../src/config/db");
const env = require("../src/config/env");

const seedConfig = {
  adminPassword: "AdminPass123!",
  studentPassword: "StudentPass123!",
  electionTitle: "Trinity University Student Union Election Demo",
};

const admins = [
  {
    full_name: "Grace Adebayo",
    email: "grace.adebayo@trinity.edu.ng",
    role: "system_admin",
  },
  {
    full_name: "Daniel Okafor",
    email: "daniel.okafor@trinity.edu.ng",
    role: "election_admin",
  },
];

const students = [
  {
    matric_no: "TU/24/0001",
    full_name: "Adaobi Nwosu",
    email: "adaobi.nwosu@stu.trinity.edu.ng",
  },
  {
    matric_no: "TU/24/0002",
    full_name: "Michael Yusuf",
    email: "michael.yusuf@stu.trinity.edu.ng",
  },
  {
    matric_no: "TU/24/0003",
    full_name: "Deborah Ogunleye",
    email: "deborah.ogunleye@stu.trinity.edu.ng",
  },
  {
    matric_no: "TU/24/0004",
    full_name: "Samuel Eze",
    email: "samuel.eze@stu.trinity.edu.ng",
  },
  {
    matric_no: "TU/24/0005",
    full_name: "Favour Bassey",
    email: "favour.bassey@stu.trinity.edu.ng",
  },
  {
    matric_no: "TU/24/0006",
    full_name: "Joshua Bello",
    email: "joshua.bello@stu.trinity.edu.ng",
  },
];

const positions = [
  { name: "President", display_order: 1, candidates: ["TU/24/0001", "TU/24/0002"] },
  { name: "Secretary", display_order: 2, candidates: ["TU/24/0003", "TU/24/0004"] },
  { name: "Treasurer", display_order: 3, candidates: ["TU/24/0005", "TU/24/0006"] },
];

const createFutureWindow = () => {
  const start = new Date(Date.now() - 60 * 60 * 1000);
  const end = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { start, end };
};

const formatDateTime = (value) => value.toISOString().slice(0, 19).replace("T", " ");

const upsertAdmins = async (passwordHash) => {
  for (const admin of admins) {
    await pool.query(
      `INSERT INTO admins (full_name, email, password_hash, role, is_active)
       VALUES (?, ?, ?, ?, TRUE)
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name),
         password_hash = VALUES(password_hash),
         role = VALUES(role),
         is_active = TRUE`,
      [admin.full_name, admin.email, passwordHash, admin.role]
    );
  }
};

const upsertStudents = async (passwordHash) => {
  for (const student of students) {
    await pool.query(
      `INSERT INTO students (matric_no, full_name, email, password_hash, is_active)
       VALUES (?, ?, ?, ?, TRUE)
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name),
         email = VALUES(email),
         password_hash = VALUES(password_hash),
         is_active = TRUE`,
      [student.matric_no, student.full_name, student.email, passwordHash]
    );
  }
};

const getSystemAdminId = async () => {
  const [rows] = await pool.query(
    `SELECT admin_id
     FROM admins
     WHERE role = 'system_admin'
     ORDER BY admin_id ASC
     LIMIT 1`
  );
  return rows[0]?.admin_id;
};

const upsertElection = async (createdBy) => {
  const { start, end } = createFutureWindow();
  const [existingRows] = await pool.query(
    `SELECT election_id
     FROM elections
     WHERE title = ?
     LIMIT 1`,
    [seedConfig.electionTitle]
  );

  if (existingRows[0]?.election_id) {
    await pool.query(
      `UPDATE elections
       SET description = ?, start_time = ?, end_time = ?, status = 'active', results_published = FALSE, created_by = ?
       WHERE election_id = ?`,
      [
        "Demo election seeded for Trinity University Student Union testing.",
        formatDateTime(start),
        formatDateTime(end),
        createdBy,
        existingRows[0].election_id,
      ]
    );
    return existingRows[0].election_id;
  }

  const [result] = await pool.query(
    `INSERT INTO elections (title, description, start_time, end_time, status, results_published, created_by)
     VALUES (?, ?, ?, ?, 'active', FALSE, ?)`,
    [
      seedConfig.electionTitle,
      "Demo election seeded for Trinity University Student Union testing.",
      formatDateTime(start),
      formatDateTime(end),
      createdBy,
    ]
  );

  return result.insertId;
};

const clearElectionChildren = async (electionId) => {
  await pool.query(
    `DELETE v
     FROM votes v
     INNER JOIN positions p ON p.position_id = v.position_id
     WHERE p.election_id = ?`,
    [electionId]
  );
  await pool.query(`DELETE FROM voter_participation WHERE election_id = ?`, [electionId]);
  await pool.query(
    `DELETE c
     FROM candidates c
     INNER JOIN positions p ON p.position_id = c.position_id
     WHERE p.election_id = ?`,
    [electionId]
  );
  await pool.query(`DELETE FROM positions WHERE election_id = ?`, [electionId]);
};

const getStudentIdByMatric = async (matricNo) => {
  const [rows] = await pool.query(
    `SELECT student_id
     FROM students
     WHERE matric_no = ?
     LIMIT 1`,
    [matricNo]
  );
  return rows[0]?.student_id;
};

const seedPositionsAndCandidates = async (electionId) => {
  for (const position of positions) {
    const [positionResult] = await pool.query(
      `INSERT INTO positions (election_id, name, max_selection, display_order)
       VALUES (?, ?, 1, ?)`,
      [electionId, position.name, position.display_order]
    );

    for (const matricNo of position.candidates) {
      const studentId = await getStudentIdByMatric(matricNo);
      const student = students.find((item) => item.matric_no === matricNo);

      await pool.query(
        `INSERT INTO candidates (position_id, student_id, full_name, manifesto, is_active)
         VALUES (?, ?, ?, ?, TRUE)`,
        [
          positionResult.insertId,
          studentId,
          student.full_name,
          `${student.full_name} is contesting for ${position.name} in the demo election.`,
        ]
      );
    }
  }
};

const main = async () => {
  try {
    const adminPasswordHash = await bcrypt.hash(seedConfig.adminPassword, env.bcryptSaltRounds);
    const studentPasswordHash = await bcrypt.hash(seedConfig.studentPassword, env.bcryptSaltRounds);

    await upsertAdmins(adminPasswordHash);
    await upsertStudents(studentPasswordHash);

    const systemAdminId = await getSystemAdminId();
    if (!systemAdminId) {
      throw new Error("Unable to find a system admin after seeding admins");
    }

    const electionId = await upsertElection(systemAdminId);
    await clearElectionChildren(electionId);
    await seedPositionsAndCandidates(electionId);

    console.log("Demo seed completed successfully.");
    console.log(`Admin password: ${seedConfig.adminPassword}`);
    console.log(`Student password: ${seedConfig.studentPassword}`);
    console.log(`Election title: ${seedConfig.electionTitle}`);
  } catch (error) {
    console.error("Demo seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

main();

