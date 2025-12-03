// src/pages/Ledgers/components/LedgerTabs.jsx
export default function LedgerTabs({ activeTab, setActiveTab }) {
  const base =
    "px-4 py-2 text-sm rounded-full border transition-colors whitespace-nowrap";
  const active = "bg-white border-slate-300 text-slate-900 shadow-sm";
  const inactive = "bg-slate-100 border-transparent text-slate-500";

  const Tab = ({ id, label }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`${base} ${activeTab === id ? active : inactive}`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex gap-2 bg-slate-100 rounded-full p-1 w-fit">
      <Tab id="chart" label="Chart of Accounts" />
      <Tab id="ledger" label="General Ledger" />
      <Tab id="cost" label="Cost Centers" />
      <Tab id="txn" label="Transactions" />
    </div>
  );
}
