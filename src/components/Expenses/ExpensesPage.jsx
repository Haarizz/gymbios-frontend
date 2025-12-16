import { useEffect, useMemo, useState } from "react";
import {
  getExpenses,
  getExpenseStats,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../../api/expenses";
import toast from "react-hot-toast";
import { getCategories } from "../../api/category";
import { getCostCenters } from "../../api/ledgerApi";

// --- STYLING CONSTANTS ---
const FONT_BASE = "text-[14px]";
const FONT_SMALL = "text-[13px]";
const FONT_XS = "text-[12px]";
const FONT_LG = "text-[18px]";

const STATUS_BADGE_CLASSES = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  draft: "bg-slate-100 text-slate-700",
};

// --- HELPER FUNCTIONS ---
function formatCurrency(value) {
  if (value == null) return "0.00 AED";
  return `${Number(value).toFixed(2)} AED`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB");
}

const defaultForm = {
  id: null,
  date: "",
  vendorPayee: "",
  category: "",
  costCenter: "",
  location: "",
  amount: "",
  taxRate: "",
  status: "paid",
  notes: "",
};

// --- SVG ICONS (Replaces Material Icons dependency) ---
const Icons = {
  TrendingDown: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
  ),
  Download: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
  ),
  Dollar: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
  ),
  Receipt: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
  ),
  PieChart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
  ),
  Store: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18v-8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8z"></path><path d="M2 10l2-6h16l2 6"></path><path d="M12 16a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2z"></path></svg>
  )
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("this_month");
  const [locationFilter, setLocationFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form State
  const [formData, setFormData] = useState(defaultForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [costCenters, setCostCenters] = useState([]);

  useEffect(() => {
    loadData();
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      const [catRes, ccRes] = await Promise.all([
        getCategories(),
        getCostCenters(),
      ]);
      setCategories(catRes?.data || []);
      setCostCenters(ccRes?.data || []);
    } catch (err) {
      console.error("Failed to load dropdown data", err);
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        if (search) {
          const s = search.toLowerCase();
          return (
            exp.vendorPayee?.toLowerCase().includes(s) ||
            exp.category?.toLowerCase().includes(s) ||
            exp.location?.toLowerCase().includes(s) ||
            exp.notes?.toLowerCase().includes(s)
          );
        }
        return true;
      })
      .filter((exp) =>
        locationFilter === "all" ? true : exp.location === locationFilter
      )
      .filter((exp) =>
        categoryFilter === "all" ? true : exp.category === categoryFilter
      )
      .filter((exp) =>
        statusFilter === "all" ? true : exp.status === statusFilter
      );
  }, [expenses, search, locationFilter, categoryFilter, statusFilter]);

  const uniqueLocations = useMemo(
    () => [...new Set(expenses.map((e) => e.location).filter(Boolean))],
    [expenses]
  );

  const uniqueCategories = useMemo(
    () => [...new Set(expenses.map((e) => e.category).filter(Boolean))],
    [expenses]
  );

  async function loadData() {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        getExpenses(),
        getExpenseStats(),
      ]);
      setExpenses(listRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setFormData({
      ...defaultForm,
      date: new Date().toISOString().substring(0, 10),
    });
    setIsModalOpen(true);
  }

  function openEditModal(expense) {
    setFormData({
      id: expense.id,
      date: expense.date,
      vendorPayee: expense.vendorPayee || "",
      category: expense.category || "",
      costCenter: expense.costCenter || "",
      location: expense.location || "",
      amount: expense.amount ?? "",
      taxRate: expense.taxRate ?? "",
      status: expense.status || "paid",
      notes: expense.notes || "",
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setFormData(defaultForm);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const computedTotalAmount = useMemo(() => {
    const amount = parseFloat(formData.amount || 0);
    const taxRate = parseFloat(formData.taxRate || 0);
    const taxAmount = amount * (taxRate / 100);
    return (amount + taxAmount).toFixed(2);
  }, [formData.amount, formData.taxRate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...formData,
      amount: formData.amount ? Number(formData.amount) : 0,
      taxRate: formData.taxRate ? Number(formData.taxRate) : 0,
    };

    try {
      if (formData.id) {
        await updateExpense(formData.id, payload);
        toast.success("Expense updated");
      } else {
        await createExpense(payload);
        toast.success("Expense added");
      }
      closeModal();
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save expense");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      toast.success("Expense deleted");
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete expense");
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen w-full">
      {/* Header + actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-sm shrink-0">
            <Icons.TrendingDown />
          </div>
          <div>
            <h1 className={`font-bold text-slate-800 ${FONT_LG}`}>
              Expenses / Ledgers
            </h1>
            <p className={`${FONT_SMALL} text-slate-500`}>
              Track and categorize all business expenses.
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
            <Icons.Download />
            Export
          </button>
          <button
            onClick={openCreateModal}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-800 text-white text-sm font-medium hover:bg-emerald-900 transition-colors"
          >
            <Icons.Plus />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Expenses"
          value={formatCurrency(stats?.totalExpenses)}
          helper={`${stats?.transactionCount || 0} transactions`}
          icon={<Icons.Dollar />}
        />
        <SummaryCard
          label="Total Tax Paid"
          value={formatCurrency(stats?.totalTaxPaid)}
          helper="VAT & other taxes"
          icon={<Icons.Receipt />}
        />
        <SummaryCard
          label="Top Category"
          value={stats?.topCategory || "-"}
          helper={stats?.topCategoryAmount ? formatCurrency(stats.topCategoryAmount) : ""}
          icon={<Icons.PieChart />}
        />
        <SummaryCard
          label="Locations"
          value={stats?.locationCount || 0}
          helper="Active locations"
          icon={<Icons.Store />}
        />
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white px-4 py-3 shadow-sm flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between">
        <div className="flex items-center gap-2 flex-1 w-full bg-slate-50 rounded-lg px-3 py-2 border border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
          <span className="text-slate-400">
            <Icons.Search />
          </span>
          <input
            type="text"
            placeholder="Search expenses..."
            className={`w-full outline-none bg-transparent ${FONT_SMALL} placeholder:text-slate-400`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3 xl:justify-end">
          <select
            className={`flex-1 min-w-[120px] border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 outline-none focus:border-emerald-500 ${FONT_XS}`}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="all_time">All Time</option>
          </select>

          <select
            className={`flex-1 min-w-[120px] border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 outline-none focus:border-emerald-500 ${FONT_XS}`}
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="all">All Locations</option>
            {uniqueLocations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <select
            className={`flex-1 min-w-[120px] border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 outline-none focus:border-emerald-500 ${FONT_XS}`}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

           <select
            className={`flex-1 min-w-[120px] border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 outline-none focus:border-emerald-500 ${FONT_XS}`}
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
          >
             <option value="all">All Status</option>
             <option value="paid">Paid</option>
             <option value="pending">Pending</option>
             <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b">
          <h2 className={`font-semibold text-slate-800 ${FONT_BASE}`}>
            Expense Ledger
          </h2>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="min-w-full text-left whitespace-nowrap">
            <thead className="bg-white border-b">
              <tr className={`${FONT_XS} text-emerald-800 font-semibold tracking-wide`}>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium">Vendor / Payee</th>
                <th className="px-5 py-4 font-medium">Category</th>
                <th className="px-5 py-4 font-medium">Cost Center</th>
                <th className="px-5 py-4 font-medium">Location</th>
                <th className="px-5 py-4 font-medium text-right">Amount</th>
                <th className="px-5 py-4 font-medium text-right">Tax %</th>
                <th className="px-5 py-4 font-medium text-right">Total</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Notes</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`${FONT_SMALL} text-slate-600`}>
              {loading && (
                <tr>
                  <td colSpan={11} className="px-5 py-8 text-center text-slate-500">
                    Loading expenses...
                  </td>
                </tr>
              )}

              {!loading && filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-5 py-8 text-center text-slate-500">
                    No expenses found.
                  </td>
                </tr>
              )}

              {!loading &&
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-slate-500">
                      {formatDate(exp.date)}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">
                      {exp.vendorPayee}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${
                          exp.category === 'Equipment' ? 'bg-orange-100 text-orange-700' : 
                          exp.category === 'Utilities' ? 'bg-blue-100 text-blue-700' :
                          exp.category === 'Rent' ? 'bg-green-100 text-green-700' :
                          exp.category === 'Marketing' ? 'bg-pink-100 text-pink-700' :
                          'bg-slate-100 text-slate-600'
                      }`}>
                        {exp.category || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {exp.costCenter || "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {exp.location || "-"}
                    </td>
                    <td className="px-5 py-4 text-right text-slate-500">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="px-5 py-4 text-right text-slate-500">
                      {(exp.taxRate ?? 0) + "%"}
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-slate-700">
                      {formatCurrency(exp.totalAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] capitalize font-medium ${
                          STATUS_BADGE_CLASSES[exp.status] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {exp.status || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-[150px] truncate text-slate-500">
                      {exp.notes || "-"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center justify-end gap-3">
                        <button
                          className="text-slate-400 hover:text-emerald-600 transition-colors"
                          onClick={() => openEditModal(exp)}
                          title="Edit"
                        >
                          <Icons.Edit />
                        </button>
                        <button
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                          onClick={() => handleDelete(exp.id)}
                          title="Delete"
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl my-auto">
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
              <div>
                 <h3 className={`font-semibold text-slate-800 text-[18px]`}>
                    {formData.id ? "Edit Expense" : "Add New Expense"}
                 </h3>
                 <p className="text-slate-500 text-[13px] mt-1">Create a new expense entry.</p>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Icons.Close />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <Field label="Date">
                  <div className="relative">
                     <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleFormChange}
                        className="input-field pl-10"
                        required
                    />
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icons.Calendar />
                     </span>
                  </div>
                </Field>

                <Field label="Vendor / Payee">
                  <input
                    type="text"
                    name="vendorPayee"
                    value={formData.vendorPayee}
                    onChange={handleFormChange}
                    className="input-field"
                    placeholder="Enter vendor name"
                    required
                  />
                </Field>

                <Field label="Category">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.length > 0 ? (
                       categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                    ) : (
                        <>
                        <option value="Utilities">Utilities</option>
                        <option value="Rent">Rent</option>
                        <option value="Equipment">Equipment</option>
                        <option value="Operational">Operational</option>
                        <option value="Marketing">Marketing</option>
                        </>
                    )}
                  </select>
                </Field>

                <Field label="Cost Center">
                  <select
                    name="costCenter"
                    value={formData.costCenter}
                    onChange={handleFormChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select cost center</option>
                     {costCenters.length > 0 ? (
                       costCenters.map(cc => <option key={cc.id} value={cc.name}>{cc.name}</option>)
                    ) : (
                        <>
                        <option value="Gym Equipment">Gym Equipment</option>
                        <option value="Electric">Electric</option>
                        <option value="Facility">Facility</option>
                        </>
                    )}
                  </select>
                </Field>

                <Field label="Location">
                   <select
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    className="input-field"
                   >
                     <option value="">Select location</option>
                     <option value="Downtown">Downtown</option>
                     <option value="Mall Branch">Mall Branch</option>
                     <option value="All Locations">All Locations</option>
                   </select>
                </Field>

                <Field label="Amount (AED)">
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleFormChange}
                    className="input-field"
                    placeholder="0.00"
                  />
                </Field>

                <Field label="Tax Rate (%)">
                  <select
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleFormChange}
                    className="input-field"
                   >
                     <option value="">Select tax rate</option>
                     <option value="0">0%</option>
                     <option value="5">5% (VAT)</option>
                   </select>
                </Field>

                <Field label="Total Amount (AED)">
                   <div className="relative">
                    <input
                        type="text"
                        readOnly
                        value={computedTotalAmount}
                        className="input-field bg-white text-emerald-600 font-semibold border-emerald-200"
                    />
                  </div>
                </Field>
                
                 <div className="hidden">
                     <select name="status" value={formData.status} onChange={handleFormChange}>
                         <option value="paid">Paid</option>
                     </select>
                 </div>
              </div>

              <Field label="Notes / Description">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows={3}
                  className="input-field resize-none h-24"
                  placeholder="Add notes or description..."
                />
              </Field>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg bg-emerald-800 text-white text-sm font-medium hover:bg-emerald-900 transition-colors disabled:opacity-70 flex items-center gap-2 shadow-sm shadow-emerald-200"
                >
                  {submitting ? (
                      "Saving..." 
                  ) : (
                      <>
                        <Icons.Plus />
                        {formData.id ? "Update Expense" : "Add Expense"}
                      </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
          .input-field {
              width: 100%;
              border: 1px solid #e2e8f0;
              border-radius: 0.5rem;
              padding: 0.6rem 0.8rem;
              font-size: 0.875rem;
              color: #334155;
              outline: none;
              transition: all 0.2s;
              background-color: white;
          }
          .input-field:focus {
              border-color: #065f46;
              box-shadow: 0 0 0 3px rgba(6, 95, 70, 0.1);
          }
          .input-field::placeholder {
              color: #94a3b8;
          }
      `}</style>
    </div>
  );
}

function SummaryCard({ label, value, helper, icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between h-[110px] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
         <p className="text-[13px] font-medium text-slate-500">{label}</p>
         <div className="text-slate-400 bg-slate-50 p-1.5 rounded-lg group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
            {icon}
         </div>
      </div>
      <div>
        <p className={`font-bold text-slate-800 text-[22px] tracking-tight truncate`}>{value}</p>
        {helper && (
            <p className="text-[12px] text-slate-400 mt-1 font-medium truncate">{helper}</p>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}