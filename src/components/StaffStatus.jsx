export default function StaffStatus({ staff = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded shadow p-4 border border-gray-100 flex space-x-4 text-xs">
        <p className="text-gray-400">Loading staff...</p>
      </div>
    );
  }

  const list = Array.isArray(staff) ? staff : [];

  if (list.length === 0) {
    return (
      <div className="bg-white rounded shadow p-4 border border-gray-100 flex space-x-4 text-xs">
        <p className="text-gray-400">No staff / trainers found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow p-4 border border-gray-100 flex flex-col space-y-3 text-xs mt-6">
      <p className="font-semibold text-sm mb-2">Staff / Trainers</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {list.map((s, i) => {
          const firstname = s.firstname || s.firstName || s.name || "";
          const lastname = s.lastname || s.lastName || "";
          const name = (firstname + " " + lastname).trim() || s.fullName || `Staff ${s.id || i}`;
          const role = s.role || s.position || s.title || "Trainer";
          const status = s.status || s.currentStatus || "N/A";
          const initials = (firstname ? firstname[0] : (s.name ? s.name[0] : "S")) +
                           (lastname ? lastname[0] : "");

          return (
            <div key={s.id || i} className="flex items-center space-x-3 bg-gray-50 rounded p-2">
              <div className="bg-gray-300 rounded-full w-10 h-10 flex items-center justify-center font-semibold">
                {initials.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-gray-400 text-xs">{role}</p>
                <p className={status.toLowerCase().includes("on") || status.toLowerCase().includes("checked") ? "text-emerald-600 text-xs" : "text-amber-500 text-xs"}>
                  {status}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
