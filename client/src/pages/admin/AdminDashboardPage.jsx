import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ShieldCheck, Zap } from "lucide-react";
import LayoutShell from "../../components/LayoutShell";
import StatusCard from "../../components/StatusCard";
import http from "../../api/http";
import { useAuth } from "../../features/auth/AuthContext";

const ElectionSelect = ({ register, name, elections, required, placeholder = "Select election" }) => (
  <select {...register(name, { required })} className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-700">
    <option value="">{placeholder}</option>
    {elections.map((e) => (
      <option key={e.election_id} value={e.election_id}>{e.title}</option>
    ))}
  </select>
);

const PositionSelect = ({ register, name, positions, required, placeholder = "Select position" }) => (
  <select {...register(name, { required })} className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-700">
    <option value="">{placeholder}</option>
    {positions.map((p) => (
      <option key={p.position_id} value={p.position_id}>{p.name}</option>
    ))}
  </select>
);

const AdminDashboardPage = () => {
  const { auth } = useAuth();
  const isSystemAdmin = auth?.user?.role === "system_admin";

  const electionForm = useForm({
    defaultValues: {
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      status: "upcoming",
    },
  });
  const positionForm = useForm({
    defaultValues: { electionId: "", name: "", max_selection: 1, display_order: 0 },
  });
  const candidateForm = useForm({
    defaultValues: { electionId: "", positionId: "", matric_no: "", full_name: "", department: "", manifesto: "", photo_url: "" },
  });
  const [elections, setElections] = useState([]);
  const [positionsForCandidate, setPositionsForCandidate] = useState([]);
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const watchCandidateElection = candidateForm.watch("electionId");

  useEffect(() => {
    if (!watchCandidateElection) { setPositionsForCandidate([]); return; }
    http.get(`/admin/elections/${watchCandidateElection}/positions`)
      .then(({ data }) => setPositionsForCandidate(data.data))
      .catch(() => setPositionsForCandidate([]));
  }, [watchCandidateElection]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const requests = [http.get("/admin/elections")];
      if (isSystemAdmin) requests.push(http.get("/admin/audit-logs?limit=10"));

      const [electionResponse, auditResponse] = await Promise.all(requests);
      setElections(electionResponse.data.data);
      if (auditResponse) setLogs(auditResponse.data.data.rows);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleCreateElection = electionForm.handleSubmit(async (values) => {
    setError("");
    setMessage("");
    try {
      await http.post("/admin/elections", values);
      setMessage("Election created successfully.");
      electionForm.reset();
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create election");
    }
  });

  const handleCreatePosition = positionForm.handleSubmit(async (values) => {
    setError("");
    setMessage("");
    try {
      await http.post(`/admin/elections/${values.electionId}/positions`, {
        name: values.name,
        max_selection: Number(values.max_selection),
        display_order: Number(values.display_order),
      });
      setMessage("Position created successfully.");
      positionForm.reset();
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create position");
    }
  });

  const handleCreateCandidate = candidateForm.handleSubmit(async (values) => {
    setError("");
    setMessage("");
    try {
      await http.post(`/admin/positions/${values.positionId}/candidates`, {
        matric_no: values.matric_no.trim(),
        full_name: values.full_name.trim(),
        department: values.department.trim(),
        manifesto: values.manifesto || undefined,
        photo_url: values.photo_url || undefined,
      });
      setMessage("Candidate added successfully.");
      candidateForm.reset();
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to add candidate");
    }
  });

  const handleStatusChange = async (electionId, status) => {
    setError("");
    setMessage("");
    try {
      await http.patch(`/admin/elections/${electionId}/status`, { status });
      setMessage(`Election status updated to ${status}.`);
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update election status");
    }
  };

  const handleLoadResults = async (electionId) => {
    setError("");
    try {
      const { data } = await http.get(`/admin/elections/${electionId}/results`);
      setResults(data.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load results");
    }
  };

  const handlePublishResults = async (electionId) => {
    setError("");
    setMessage("");
    try {
      const { data } = await http.post(`/admin/elections/${electionId}/publish-results`);
      setResults(data.data);
      setMessage("Results published successfully.");
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to publish results");
    }
  };

  const handleExportResults = async (electionId) => {
    setError("");
    try {
      const response = await http.get(`/admin/elections/${electionId}/results/export`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `election-${electionId}-results.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to export results");
    }
  };

  return (
    <LayoutShell title="Admin Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatusCard label="Total Elections" value={elections.length} />
          {isSystemAdmin && <StatusCard label="Recent Audit Entries" value={logs.length} tone="slate" />}
          <div className={`flex items-center gap-3 rounded-3xl p-5 shadow-soft ${isSystemAdmin ? "bg-brand-900 text-white" : "bg-amber-50 text-amber-900"}`}>
            {isSystemAdmin
              ? <ShieldCheck className="h-7 w-7 text-brand-200 shrink-0" />
              : <Zap className="h-7 w-7 text-amber-500 shrink-0" />}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70">Signed in as</p>
              <p className="text-lg font-bold">{isSystemAdmin ? "System Admin" : "Election Admin"}</p>
              <p className="text-xs opacity-60 mt-0.5">{isSystemAdmin ? "Full system access" : "Election management only"}</p>
            </div>
          </div>
        </div>

        {(message || error) && (
          <div className={`rounded-2xl px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-brand-50 text-brand-900"}`}>
            {error || message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-soft">
              <h2 className="text-xl font-bold text-slate-900">Create Election</h2>
              <form onSubmit={handleCreateElection} className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  {...electionForm.register("title", { required: true })}
                  placeholder="Election title"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <select {...electionForm.register("status")} className="rounded-2xl border border-slate-200 px-4 py-3">
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
                <input
                  {...electionForm.register("start_time", { required: true })}
                  type="datetime-local"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <input
                  {...electionForm.register("end_time", { required: true })}
                  type="datetime-local"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <textarea
                  {...electionForm.register("description")}
                  placeholder="Optional election description"
                  className="md:col-span-2 rounded-2xl border border-slate-200 px-4 py-3"
                  rows="4"
                />
                <button className="md:col-span-2 rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white">
                  Create Election
                </button>
              </form>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-soft">
              <h2 className="text-xl font-bold text-slate-900">Add Position</h2>
              <form onSubmit={handleCreatePosition} className="mt-4 grid gap-4 md:grid-cols-2">
                <ElectionSelect register={positionForm.register} name="electionId" elections={elections} required />
                <input
                  {...positionForm.register("name", { required: true })}
                  placeholder="Position name"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <input
                  {...positionForm.register("max_selection")}
                  type="number"
                  min="1"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <input
                  {...positionForm.register("display_order")}
                  type="number"
                  min="0"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <button className="md:col-span-2 rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white">
                  Add Position
                </button>
              </form>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-soft">
              <h2 className="text-xl font-bold text-slate-900">Add Candidate</h2>
              <form onSubmit={handleCreateCandidate} className="mt-4 grid gap-4 md:grid-cols-2">
                <ElectionSelect register={candidateForm.register} name="electionId" elections={elections} required placeholder="1. Select election" />
                <PositionSelect register={candidateForm.register} name="positionId" positions={positionsForCandidate} required placeholder={watchCandidateElection ? "2. Select position" : "Select election first"} />
                <input
                  {...candidateForm.register("matric_no", { required: true })}
                  placeholder="Matriculation Number (e.g. TU/24/0001)"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <input
                  {...candidateForm.register("full_name", { required: true })}
                  placeholder="Candidate Full Name"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <input
                  {...candidateForm.register("department", { required: true })}
                  placeholder="Department (e.g. Computer Science)"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <input
                  {...candidateForm.register("photo_url")}
                  placeholder="Photo URL (optional)"
                  className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2"
                />
                <textarea
                  {...candidateForm.register("manifesto")}
                  placeholder="Manifesto (optional)"
                  className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2"
                  rows="3"
                />
                <button className="md:col-span-2 rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white">
                  Add Candidate
                </button>
              </form>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Elections</h2>
                {loading && <span className="text-sm text-slate-500">Refreshing...</span>}
              </div>
              <div className="mt-4 space-y-4">
                {elections.map((election) => (
                  <div key={election.election_id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">{election.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{election.status}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(election.election_id, "active")}
                        className="rounded-full border border-brand-200 px-3 py-2 text-xs font-semibold text-brand-700"
                      >
                        Activate
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(election.election_id, "closed")}
                        className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadResults(election.election_id)}
                        className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        View Results
                      </button>
                      {isSystemAdmin && (
                        <button
                          type="button"
                          onClick={() => handlePublishResults(election.election_id)}
                          className="rounded-full bg-brand-700 px-3 py-2 text-xs font-semibold text-white"
                        >
                          Publish
                        </button>
                      )}
                      {isSystemAdmin && (
                        <button
                          type="button"
                          onClick={() => handleExportResults(election.election_id)}
                          className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                        >
                          Export CSV
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {!elections.length && <p className="text-sm text-slate-500">No elections have been created yet.</p>}
              </div>
            </section>

            {isSystemAdmin && (
              <section className="rounded-3xl bg-white p-6 shadow-soft">
                <h2 className="text-xl font-bold text-slate-900">Recent Audit Log</h2>
                <div className="mt-4 space-y-3">
                  {logs.map((log) => (
                    <div key={log.audit_id} className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">{log.action_type}</p>
                      <p className="mt-1 text-sm text-slate-600">{log.details}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">{log.timestamp}</p>
                    </div>
                  ))}
                  {!logs.length && <p className="text-sm text-slate-500">No audit entries found.</p>}
                </div>
              </section>
            )}
          </aside>
        </div>

        {results && (
          <section className="rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-bold text-slate-900">Election Results</h2>
            <p className="mt-2 text-sm text-slate-600">{results.election.title}</p>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {results.results.map((position) => (
                <div key={position.position_id} className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-lg font-bold text-slate-900">{position.position_name}</h3>
                  <div className="mt-4 space-y-3">
                    {position.candidates.map((candidate) => (
                      <div
                        key={candidate.candidate_id}
                        className={`rounded-2xl p-4 ${
                          candidate.is_winner ? "bg-brand-50 ring-1 ring-brand-200" : "bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-semibold text-slate-900">{candidate.candidate_name}</p>
                          <span className="text-sm font-bold text-brand-900">{candidate.vote_count} votes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </LayoutShell>
  );
};

export default AdminDashboardPage;
