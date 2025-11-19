import { HiPhone, HiMail, HiDotsHorizontal } from "react-icons/hi";

export default function RecentMembers({ members = [], loading = false }) {
  // sort by id descending (no createdAt available)
  const recent = Array.isArray(members)
    ? [...members].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5)
    : [];

  if (loading) {
    return (
      <div className="bg-white rounded shadow p-4 border border-gray-100">
        <p className="font-semibold text-sm mb-4">Recent Members</p>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow p-4 border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <p className="font-semibold text-sm">Recent Members</p>
        <a href="#" className="text-teal-600 text-xs hover:underline">
          View All
        </a>
      </div>

      <ul>
        {recent.length === 0 && (
          <li className="text-gray-400 text-sm">No members yet.</li>
        )}

        {recent.map((m, i) => {
          const firstname = m.firstname || m.firstName || m.name || "";
          const lastname = m.lastname || m.lastName || "";
          const name = (firstname + " " + lastname).trim() || m.memberId || "Member";
          const email = m.email || m.mail || "-";
          const phone = m.phone || "-";
          const membership = m.membership_plan || m.membershipType || m.membership_type || "N/A";

          const initials = (firstname ? firstname[0] : (m.memberId ? m.memberId[0] : "M")) +
                           (lastname ? lastname[0] : "");

          let bgMembershipColor = {
            Premium: "bg-blue-500",
            VIP: "bg-purple-600",
            Basic: "bg-green-500",
          }[membership] || "bg-gray-400";

          return (
            <li key={m.id || i} className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-300 rounded-full w-10 h-10 flex items-center justify-center font-semibold">{initials.toUpperCase()}</div>
                <div className="text-xs">
                  <p className="font-semibold">{name}</p>
                  <p className="text-gray-400">{email}</p>
                  <p className="text-gray-400">{phone}</p>
                </div>
              </div>

              <div className="text-xs text-gray-400">{/* no createdAt: omitted */}</div>

              <div>
                <span className={`text-white text-xs px-2 py-1 rounded ${bgMembershipColor}`}>{membership}</span>
              </div>

              <div className="flex space-x-2 text-gray-400 text-sm cursor-pointer">
                <HiPhone />
                <HiMail />
                <HiDotsHorizontal />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
