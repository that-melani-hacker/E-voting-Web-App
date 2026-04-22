import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import LayoutShell from "../../components/LayoutShell";
import StatusCard from "../../components/StatusCard";
import http from "../../api/http";

const StudentBallotPage = () => {
  const navigate = useNavigate();
  const [ballot, setBallot] = useState(null);
  const [publishedElections, setPublishedElections] = useState([]);
  const [selectionMap, setSelectionMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activeRes, publishedRes] = await Promise.all([
          http.get("/student/elections/active"),
          http.get("/student/elections/published"),
        ]);
        setBallot(activeRes.data.data);
        setPublishedElections(publishedRes.data.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load election data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedCount = useMemo(() => Object.keys(selectionMap).length, [selectionMap]);

  const handleSelect = (positionId, candidateId) => {
    setSelectionMap((current) => ({
      ...current,
      [positionId]: candidateId,
    }));
  };

  const handleSubmit = async () => {
    if (!ballot?.positions?.length) {
      return;
    }

    if (selectedCount !== ballot.positions.length) {
      setError("Please select one candidate for every listed position before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        selections: Object.entries(selectionMap).map(([position_id, candidate_id]) => ({
          position_id: Number(position_id),
          candidate_id,
        })),
      };

      await http.post(`/student/elections/${ballot.election_id}/vote`, payload);
      navigate(`/student/confirmation/${ballot.election_id}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Vote submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LayoutShell title="Student Voting Portal">
      {loading ? (
        <div className="rounded-3xl bg-white p-8 shadow-soft">Loading active election...</div>
      ) : !ballot ? (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-8 shadow-soft">
            <p className="text-lg font-semibold text-slate-900">No active election is available right now.</p>
            <p className="mt-2 text-sm text-slate-600">Please check again during the official voting window.</p>
          </div>
          {publishedElections.length > 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-brand-700" />
                <h2 className="text-lg font-bold text-slate-900">Published Results</h2>
              </div>
              <div className="space-y-3">
                {publishedElections.map((election) => (
                  <Link
                    key={election.election_id}
                    to={`/student/results/${election.election_id}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50"
                  >
                    <p className="font-semibold text-slate-900">{election.title}</p>
                    <span className="text-sm font-semibold text-brand-700">View Results →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatusCard label="Election" value={ballot.title} />
            <StatusCard label="Positions" value={ballot.positions.length} />
            <StatusCard label="Selections Made" value={selectedCount} tone="slate" />
          </div>

          <section className="rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-bold text-slate-900">{ballot.title}</h2>
            <p className="mt-2 text-sm text-slate-600">
              Select one candidate per position. Your vote will be securely recorded and anonymized.
            </p>
          </section>

          {ballot.positions.map((position) => (
            <section key={position.position_id} className="rounded-3xl bg-white p-6 shadow-soft">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900">{position.name}</h3>
                <p className="text-sm text-slate-500">Select {position.max_selection} candidate</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {position.candidates.map((candidate) => {
                  const checked = selectionMap[position.position_id] === candidate.candidate_id;
                  return (
                    <label
                      key={candidate.candidate_id}
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        checked ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name={`position-${position.position_id}`}
                          checked={checked}
                          onChange={() => handleSelect(position.position_id, candidate.candidate_id)}
                          className="mt-1 shrink-0"
                        />
                        {candidate.photo_url && (
                          <img
                            src={candidate.photo_url}
                            alt={candidate.full_name}
                            className="h-14 w-14 shrink-0 rounded-xl object-cover border border-slate-200"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">{candidate.full_name}</p>
                          {candidate.department && (
                            <p className="mt-0.5 text-xs font-medium text-brand-700">{candidate.department}</p>
                          )}
                          <p className="mt-2 text-sm text-slate-600">
                            {candidate.manifesto || "No campaign statement available."}
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          ))}

          {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-2xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting Vote..." : "Submit Vote"}
            </button>
          </div>
        </div>
      )}
    </LayoutShell>
  );
};

export default StudentBallotPage;

