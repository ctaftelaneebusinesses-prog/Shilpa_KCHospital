import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "./AdminAuthContext";
import { injectAdminStyles } from "./adminStyles";
import Login from "./Login";
import Layout from "./Layout";
import Dashboard from "./Dashboard";
import Calendar from "./Calendar";
import DateView from "./DateView";
import AppointmentsList from "./AppointmentsList";
import AppointmentDetailPage from "./AppointmentDetailPage";
import PaymentsHistory from "./PaymentsHistory";
import Settings from "./Settings";

injectAdminStyles();

export default function AdminApp() {
  return (
    <div className="admin-app">
      <AdminAuthProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="appointments" element={<AppointmentsList />} />
            <Route path="appointments/:id" element={<AppointmentDetailPage />} />
            <Route path="dates/:date" element={<DateView />} />
            <Route path="payments" element={<PaymentsHistory />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AdminAuthProvider>
    </div>
  );
}
