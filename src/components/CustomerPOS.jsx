import React, { useState } from 'react';
import { 
  HiOutlineSearch, HiOutlinePrinter, HiOutlineDocumentText, 
  HiOutlineCash, HiOutlineCreditCard, HiOutlineArrowLeft 
} from "react-icons/hi";
import { MdInfoOutline } from "react-icons/md";

// --- MOCK DATA ---
const CUSTOMERS = [
  { id: 1, name: "Sarah Johnson", memId: "MEM-001", phone: "+971 50 123 4567", balance: 245.50 },
  { id: 2, name: "Alex Martinez", memId: "MEM-002", phone: "+971 55 987 6543", balance: 180.00 },
  { id: 3, name: "Emma Wilson", memId: "MEM-003", phone: "+971 52 456 7890", balance: 320.75 },
];

export default function CustomerPOS({ onBack }) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'receipt' | 'advance' | 'statement'

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-6 md:p-10 font-sans text-gray-800 animate-in fade-in duration-300">
      
      {/* Alert Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-8 flex items-start gap-3">
        <MdInfoOutline className="text-blue-500 w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-blue-700 font-semibold text-sm">Demo Mode Active</h3>
          <p className="text-blue-600 text-xs md:text-sm mt-1">
            - You're viewing sample data. All features are fully functional with demonstration content.
          </p>
        </div>
      </div>

      {/* Header & Back Button */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-normal text-slate-800">Customer Management</h1>
          <p className="text-gray-500 mt-1 text-sm">View statements, receive payments, and manage advances</p>
        </div>
        <button 
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-white transition-colors flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        <TabButton 
          active={activeTab === 'list'} 
          onClick={() => setActiveTab('list')} 
          icon={<HiOutlineUserGroupIcon />} 
          label="Customer List" 
        />
        <TabButton 
          active={activeTab === 'receipt'} 
          onClick={() => setActiveTab('receipt')} 
          icon={<HiOutlineCash />} 
          label="Customer Receipt" 
        />
        <TabButton 
          active={activeTab === 'advance'} 
          onClick={() => setActiveTab('advance')} 
          icon={<HiOutlineCreditCard />} 
          label="Receive Advance" 
        />
        <TabButton 
          active={activeTab === 'statement'} 
          onClick={() => setActiveTab('statement')} 
          icon={<HiOutlineDocumentText />} 
          label="Customer Statement" 
        />
      </div>

      {/* Content Area */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm min-h-[400px]">
        {activeTab === 'list' && <CustomerListView />}
        {activeTab === 'receipt' && <CustomerReceiptView />}
        {activeTab === 'advance' && <ReceiveAdvanceView />}
        {activeTab === 'statement' && <CustomerStatementView />}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all
        ${active 
          ? 'bg-[#1e5f5f] text-white shadow-md' 
          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}
      `}
    >
      {icon}
      {label}
    </button>
  );
}

// 1. Customer List View
function CustomerListView() {
  const [search, setSearch] = useState("");
  const filtered = CUSTOMERS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-700">All Customers</h3>
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium">Customer Name</th>
              <th className="px-6 py-3 font-medium">Membership ID</th>
              <th className="px-6 py-3 font-medium">Phone</th>
              <th className="px-6 py-3 font-medium text-right">Balance</th>
              <th className="px-6 py-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr key={customer.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{customer.name}</td>
                <td className="px-6 py-4 text-gray-600">{customer.memId}</td>
                <td className="px-6 py-4 text-gray-600">{customer.phone}</td>
                <td className="px-6 py-4 text-right font-medium text-teal-600">AED {customer.balance.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-white">View</button>
                    <button className="px-3 py-1 bg-[#1e5f5f] text-white rounded text-xs hover:bg-teal-700">Statement</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 2. Customer Receipt View
function CustomerReceiptView() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700">Record Customer Payment</h3>
        <p className="text-gray-500 text-sm">Receive payment from customer account</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Customer</label>
          <select className="w-full border border-gray-300 rounded p-2.5 text-sm focus:outline-none focus:border-teal-500 bg-white">
            <option>Choose customer...</option>
            {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name} ({c.memId})</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Amount (AED)</label>
            <input type="number" className="w-full border border-gray-300 rounded p-2.5 text-sm" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Method</label>
            <select className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white">
              <option>Select method...</option>
              <option>Cash</option>
              <option>Card</option>
              <option>Online Transfer</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Notes (Optional)</label>
          <textarea className="w-full border border-gray-300 rounded p-2.5 text-sm h-20" placeholder="Payment notes..."></textarea>
        </div>

        <button className="w-full py-3 bg-[#1e5f5f] text-white rounded font-medium hover:bg-teal-700 flex items-center justify-center gap-2 mt-4">
          <HiOutlineCash className="w-5 h-5" /> Record Payment
        </button>
      </div>
    </div>
  );
}

// 3. Receive Advance View
function ReceiveAdvanceView() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700">Receive Advance Payment</h3>
        <p className="text-gray-500 text-sm">Accept advance deposit for future purchases</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Customer</label>
          <select className="w-full border border-gray-300 rounded p-2.5 text-sm focus:outline-none focus:border-teal-500 bg-white">
            <option>Choose customer...</option>
            {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name} ({c.memId})</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Advance Amount (AED)</label>
            <input type="number" className="w-full border border-gray-300 rounded p-2.5 text-sm" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Method</label>
            <select className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white">
              <option>Select method...</option>
              <option>Cash</option>
              <option>Card</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Purpose</label>
          <textarea className="w-full border border-gray-300 rounded p-2.5 text-sm h-20" placeholder="Purpose of advance payment..."></textarea>
        </div>

        <button className="w-full py-3 bg-[#1e5f5f] text-white rounded font-medium hover:bg-teal-700 flex items-center justify-center gap-2 mt-4">
          <HiOutlineCreditCard className="w-5 h-5" /> Receive Advance
        </button>
      </div>
    </div>
  );
}

// 4. Customer Statement View
function CustomerStatementView() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700">Generate Customer Statement</h3>
        <p className="text-gray-500 text-sm">View transaction summary and balance</p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Customer</label>
          <select className="w-full border border-gray-300 rounded p-2.5 text-sm focus:outline-none focus:border-teal-500 bg-white">
            <option>Choose customer...</option>
            {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name} ({c.memId})</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">From Date</label>
            <input type="date" className="w-full border border-gray-300 rounded p-2.5 text-sm text-gray-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">To Date</label>
            <input type="date" className="w-full border border-gray-300 rounded p-2.5 text-sm text-gray-500" />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 py-2.5 bg-[#1e5f5f] text-white rounded font-medium hover:bg-teal-700 flex items-center justify-center gap-2">
          <HiOutlineDocumentText className="w-5 h-5" /> View Statement
        </button>
        <button className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
          <HiOutlinePrinter className="w-5 h-5" /> Print
        </button>
      </div>
    </div>
  );
}

// Icon Helper
function HiOutlineUserGroupIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}