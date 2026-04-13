const StatusCard = ({ label, value, tone = "green" }) => {
  const tones = {
    green: "border-brand-100 bg-brand-50 text-brand-900",
    slate: "border-slate-200 bg-white text-slate-900",
  };

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
};

export default StatusCard;

