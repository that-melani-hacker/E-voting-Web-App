import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LayoutShell from "../../components/LayoutShell";
import http from "../../api/http";

const VoteConfirmationPage = () => {
  const { electionId } = useParams();
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConfirmation = async () => {
      try {
        const { data } = await http.get(`/student/elections/${electionId}/confirmation`);
        setConfirmation(data.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load vote confirmation");
      }
    };

    fetchConfirmation();
  }, [electionId]);

  return (
    <LayoutShell title="Vote Confirmation">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-soft">
        {error ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : confirmation ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Submission Successful</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Your ballot has been recorded</h2>
            <p className="mt-4 text-slate-600">
              Your vote choices remain private. Keep the confirmation code below for reference.
            </p>
            <div className="mt-8 rounded-3xl bg-brand-50 p-6">
              <p className="text-sm text-brand-700">Receipt Code</p>
              <p className="mt-2 text-3xl font-bold tracking-[0.2em] text-brand-900">{confirmation.receipt_code}</p>
              <p className="mt-4 text-sm text-slate-600">Submitted at: {confirmation.voted_at}</p>
            </div>
          </>
        ) : (
          <p className="text-slate-600">Loading confirmation...</p>
        )}

        <Link
          to="/student/election"
          className="mt-8 inline-flex rounded-2xl border border-brand-200 px-5 py-3 text-sm font-semibold text-brand-700"
        >
          Back to Election Page
        </Link>
      </div>
    </LayoutShell>
  );
};

export default VoteConfirmationPage;

