import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Trophy, ChevronLeft } from "lucide-react";
import LayoutShell from "../../components/LayoutShell";
import http from "../../api/http";

const StudentResultsPage = () => {
  const { electionId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    http.get(`/student/elections/${electionId}/results`)
      .then(({ data: res }) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Unable to load results"));
  }, [electionId]);

  return (
    <LayoutShell title="Election Results">
      <div className="space-y-6">
        <Link
          to="/student/election"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>

        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {data && (
          <>
            <div className="rounded-3xl bg-brand-900 p-6 text-white shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-200">Official Results</p>
              <h2 className="mt-2 text-2xl font-bold">{data.election.title}</h2>
              <p className="mt-1 text-sm text-brand-50/70">Results have been certified and published.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {data.results.map((position) => (
                <div key={position.position_id} className="rounded-3xl bg-white p-6 shadow-soft">
                  <h3 className="text-lg font-bold text-slate-900">{position.position_name}</h3>
                  <div className="mt-4 space-y-3">
                    {position.candidates.map((candidate, idx) => (
                      <div
                        key={candidate.candidate_id}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                          candidate.is_winner
                            ? "bg-brand-50 ring-1 ring-brand-300"
                            : "bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {candidate.is_winner && (
                            <Trophy className="h-4 w-4 shrink-0 text-brand-600" />
                          )}
                          {!candidate.is_winner && (
                            <span className="w-4 text-center text-xs font-semibold text-slate-400">
                              {idx + 1}
                            </span>
                          )}
                          <p className={`font-semibold ${candidate.is_winner ? "text-brand-900" : "text-slate-700"}`}>
                            {candidate.candidate_name}
                          </p>
                        </div>
                        <span className={`text-sm font-bold ${candidate.is_winner ? "text-brand-700" : "text-slate-500"}`}>
                          {candidate.vote_count} {candidate.vote_count === 1 ? "vote" : "votes"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!data && !error && (
          <div className="rounded-3xl bg-white p-8 shadow-soft text-slate-500">Loading results...</div>
        )}
      </div>
    </LayoutShell>
  );
};

export default StudentResultsPage;
