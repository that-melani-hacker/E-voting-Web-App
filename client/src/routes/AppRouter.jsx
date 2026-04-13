import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import StudentLoginPage from "../pages/student/StudentLoginPage";
import StudentRegisterPage from "../pages/student/StudentRegisterPage";
import StudentBallotPage from "../pages/student/StudentBallotPage";
import VoteConfirmationPage from "../pages/student/VoteConfirmationPage";
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<StudentLoginPage />} />
    <Route path="/register" element={<StudentRegisterPage />} />
    <Route path="/admin" element={<AdminLoginPage />} />

    <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
      <Route path="/student/election" element={<StudentBallotPage />} />
      <Route path="/student/confirmation/:electionId" element={<VoteConfirmationPage />} />
    </Route>

    <Route element={<ProtectedRoute allowedRoles={["election_admin", "system_admin"]} />}>
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRouter;

