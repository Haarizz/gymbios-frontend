// src/components/CreateBillPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBill } from "../../api/billingApi";
import { getMembers } from "../../api/member";

export default function CreateBillPage() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [form, setForm] = useState({
    invoiceNumber: "",
    memberId: "",
    memberName: "",
    memberEmail: "",
    service: "",
    type: "Membership",
    amount: "",
    paidAmount: 0,
    billDate: "",
    dueDate: "",
    status: "PENDING",
    paymentMethod: null,
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate invoice #
  const generateInvoiceNumber = () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(100 + Math.random() * 900);
    return `INV-${dateStr}-${rand}`;
  };

  // Load members for dropdown
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMembers();
        setMembers(data);
      } catch (err) {
        console.error("Failed to load members", err);
      } finally {
        setLoadingMembers(false);
      }
    };
    load();

    setForm((s) => ({ ...s, invoiceNumber: generateInvoiceNumber() }));
  }, []);

  // Handle input field updates
  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  // When a member is selected → auto-fill name + email
  const handleMemberSelect = (id) => {
    const m = members.find((x) => x.id === Number(id));

    setForm((s) => ({
      ...s,
      memberId: id,
      memberName: m ? `${m.firstname} ${m.lastname}` : "",
      memberEmail: m?.email ?? "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.memberId || !form.amount || !form.dueDate) {
      setError("Member, amount, and due date are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        paidAmount: 0,
      };

      await createBill(payload);
      navigate("/billing");
    } catch (err) {
      console.error(err);
      setError("Failed to create bill.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <main className="flex-1 max-w-3xl mx-auto bg-white rounded shadow p-6 overflow-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Create Bill</h1>
        </div>

        {error && (
          <div className="p-2 bg-red-100 text-red-700 rounded text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Member Details */}
          <section className="border rounded p-4 space-y-4">
            <h2 className="font-semibold">Member Information</h2>

            {/* Member Dropdown */}
            <div>
              <label className="block text-sm mb-1">Select Member *</label>

              {loadingMembers ? (
                <p className="text-sm text-gray-500">Loading members...</p>
              ) : (
                <select
                  name="memberId"
                  value={form.memberId}
                  onChange={(e) => handleMemberSelect(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">-- Select Member --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstname} {m.lastname} ({m.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <input
              name="memberName"
              value={form.memberName}
              readOnly
              placeholder="Member Name"
              className="border p-2 rounded w-full bg-gray-50"
            />

            <input
              name="memberEmail"
              value={form.memberEmail}
              readOnly
              placeholder="Member Email"
              className="border p-2 rounded w-full bg-gray-50"
            />
          </section>

          {/* Section 2: Bill Details */}
          <section className="border rounded p-4 space-y-4">
            <h2 className="font-semibold">Bill Details</h2>

            <input
              name="invoiceNumber"
              value={form.invoiceNumber}
              readOnly
              placeholder="Invoice Number"
              className="border p-2 rounded w-full bg-gray-100"
            />

            <input
              name="service"
              value={form.service}
              onChange={handleChange}
              placeholder="Service (e.g. Monthly Membership)"
              className="border p-2 rounded w-full"
            />

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option>Membership</option>
              <option>Personal Training</option>
              <option>Group Class</option>
              <option>Rental</option>
              <option>Store Purchase</option>
              <option>Consultation</option>
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Amount (AED)"
                className="border p-2 rounded w-full"
                required
              />

              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
            </div>
          </section>

          {/* Section 3: Status */}
          <section className="border rounded p-4 space-y-2">
            <h2 className="font-semibold">Status</h2>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="border p-2 rounded w-full text-sm"
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
            </select>
          </section>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate("/billing")}
              className="px-4 py-2 border rounded bg-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-green-600 text-white"
            >
              {isSubmitting ? "Saving..." : "Create Bill"}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
