// src/pages/Ledgers/LedgerPage.jsx
import { useEffect, useState } from "react";
import {
  getAccounts,
  getCostCenters,
  getTransactions,
} from "../api/ledgerApi"; 
import LedgerTabs from "./LedgerTabs";
import AccountsTable from "./AccountsTable";
import TransactionsTable from "./TransactionsTable";
import CostCentersGrid from "./CostCentersGrid";
import AccountModal from "./AccountModal";
import CostCenterModal from "./CostCenterModal";

export default function LedgerPage() {
  const [activeTab, setActiveTab] = useState("chart"); // chart | ledger | cost | txn

  const [accounts, setAccounts] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingCostCenters, setLoadingCostCenters] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    accountGroup: "All Groups",
    branch: "All Branches",
    status: "All Status",
    ledgerAccountId: "",
    fromDate: "",
    toDate: "",
  });

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCostCenterModal, setShowCostCenterModal] = useState(false);
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);

  // Load data on initial mount
  useEffect(() => {
    loadAccounts();
    loadCostCenters();
    loadTransactions();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const res = await getAccounts({
        q: filters.search || undefined,
        group:
          filters.accountGroup !== "All Groups"
            ? filters.accountGroup
            : undefined,
      });
      setAccounts(res.data || []);
    } catch (err) {
      console.error("Failed to load accounts", err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const loadCostCenters = async () => {
    try {
      setLoadingCostCenters(true);
      const res = await getCostCenters();
      setCostCenters(res.data || []);
    } catch (err) {
      console.error("Failed to load cost centers", err);
    } finally {
      setLoadingCostCenters(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const res = await getTransactions({
        accountId: filters.ledgerAccountId || undefined,
        from: filters.fromDate || undefined,
        to: filters.toDate || undefined,
      });
      setTransactions(res.data || []);
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Splits for cards based on accountGroup
  const assetsTotal = accounts
    .filter((a) => a.accountGroup === "Assets")
    .reduce((s, a) => s + (a.openingBalance || 0), 0);
  const liabilitiesTotal = accounts
    .filter((a) => a.accountGroup === "Liabilities")
    .reduce((s, a) => s + (a.openingBalance || 0), 0);
  const incomeTotal = accounts
    .filter((a) => a.accountGroup === "Income")
    .reduce((s, a) => s + (a.openingBalance || 0), 0);
  const expensesTotal = accounts
    .filter((a) => a.accountGroup === "Expenses")
    .reduce((s, a) => s + (a.openingBalance || 0), 0);
  const equityTotal = accounts
    .filter((a) => a.accountGroup === "Equity")
    .reduce((s, a) => s + (a.openingBalance || 0), 0);

  const onGenerateLedgerReport = () => {
    loadTransactions();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 font-sans text-gray-800">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
            {/* Breadcrumb visual */}
           <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
             <span>Financials</span>
             <span>/</span>
             <span className="text-gray-800 font-medium">Ledgers</span>
           </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ledgers</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Buttons */}
          <button
            type="button"
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 font-medium shadow-sm transition-all"
          >
            <DownloadIcon className="w-4 h-4" />
            Export Excel
          </button>
          <button
            type="button"
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 font-medium shadow-sm transition-all"
          >
            <PrinterIcon className="w-4 h-4" />
            Print
          </button>

          {/* Quick Add Dropdown */}
          <div className="relative z-20">
            <button
              type="button"
              onClick={() => setShowQuickAddMenu((s) => !s)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0f5132] text-white rounded-lg text-sm font-medium hover:bg-[#0c4128] shadow-lg shadow-emerald-900/10 transition-all"
            >
              <PlusIcon className="w-4 h-4" />
              Add New
            </button>
            {showQuickAddMenu && (
              <>
                <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowQuickAddMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl text-sm z-30 overflow-hidden animate-in fade-in zoom-in duration-150">
                    <div className="p-1">
                        <button
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors text-left"
                        onClick={() => {
                            setShowQuickAddMenu(false);
                            setShowAccountModal(true);
                        }}
                        >
                        <FileTextIcon className="w-4 h-4" />
                        Add Account
                        </button>
                        <button
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors text-left"
                        onClick={() => {
                            setShowQuickAddMenu(false);
                            setShowCostCenterModal(true);
                        }}
                        >
                        <PieChartIcon className="w-4 h-4" />
                        Add Cost Center
                        </button>
                    </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* TABS COMPONENT */}
      <div className="mb-6">
        <LedgerTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* --- CHART OF ACCOUNTS VIEW --- */}
      {activeTab === "chart" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <SummaryCard
              label="Total Assets"
              value={assetsTotal}
              count={accounts.filter((a) => a.accountGroup === "Assets").length}
              tone="blue"
              icon={<WalletIcon className="w-5 h-5" />}
            />
            <SummaryCard
              label="Total Liabilities"
              value={liabilitiesTotal}
              count={
                accounts.filter((a) => a.accountGroup === "Liabilities").length
              }
              tone="red"
              icon={<TrendingDownIcon className="w-5 h-5" />}
            />
            <SummaryCard
              label="Total Income"
              value={incomeTotal}
              count={accounts.filter((a) => a.accountGroup === "Income").length}
              tone="green"
              icon={<TrendingUpIcon className="w-5 h-5" />}
            />
            <SummaryCard
              label="Total Expenses"
              value={expensesTotal}
              count={
                accounts.filter((a) => a.accountGroup === "Expenses").length
              }
              tone="amber"
              icon={<ReceiptIcon className="w-5 h-5" />}
            />
            <SummaryCard
              label="Total Equity"
              value={equityTotal}
              count={accounts.filter((a) => a.accountGroup === "Equity").length}
              tone="purple"
              icon={<PieChartIcon className="w-5 h-5" />}
            />
          </div>

          {/* Main Content Area */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
             
             {/* Filter Bar */}
            <div className="p-5 border-b border-gray-100 bg-white">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
                    <h3 className="text-base font-semibold text-gray-800 whitespace-nowrap">Chart of Accounts</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full md:w-auto">
                        <div className="relative">
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) =>
                                setFilters((f) => ({ ...f, search: e.target.value }))
                                }
                                onBlur={loadAccounts}
                                placeholder="Search accounts..."
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                            <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        </div>

                        <select
                            value={filters.accountGroup}
                            onChange={(e) =>
                            setFilters((f) => ({ ...f, accountGroup: e.target.value }))
                            }
                            onBlur={loadAccounts}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                        >
                            <option>All Groups</option>
                            <option>Assets</option>
                            <option>Liabilities</option>
                            <option>Income</option>
                            <option>Expenses</option>
                            <option>Equity</option>
                        </select>

                        <select
                            value={filters.branch}
                            onChange={(e) =>
                            setFilters((f) => ({ ...f, branch: e.target.value }))
                            }
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                        >
                            <option>All Branches</option>
                        </select>

                        <select
                            value={filters.status}
                            onChange={(e) =>
                            setFilters((f) => ({ ...f, status: e.target.value }))
                            }
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                        >
                            <option>All Status</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Component */}
            <div className="overflow-x-auto">
                 <AccountsTable accounts={accounts} loading={loadingAccounts} />
            </div>
          </div>
        </div>
      )}

      {/* --- GENERAL LEDGER VIEW --- */}
      {activeTab === "ledger" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4 border-l-4 border-emerald-600 pl-3">
              Generate Ledger Report
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Account</label>
                <select
                  value={filters.ledgerAccountId}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      ledgerAccountId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">All Accounts</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">From Date</label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, fromDate: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To Date</label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, toDate: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={onGenerateLedgerReport}
                  className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-md shadow-emerald-900/10 transition-all flex items-center justify-center gap-2"
                >
                  <FileTextIcon className="w-4 h-4" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
             <TransactionsTable
                title="General Ledger Entries"
                transactions={transactions}
                loading={loadingTransactions}
            />
          </div>
        </div>
      )}

      {/* --- COST CENTERS VIEW --- */}
      {activeTab === "cost" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
                 <h2 className="text-lg font-bold text-gray-800">Cost Centers</h2>
                 <p className="text-sm text-gray-500">Track expenses by specific departments or projects</p>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow hover:bg-emerald-700 transition-colors"
              onClick={() => setShowCostCenterModal(true)}
            >
              + New Cost Center
            </button>
          </div>
          <CostCentersGrid
            costCenters={costCenters}
            loading={loadingCostCenters}
          />
        </div>
      )}

      {/* --- TRANSACTIONS VIEW (Placeholder) --- */}
      {activeTab === "txn" && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Recent Transactions
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Latest financial transactions across all accounts
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow hover:bg-emerald-700 transition-colors"
            >
              + Add Transaction
            </button>
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
             <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <ReceiptIcon className="w-6 h-6 text-gray-400" />
             </div>
            <h3 className="text-gray-800 font-medium">Transaction Management</h3>
            <p className="text-gray-500 text-sm mt-1">Transaction management UI only – buttons are not wired to backend as requested.</p>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showAccountModal && (
        <AccountModal
          onClose={() => setShowAccountModal(false)}
          onCreated={loadAccounts}
        />
      )}

      {/* Since you wanted the UI without changing functionality, assuming these modals handle their own overlay/presentation internally or are standard portals */}
      {showCostCenterModal && (
        <CostCenterModal
          onClose={() => setShowCostCenterModal(false)}
          onCreated={loadCostCenters}
        />
      )}
    </div>
  );
}

