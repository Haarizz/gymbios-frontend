// src/components/PayrollReview.jsx
import React, { useEffect, useState } from "react";
import { getPayrollList, approvePayroll } from "../api/payroll";
import toast from "react-hot-toast";
import { Eye, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PayrollReview() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = () => {
    setLoading(true);

    getPayrollList({ status: "PENDING" })
      .then((res) => {
        // Backend returns res.data (array)
        setList(res.data);
      })
      .catch(() => toast.error("Failed to load payroll cycles"))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const handleApprove = async (id) => {
    try {
      await approvePayroll(id);
      toast.success("Payroll approved");
      loadData();
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  if (loading)
    return (
      <div className="text-center py-10 text-gray-600">
        Loading pending payrolls…
      </div>
    );

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Pending Payroll Cycles
        </h2>
      </div>

      {/* EMPTY STATE */}
      {list.length === 0 && (
        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 mt-8">
          <p className="text-xl font-semibold text-gray-700 mb-2">
            No Pending Payrolls
          </p>
          <p className="text-gray-500">
            Generate a new payroll cycle to review and approve.
          </p>
        </div>
      )}

      {/* LIST */}
      {list.length > 0 && (
        <div className="space-y-4">
          {list.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition"
            >
              {/* LEFT */}
              <div>
                <div className="font-semibold text-gray-800 text-lg">
                  {p.month} {p.year}
                </div>

                <div className="text-sm text-gray-500">
                  {p.employeesCount} employees •{" "}
                  <span className="font-medium text-teal-600">
                    AED {p.totalAmount}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/payroll/review/${p.id}`)}
                  className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                >
                  <Eye size={18} className="mr-2" /> View
                </button>

                <button
                  onClick={() => handleApprove(p.id)}
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  <CheckCircle2 size={18} className="mr-2" /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
