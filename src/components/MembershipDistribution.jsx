export default function MembershipDistribution({ members = [], plans = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow border border-gray-100 text-sm">
        <p className="font-semibold mb-2">Membership Distribution</p>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const distribution = {};

  (members || []).forEach((m) => {
    const plan = m.membership_plan || m.membershipPlan || m.membership_type || "unknown";
    distribution[plan] = (distribution[plan] || 0) + 1;
  });

  // Convert plans array into display names if available
  const planOrder = Array.isArray(plans) && plans.length ? plans.map(p => ({
    id: p.id || p.planId || p.name,
    title: p.name || p.title || p.displayName || (p.planId || p.id)
  })) : null;

  const entries = planOrder
    ? planOrder.map(p => ({ plan: p.title, count: distribution[p.id] || 0 }))
               .concat(
                 // any plans not in planOrder
                 Object.keys(distribution).filter(k => !planOrder.find(p => p.plan === k)).map(k => ({ plan: k, count: distribution[k] }))
               )
    : Object.keys(distribution).map(k => ({ plan: k, count: distribution[k] }));

  return (
    <div className="bg-white p-4 rounded shadow border border-gray-100 text-sm">
      <p className="font-semibold mb-2">Membership Distribution</p>
      <p className="mb-4 text-gray-400">Breakdown by membership tier</p>

      {entries.length === 0 && <p className="text-gray-400">No members yet.</p>}

      <ul className="space-y-2 text-xs">
        {entries.map((e, i) => (
          <li key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-600 rounded-full inline-block"></span>
              <span className="font-medium">{e.plan}</span>
            </div>
            <div className="text-gray-500 text-xs">{e.count} members</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