/** * UPDATED SUMMARY CARD 
 * Matches the "Color Bar Top" style from the screenshot
 */
function SummaryCard({ label, value, count, tone, icon }) {
  // Map tones to specific color classes
  const styles = {
    blue: {
      bar: "bg-blue-500",
      text: "text-blue-600",
      bgIcon: "bg-blue-50",
      countText: "text-blue-600/80"
    },
    red: {
      bar: "bg-rose-500",
      text: "text-rose-600",
      bgIcon: "bg-rose-50",
      countText: "text-rose-600/80"
    },
    green: {
      bar: "bg-emerald-500",
      text: "text-emerald-600",
      bgIcon: "bg-emerald-50",
      countText: "text-emerald-600/80"
    },
    amber: {
      bar: "bg-amber-500",
      text: "text-amber-600",
      bgIcon: "bg-amber-50",
      countText: "text-amber-600/80"
    },
    purple: {
      bar: "bg-violet-500",
      text: "text-violet-600",
      bgIcon: "bg-violet-50",
      countText: "text-violet-600/80"
    },
  };

  const style = styles[tone] || styles.blue;

  return (
    <div className="relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      {/* Top Colored Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${style.bar}`}></div>
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
            <span className="text-[10px] text-gray-400 mt-0.5">Current Balance</span>
        </div>
        <div className={`p-2 rounded-lg ${style.bgIcon} ${style.text}`}>
            {icon}
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <div className="text-2xl font-bold text-gray-800">
           <span className="text-sm font-normal text-gray-400 mr-1">AED</span>
           {value.toLocaleString("en-US", { minimumFractionDigits: 0 })}
        </div>
        <div className={`text-xs font-medium ${style.countText} flex items-center gap-1 mt-1`}>
           <div className={`w-1.5 h-1.5 rounded-full ${style.bar}`}></div>
           {count} active accounts
        </div>
      </div>
    </div>
  );
}

// --- Icons (SVG) to avoid extra dependencies ---
const DownloadIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
)
const PrinterIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
)
const PlusIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
)
const SearchIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
)
const WalletIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
)
const TrendingUpIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
)
const TrendingDownIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
)
const PieChartIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
)
const ReceiptIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17V7"/></svg>
)
const FileTextIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
)