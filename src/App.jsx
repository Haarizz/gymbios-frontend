  import { Routes, Route,Navigate } from "react-router-dom";

  import MemberPage from "./components/MemberPage";
  import Dashboard from "./components/Dashboard";
  import MembersListPage from "./components/MembersListPage";
  import StaffPage from "./components/StaffPage";
  import StaffListPage from "./components/StaffListPage";
  import CreatePlanPage from "./components/CreatePlanPage";
  import EditPlanPage from "./components/EditPlanPage";
  import ManagePlansPage from "./components/ManagePlansPage";
  import EditMemberPage from "./components/EditMemberPage";
  import EditStaffPage from "./components/EditStaffPage";
  import LoginPage from "./components/LoginPage";
  import PrivateRoute from "./components/PrivateRoute";

  export default function App() {

    return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<LoginPage />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/addmembers"
          element={
            <PrivateRoute>
              <MemberPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/members"
          element={
            <PrivateRoute>
              <MembersListPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/edit-member/:id"
          element={
            <PrivateRoute>
              <EditMemberPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <PrivateRoute>
              <StaffListPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/add-staff"
          element={
            <PrivateRoute>
              <StaffPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/edit-staff/:id"
          element={
            <PrivateRoute>
              <EditStaffPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/plans"
          element={
            <PrivateRoute>
              <ManagePlansPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/create-plan"
          element={
            <PrivateRoute>
              <CreatePlanPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/edit-plan/:planId"
          element={
            <PrivateRoute>
              <EditPlanPage />
            </PrivateRoute>
          }
        />
      </Routes>
    );
  }
