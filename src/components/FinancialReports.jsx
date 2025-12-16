import React, { useState, useEffect, useMemo } from "react";
import {
  FileText, Download, RefreshCw, Calendar, TrendingUp, Landmark,
  Wallet, Calculator, BookOpen, ArrowRightLeft, CheckCircle2,
  Clock, ChevronDown, X, DollarSign, PieChart, BarChart
} from "lucide-react";

// --- API IMPORTS ---
import { getExpenses } from "../api/expenses"; 
import { getReceiptVouchers } from "../api/receiptVoucherApi";
import { fetchVouchers as getPaymentVouchers } from "../api/paymentVoucherApi";
import { getAccounts, getTransactions } from "../api/ledgerApi";
import { getBankReconciliation } from "../api/bankReconciliationApi";

export default function FinancialReports() {
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeModal, setActiveModal] = useState(null);
  
  // --- RAW DATA STATE ---
  const [data, setData] = useState({
    accounts: [],
    transactions: [],
    receipts: [],
    payments: [],
    expenses: [],
    bankRecon: null
  });

  // --- 1. FETCH ALL REAL DATA ---
  const loadData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      // Default to current month range
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      const params = { from: firstDay, to: lastDay };

      // Parallel Fetching
      const [
        accRes, 
        txnRes, 
        rcptRes, 
        payRes, 
        expRes, 
        bankRes
      ] = await Promise.all([
        getAccounts(),
        getTransactions(params),
        getReceiptVouchers(params),
        getPaymentVouchers(params),
        getExpenses(params),
        getBankReconciliation(firstDay, lastDay)
      ]);

      setData({
        accounts: accRes.data || [],
        transactions: txnRes.data || [],
        receipts: rcptRes.data || [],
        payments: payRes.data || [],
        expenses: expRes.data || [],
        bankRecon: bankRes.data || {}
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load financial reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- 2. CALCULATION ENGINES (Memoized for performance) ---

  // A. TRIAL BALANCE ENGINE (Core Aggregator)
  const trialBalance = useMemo(() => {
    return data.accounts.map(acc => {
        // Find all transactions for this account
        const accTxns = data.transactions.filter(t => t.account_id === acc.id);
        
        // Sum Debits and Credits
        const totalDebit = accTxns.reduce((sum, t) => sum + (Number(t.debit) || 0), 0);
        const totalCredit = accTxns.reduce((sum, t) => sum + (Number(t.credit) || 0), 0);
        
        // Net Balance (Logic depends on account type, simplified here)
        // Assets/Expenses: Debit + Opening - Credit
        // Liabilities/Income: Credit + Opening - Debit
        const isDebitNature = ['Assets', 'Expenses', 'Bank', 'Cash'].some(g => acc.account_group?.includes(g));
        const netBalance = isDebitNature 
            ? (acc.opening_balance || 0) + totalDebit - totalCredit
            : (acc.opening_balance || 0) + totalCredit - totalDebit;

        return {
            ...acc,
            totalDebit,
            totalCredit,
            netBalance
        };
    });
  }, [data.accounts, data.transactions]);

  // B. P&L ENGINE
  const pnlData = useMemo(() => {
    // 1. Revenue: Get accounts marked as 'Revenue' or 'Income'
    // Fallback: If no ledger data, sum Receipt Vouchers
    const revenueAccounts = trialBalance.filter(a => 
        ['Revenue', 'Income', 'Sales'].some(k => a.account_group?.includes(k))
    );
    let totalRevenue = revenueAccounts.reduce((sum, a) => sum + a.netBalance, 0);
    
    // Fallback if ledger is empty: Use Receipt Vouchers directly
    if (totalRevenue === 0 && data.receipts.length > 0) {
        totalRevenue = data.receipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    }

    // 2. Expenses: Get accounts marked as 'Expense'
    const expenseAccounts = trialBalance.filter(a => 
        ['Expense', 'Cost', 'Purchase'].some(k => a.account_group?.includes(k))
    );
    let totalExpense = expenseAccounts.reduce((sum, a) => sum + a.netBalance, 0);

    // Fallback if ledger is empty: Use Expense Module + Payment Vouchers
    if (totalExpense === 0) {
        const expModuleTotal = data.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const payVoucherTotal = data.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        totalExpense = expModuleTotal + payVoucherTotal;
    }

    return {
        revenueAccounts,
        expenseAccounts,
        totalRevenue,
        totalExpense,
        netProfit: totalRevenue - totalExpense
    };
  }, [trialBalance, data]);

  // C. BALANCE SHEET ENGINE
  const bsData = useMemo(() => {
    const assets = trialBalance.filter(a => ['Assets', 'Fixed Assets', 'Current Assets', 'Bank', 'Cash'].some(k => a.account_group?.includes(k)));
    const liabilities = trialBalance.filter(a => ['Liabilities', 'Loans', 'Duties'].some(k => a.account_group?.includes(k)));
    const equity = trialBalance.filter(a => ['Equity', 'Capital'].some(k => a.account_group?.includes(k)));

    const totalAssets = assets.reduce((sum, a) => sum + a.netBalance, 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + a.netBalance, 0);
    const totalEquity = equity.reduce((sum, a) => sum + a.netBalance, 0);

    return {
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilities,
        totalEquity,
        retainedEarnings: pnlData.netProfit // Link P&L to BS
    };
  }, [trialBalance, pnlData]);

  // D. CASH FLOW ENGINE
  const cashFlowData = useMemo(() => {
    const inflow = data.receipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const outflow = data.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) + 
                    data.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    return { inflow, outflow, net: inflow - outflow };
  }, [data]);


  // --- 3. UI CONFIGURATION ---
  const REPORT_CARDS = [
    { id: "pnl", title: "Statement of Profit or Loss (P&L)", desc: "Comprehensive income statement showing revenue, expenses, and profitability", icon: <TrendingUp className="w-6 h-6 text-teal-700" /> },
    { id: "bs", title: "Statement of Financial Position", desc: "Balance sheet showing assets, liabilities, and equity position", icon: <Landmark className="w-6 h-6 text-teal-700" /> },
    { id: "cf", title: "Statement of Cash Flows", desc: "Cash flow analysis from operating, investing, and financing activities", icon: <DollarSign className="w-6 h-6 text-teal-700" /> },
    { id: "tb", title: "Trial Balance", desc: "Complete listing of all account balances for verification", icon: <Calculator className="w-6 h-6 text-teal-700" /> },
    { id: "db", title: "Day Book (General Ledger)", desc: "Chronological record of all transactions by date", icon: <BookOpen className="w-6 h-6 text-teal-700" /> },
    { id: "bb", title: "Bank Book", desc: "Bank transactions with reconciliation status and balances", icon: <Landmark className="w-6 h-6 text-teal-700" /> },
    { id: "ff", title: "Fund Flow Statement", desc: "Sources and uses of funds analysis for working capital management", icon: <ArrowRightLeft className="w-6 h-6 text-teal-700" /> },
    { id: "pdc", title: "Post-Dated Cheques (PDC) Report", desc: "Incoming and outgoing PDCs with maturity and status tracking", icon: <FileText className="w-6 h-6 text-teal-700" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#0F5156]" />
            Financial Reports
          </h1>
          <p className="text-sm text-gray-500 mt-1">IFRS-compliant financial reports and statements</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh All
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" /> Export Package
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h2 className="text-sm font-bold text-gray-700 mb-4">Report Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FilterDropdown label="Branch/Entity" />
          <FilterDropdown label="Period" value="Current Month" />
          <FilterDropdown label="Report Category" value="All Categories" />
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Custom Date Range</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input type="text" readOnly value="Nov 15, 2025 - Dec 15, 2025" className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600 focus:ring-teal-500 focus:border-teal-500 outline-none" />
            </div>
          </div>
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {REPORT_CARDS.map((card) => (
          <div key={card.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center transition-colors group-hover:bg-teal-100">
                {card.icon}
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                Ready
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{card.desc}</p>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-5 border-t border-gray-100 pt-3">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-gray-400" />
                <span>IFRS Compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-auto">
              <button 
                onClick={() => setActiveModal(card.id)}
                className="flex-1 bg-[#0F5156] hover:bg-[#0a3f42] text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <div className="w-4 h-4 flex items-center justify-center rounded-full border border-white/30"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div> 
                View
              </button>
              <button className="w-10 flex items-center justify-center border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL OVERLAY --- */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {REPORT_CARDS.find(c => c.id === activeModal)?.title}
                </h2>
                <p className="text-xs text-gray-500">Real-time Data | Generated from GymBios Ledger</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6 bg-white">
              <ReportContent 
                type={activeModal} 
                pnlData={pnlData} 
                bsData={bsData} 
                trialBalance={trialBalance}
                cashFlow={cashFlowData} 
                raw={data} 
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
               <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition-colors">Close View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENT: DYNAMIC REPORT RENDERER ---

function ReportContent({ type, pnlData, bsData, trialBalance, cashFlow, raw }) {
  
  // 1. PROFIT & LOSS REPORT
  if (type === 'pnl') {
    return (
      <div className="text-sm font-sans max-w-4xl mx-auto">
        <div className="grid grid-cols-12 gap-4 pb-3 border-b-2 border-teal-100 mb-4 font-semibold text-[#0F5156]">
           <div className="col-span-8">Account / Category</div>
           <div className="col-span-4 text-right">Amount (AED)</div>
        </div>

        <SectionHeader title="Revenue / Income" />
        {pnlData.revenueAccounts.length > 0 ? (
          pnlData.revenueAccounts.map((item, i) => <ReportRow key={i} label={item.name} val={item.netBalance} />)
        ) : (
           // Fallback to receipts if ledger is empty
           raw.receipts.length > 0 ? raw.receipts.map((r,i) => <ReportRow key={i} label={r.income_source_name || "Receipt"} val={r.amount} />) : <EmptyRow />
        )}
        <TotalRow label="Total Revenue" val={pnlData.totalRevenue} />

        <SectionHeader title="Operating Expenses" className="mt-8" />
        {pnlData.expenseAccounts.length > 0 ? (
          pnlData.expenseAccounts.map((item, i) => <ReportRow key={i} label={item.name} val={item.netBalance} />)
        ) : (
           // Fallback to expenses + payment vouchers
           <>
             {raw.expenses.map((e,i) => <ReportRow key={`e-${i}`} label={e.category || "Expense"} val={e.amount} />)}
             {raw.payments.map((p,i) => <ReportRow key={`p-${i}`} label={p.description || "Payment"} val={p.amount} />)}
             {raw.expenses.length === 0 && raw.payments.length === 0 && <EmptyRow />}
           </>
        )}
        <TotalRow label="Total Expenses" val={pnlData.totalExpense} />

        <div className="mt-8 pt-4 border-t border-gray-200">
           <div className="grid grid-cols-12 gap-4 font-bold text-gray-900 text-lg">
              <div className="col-span-8">Net Profit / (Loss)</div>
              <div className={`col-span-4 text-right ${pnlData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {pnlData.netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // 2. BALANCE SHEET REPORT
  if (type === 'bs') {
    return (
      <div className="grid grid-cols-2 gap-8 text-sm font-sans h-full">
         {/* ASSETS */}
         <div className="flex flex-col h-full border-r border-dashed pr-8">
            <h3 className="font-bold text-[#0F5156] mb-4 pb-2 border-b border-teal-100">Assets</h3>
            {bsData.assets.length > 0 ? bsData.assets.map((a, i) => (
                <ReportRowCompact key={i} label={a.name} val={a.netBalance} />
            )) : <EmptyRow />}
            <div className="mt-auto pt-4 border-t border-gray-200">
                <TotalBox label="Total Assets" val={bsData.totalAssets} />
            </div>
         </div>

         {/* LIABILITIES & EQUITY */}
         <div className="flex flex-col h-full">
            <h3 className="font-bold text-[#0F5156] mb-4 pb-2 border-b border-teal-100">Liabilities & Equity</h3>
            
            <h4 className="text-gray-500 font-medium mb-2 text-xs uppercase bg-gray-50 p-1">Liabilities</h4>
            {bsData.liabilities.length > 0 ? bsData.liabilities.map((l, i) => (
                <ReportRowCompact key={i} label={l.name} val={l.netBalance} />
            )) : <EmptyRow />}
            
            <h4 className="text-gray-500 font-medium mb-2 mt-4 text-xs uppercase bg-gray-50 p-1">Equity</h4>
            {bsData.equity.map((e,i) => <ReportRowCompact key={i} label={e.name} val={e.netBalance} />)}
            <ReportRowCompact label="Retained Earnings (Curr. Period)" val={bsData.retainedEarnings} />

            <div className="mt-auto pt-4 border-t border-gray-200">
                <TotalBox label="Total Liabilities & Equity" val={bsData.totalLiabilities + bsData.totalEquity + bsData.retainedEarnings} />
            </div>
         </div>
      </div>
    );
  }

  // 3. TRIAL BALANCE
  if (type === 'tb') {
      return (
        <div className="overflow-x-auto">
           <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                 <tr>
                    <th className="px-4 py-3">Account Name</th>
                    <th className="px-4 py-3">Group</th>
                    <th className="px-4 py-3 text-right">Debit</th>
                    <th className="px-4 py-3 text-right">Credit</th>
                    <th className="px-4 py-3 text-right">Net Balance</th>
                 </tr>
              </thead>
              <tbody>
                 {trialBalance.length > 0 ? trialBalance.map((acc, i) => (
                    <tr key={i} className="bg-white border-b hover:bg-gray-50">
                       <td className="px-4 py-2 font-medium text-gray-900">{acc.name}</td>
                       <td className="px-4 py-2">{acc.account_group}</td>
                       <td className="px-4 py-2 text-right">{Number(acc.totalDebit).toLocaleString()}</td>
                       <td className="px-4 py-2 text-right">{Number(acc.totalCredit).toLocaleString()}</td>
                       <td className="px-4 py-2 text-right font-bold">{Number(acc.netBalance).toLocaleString()}</td>
                    </tr>
                 )) : <tr><td colSpan="5" className="p-4 text-center">No accounts found.</td></tr>}
              </tbody>
           </table>
        </div>
      );
  }

  // 4. DAY BOOK (General Ledger)
  if (type === 'db') {
    // Combine all sources into one chronological timeline
    const timeline = [
        ...raw.receipts.map(r => ({ date: r.voucher_date, type: 'Receipt', desc: r.income_source_name || 'Income', amt: r.amount, mode: 'Credit' })),
        ...raw.payments.map(p => ({ date: p.payment_date, type: 'Payment', desc: p.party || 'Vendor Payment', amt: p.amount, mode: 'Debit' })),
        ...raw.expenses.map(e => ({ date: e.date, type: 'Expense', desc: e.category, amt: e.amount, mode: 'Debit' })),
        ...raw.transactions.map(t => ({ date: t.txn_date, type: 'Journal', desc: t.particulars, amt: t.debit || t.credit, mode: t.debit ? 'Debit' : 'Credit' }))
    ].sort((a,b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="overflow-x-auto">
           <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                 <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Debit</th>
                    <th className="px-4 py-3 text-right">Credit</th>
                 </tr>
              </thead>
              <tbody>
                 {timeline.length > 0 ? timeline.map((row, i) => (
                    <tr key={i} className="bg-white border-b hover:bg-gray-50">
                       <td className="px-4 py-2">{row.date}</td>
                       <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs ${['Receipt','Credit'].includes(row.type)?'bg-green-100 text-green-800':'bg-blue-100 text-blue-800'}`}>{row.type}</span></td>
                       <td className="px-4 py-2">{row.desc}</td>
                       <td className="px-4 py-2 text-right">{row.mode === 'Debit' ? Number(row.amt).toLocaleString() : '-'}</td>
                       <td className="px-4 py-2 text-right">{row.mode === 'Credit' ? Number(row.amt).toLocaleString() : '-'}</td>
                    </tr>
                 )) : <tr><td colSpan="5" className="p-4 text-center">No transactions recorded.</td></tr>}
              </tbody>
           </table>
        </div>
    );
  }

  // 5. CASH FLOW STATEMENT
  if (type === 'cf') {
      return (
        <div className="space-y-6">
           <div className="grid grid-cols-3 gap-4">
              <KpiCard label="Total Inflow" val={cashFlow.inflow} color="green" />
              <KpiCard label="Total Outflow" val={cashFlow.outflow} color="red" />
              <KpiCard label="Net Cash Flow" val={cashFlow.net} color="blue" />
           </div>
           
           <div className="grid grid-cols-2 gap-6">
               <div className="border rounded-lg p-4 bg-gray-50">
                   <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">Recent Receipts (Inflow)</h4>
                   {raw.receipts.slice(0,8).map((r,i) => (
                       <div key={`r-${i}`} className="flex justify-between py-2 border-b text-sm last:border-0">
                           <span className="text-gray-600">{r.voucher_date} | {r.income_source_name}</span>
                           <span className="text-green-600 font-medium">+{Number(r.amount).toLocaleString()}</span>
                       </div>
                   ))}
               </div>
               <div className="border rounded-lg p-4 bg-gray-50">
                   <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">Recent Payments (Outflow)</h4>
                   {raw.payments.slice(0,8).map((p,i) => (
                       <div key={`p-${i}`} className="flex justify-between py-2 border-b text-sm last:border-0">
                           <span className="text-gray-600">{p.payment_date} | {p.party}</span>
                           <span className="text-red-600 font-medium">-{Number(p.amount).toLocaleString()}</span>
                       </div>
                   ))}
               </div>
           </div>
        </div>
      );
  }

  // 6. PDC REPORT (Post-Dated Cheques)
  if (type === 'pdc') {
      // Filter receipts and payments for Cheques that are either marked 'Pending' or have a future date
      const today = new Date().toISOString().split('T')[0];
      const pdcReceipts = raw.receipts.filter(r => (r.payment_mode === 'Cheque' && (r.status === 'Pending' || r.voucher_date > today)));
      const pdcPayments = raw.payments.filter(p => (p.method === 'Cheque' && (p.status === 'Pending' || p.payment_date > today)));

      return (
          <div>
              <h3 className="font-bold text-teal-700 mb-4">Incoming PDCs (Receivables)</h3>
              {pdcReceipts.length > 0 ? (
                  <table className="w-full text-sm text-left text-gray-500 mb-8 border rounded">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                          <tr><th>Date</th><th>Ref</th><th>Member</th><th>Amount</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                          {pdcReceipts.map((r,i) => (
                              <tr key={i} className="bg-white border-b"><td className="px-3 py-2">{r.voucher_date}</td><td className="px-3 py-2">{r.reference}</td><td className="px-3 py-2">{r.member_name}</td><td className="px-3 py-2 text-green-600">{r.amount}</td><td className="px-3 py-2"><span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Pending</span></td></tr>
                          ))}
                      </tbody>
                  </table>
              ) : <p className="text-gray-400 text-sm mb-8 italic">No incoming PDCs found.</p>}

              <h3 className="font-bold text-red-700 mb-4">Outgoing PDCs (Payables)</h3>
              {pdcPayments.length > 0 ? (
                  <table className="w-full text-sm text-left text-gray-500 border rounded">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                          <tr><th>Date</th><th>Voucher No</th><th>Party</th><th>Amount</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                          {pdcPayments.map((p,i) => (
                              <tr key={i} className="bg-white border-b"><td className="px-3 py-2">{p.payment_date}</td><td className="px-3 py-2">{p.voucher_no}</td><td className="px-3 py-2">{p.party}</td><td className="px-3 py-2 text-red-600">{p.amount}</td><td className="px-3 py-2"><span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Pending</span></td></tr>
                          ))}
                      </tbody>
                  </table>
              ) : <p className="text-gray-400 text-sm italic">No outgoing PDCs found.</p>}
          </div>
      )
  }

  // 7. BANK BOOK
  if (type === 'bb') {
      // Filter transactions related to Bank accounts
      const bankAccounts = raw.accounts.filter(a => a.account_group === 'Bank').map(a => a.id);
      const bankTxns = raw.transactions.filter(t => bankAccounts.includes(t.account_id));

      return (
          <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded border border-blue-100">
                  <h4 className="font-bold text-blue-800">Bank Reconciliation Status</h4>
                  <p className="text-sm text-blue-600">
                      Closing Balance: <span className="font-bold">{raw.bankRecon?.closing_balance || 0}</span> | 
                      Difference: <span className={`font-bold ${raw.bankRecon?.difference !== 0 ? 'text-red-600' : 'text-green-600'}`}>{raw.bankRecon?.difference || 0}</span>
                  </p>
              </div>
              
              <h3 className="font-bold text-gray-700 mt-4">Bank Ledger Transactions</h3>
              {bankTxns.length > 0 ? (
                  <table className="w-full text-sm text-left text-gray-500 border rounded">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                          <tr><th>Date</th><th>Particulars</th><th>Debit</th><th>Credit</th></tr>
                      </thead>
                      <tbody>
                          {bankTxns.map((t,i) => (
                              <tr key={i} className="bg-white border-b">
                                  <td className="px-4 py-2">{t.txn_date}</td>
                                  <td className="px-4 py-2">{t.particulars}</td>
                                  <td className="px-4 py-2">{t.debit}</td>
                                  <td className="px-4 py-2">{t.credit}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              ) : <p className="text-gray-400 text-sm italic">No bank transactions found in ledger.</p>}
          </div>
      )
  }

  return <div className="p-10 text-center text-gray-500 italic">Select a report to view live data.</div>;
}

// --- HELPER UI COMPONENTS ---

function FilterDropdown({ label, value }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
      <div className="relative">
        <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600 focus:ring-teal-500 focus:border-teal-500 appearance-none cursor-pointer outline-none">
          <option>{value || `Select ${label}`}</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500"><ChevronDown className="w-4 h-4" /></div>
      </div>
    </div>
  );
}

const SectionHeader = ({ title, className }) => (
   <div className={`text-teal-600 font-bold mb-2 uppercase text-xs tracking-wider ${className}`}>{title}</div>
);

const ReportRow = ({ label, val }) => (
   <div className="grid grid-cols-12 gap-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors items-center">
      <div className="col-span-8 text-gray-700 pl-2 font-medium">{label}</div>
      <div className="col-span-4 text-right font-semibold text-gray-900">{Number(val).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
   </div>
);

const ReportRowCompact = ({ label, val }) => (
    <div className="flex justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2">
       <span className="text-gray-600">{label}</span>
       <span className="font-medium text-gray-800">{Number(val).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
    </div>
);

const TotalRow = ({ label, val }) => (
   <div className="grid grid-cols-12 gap-4 py-3 bg-gray-100 rounded mt-1 font-bold text-gray-800">
      <div className="col-span-8 pl-2">{label}</div>
      <div className="col-span-4 text-right">{Number(val).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
   </div>
);

const TotalBox = ({ label, val }) => (
    <div className="bg-[#0F5156] text-white p-3 rounded-lg flex justify-between font-bold shadow-md">
        <span>{label}</span>
        <span>{Number(val).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
    </div>
);

const EmptyRow = () => <div className="text-gray-400 text-xs italic pl-2 mb-2">No records found for this period</div>;

const KpiCard = ({ label, val, color }) => {
    const colors = {
        green: "bg-green-50 text-green-700",
        red: "bg-red-50 text-red-700",
        blue: "bg-blue-50 text-blue-700"
    };
    return (
        <div className={`${colors[color]} p-4 rounded-lg`}>
            <p className="text-xs uppercase opacity-80">{label}</p>
            <p className="text-2xl font-bold">{Number(val).toLocaleString()}</p>
        </div>
    );
};