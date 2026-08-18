import { useNavigate, useParams } from "react-router-dom";
import AppointmentDetail from "./AppointmentDetail";

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <button type="button" className="admin-back-link" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h2>Patient Details</h2>
      <AppointmentDetail appointmentId={id} onDeleted={() => navigate(-1)} />
    </>
  );
}
