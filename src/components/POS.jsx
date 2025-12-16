// src/components/POS.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  HiOutlineLockOpen, HiOutlineDocumentText, HiOutlineLockClosed, HiOutlineUserGroup,
  HiOutlineCube, HiX, HiOutlineArrowLeft, HiSearch, HiOutlineShoppingCart,
  HiOutlineRefresh, HiOutlineCreditCard, HiOutlineCash, HiCheckCircle, HiOutlineSave,
  HiOutlinePlay, HiPrinter, HiDownload, HiPhone, HiMail, HiOutlineDeviceMobile, HiOutlineIdentification
} from "react-icons/hi";
import { MdInfoOutline } from "react-icons/md";
import { FaBoxOpen, FaDumbbell, FaTshirt, FaGlassWhiskey, FaHeadphones, FaCookieBite, FaRunning, FaStopwatch } from "react-icons/fa";

// API Imports
import { PosApi } from "../api/PosApi";
import { getMembers } from "../api/member"; 

// --- CONSTANTS & HELPERS ---
const CURRENCY = "AED";
const TAX_RATE = 0.05;

const formatCurrency = (amount = 0) => `${CURRENCY} ${Number(amount || 0).toFixed(2)}`;

const getCurrentDateTime = () => {
  const now = new Date();
  return {
    date: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    iso: now.toISOString()
  };
};

const DEFAULT_CATEGORIES = [
  { id: 'supplements', name: 'Supplements', count: 0, icon: <FaBoxOpen /> },
  { id: 'equipment', name: 'Equipment', count: 0, icon: <FaDumbbell /> },
  { id: 'apparel', name: 'Apparel', count: 0, icon: <FaTshirt /> },
  { id: 'beverages', name: 'Beverages', count: 0, icon: <FaGlassWhiskey /> },
  { id: 'accessories', name: 'Accessories', count: 0, icon: <FaHeadphones /> },
  { id: 'snacks', name: 'Snacks', count: 0, icon: <FaCookieBite /> },
  { id: 'cardio', name: 'Cardio Gear', count: 0, icon: <FaRunning /> },
  { id: 'timers', name: 'Timers/Tech', count: 0, icon: <FaStopwatch /> },
];

const INITIAL_STATS = {
  totalSales: 0,
  transactionCount: 0,
  returnsTotal: 0,
  returnsCount: 0,
  paymentMethods: { cash: 0, card: 0, digital: 0, credit: 0 },
  paymentCounts: { cash: 0, card: 0, digital: 0, credit: 0 },
  categorySales: {},
  cashIn: 0,
  cashOut: 0
};

// =========================
// MAIN COMPONENT
// =========================
export default function POS() {
  const [view, setView] = useState('dashboard');
  const [isSessionActive, setSessionActive] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  // Data State
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [heldOrders, setHeldOrders] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // Z-Report Stats
  const [sessionStats, setSessionStats] = useState(INITIAL_STATS);

  // Modal State
  const [isCloseModalOpen, setCloseModalOpen] = useState(false);
  const [isCashDropOpen, setCashDropOpen] = useState(false);

  // --- 1. Load Initial Data ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, members, held] = await Promise.all([
        PosApi.getProducts(),
        getMembers(), // Fetch real members from backend
        PosApi.getHeldOrders()
      ]);

      setProducts(prods || []);
      
      // Map members to POS Customer format
      const formattedCustomers = (members || []).map(m => ({
        id: m.id,
        name: m.fullName || m.name || `${m.firstname || m.firstName || ''} ${m.lastname || m.lastName || ''}`.trim() || `Member ${m.id}`,
        memId: m.memberid || m.memberId || (m.id ? `MEM-${m.id}` : ''),
        phone: m.phone || m.phoneNumber || "",
        email: m.email || "",
        balance: Number(m.balance || 0.00), 
        status: m.status || "Active"
      }));
      
      setCustomers(formattedCustomers);
      setHeldOrders(held || []);

      // Calculate category counts
      if (prods) {
        const counts = prods.reduce((acc, p) => {
          acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        }, {});
        setCategories(prev => prev.map(c => ({ ...c, count: counts[c.id] || 0 })));
      }
    } catch (error) {
      console.error("Failed to load POS data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Update Stats Helper ---
  const updateStats = (saleData) => {
    setSessionStats(prev => {
      const newStats = { ...prev };
      newStats.totalSales += saleData.total;
      newStats.transactionCount += 1;

      const method = (saleData.paymentMethod || 'cash').toLowerCase();
      if (newStats.paymentMethods[method] !== undefined) {
        newStats.paymentMethods[method] += saleData.total;
        newStats.paymentCounts[method] += 1;
      }

      saleData.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product && product.category) {
          if (!newStats.categorySales[product.category]) {
            newStats.categorySales[product.category] = { count: 0, amount: 0 };
          }
          newStats.categorySales[product.category].count += item.qty;
          newStats.categorySales[product.category].amount += (item.unitPrice * item.qty);
        }
      });
      return newStats;
    });
  };

  // --- 3. Session Handlers ---
  const handleStartSession = async (data) => {
    try {
      const session = await PosApi.startSession(data.openingCash);
      setSessionData(session);
      setSessionActive(true);
      setSessionStats({ ...INITIAL_STATS });
      setView('terminal');
      alert("Session Started Successfully");
    } catch (error) {
      console.error("Start session failed:", error);
      alert("Failed to start session. Check connection.");
    }
  };

  const handleCloseSession = async (data) => {
    if (!sessionData?.id) return;
    try {
      await PosApi.closeSession(sessionData.id, data.closingCash);
      setSessionActive(false);
      setCloseModalOpen(false);
      setView('z-report');
      alert("Session Closed Successfully");
    } catch (error) {
      console.error("Close session failed:", error);
      alert("Failed to close session.");
    }
  };

  const handleCashDrop = async (data) => {
    try {
      await PosApi.recordCashMovement({ ...data, sessionId: sessionData?.id });
      setCashDropOpen(false);
      
      // Update Z-Report Stats
      setSessionStats(prev => ({
        ...prev,
        cashIn: data.type === 'IN' ? prev.cashIn + data.amount : prev.cashIn,
        cashOut: data.type === 'OUT' ? prev.cashOut + data.amount : prev.cashOut
      }));
      
      alert("Cash movement recorded");
    } catch (error) {
      console.error("Cash movement failed:", error);
      alert("Failed to record cash movement.");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">Loading POS System...</div>;

  return (
    <div className="font-sans text-slate-800 bg-gray-50 min-h-screen">
      {view === 'dashboard' && (
        <DashboardView
          isSessionActive={isSessionActive}
          sessionData={sessionData}
          onStartSession={handleStartSession}
          onContinueSession={() => setView('terminal')}
          onCloseSession={() => setCloseModalOpen(true)}
          onViewReport={() => setView('z-report')}
          onViewCustomer={() => setView('customer')}
          onOpenCashDrop={() => setCashDropOpen(true)}
        />
      )}

      {view === 'terminal' && (
        <TerminalView
          sessionData={sessionData}
          products={products}
          categories={categories}
          customers={customers}
          heldOrders={heldOrders}
          setHeldOrders={setHeldOrders}
          onBack={() => setView('dashboard')}
          onCloseSession={() => setCloseModalOpen(true)}
          onViewReport={() => setView('z-report')}
          onSaleComplete={updateStats}
        />
      )}

      {view === 'customer' && <CustomerView onBack={() => setView('dashboard')} customers={customers} />}
      
      {view === 'z-report' && (
        <ZReportView 
          onBack={() => setView('dashboard')} 
          stats={sessionStats} 
          sessionData={sessionData}
          categoriesList={categories}
        />
      )}

      {isCloseModalOpen && (
        <CloseSessionModal
          onClose={() => setCloseModalOpen(false)}
          onConfirm={handleCloseSession}
          expectedCash={(sessionData?.openingCash || 0) + sessionStats.paymentMethods['cash'] + sessionStats.cashIn - sessionStats.cashOut}
        />
      )}

      {isCashDropOpen && (
        <CashDropModal
          onClose={() => setCashDropOpen(false)}
          onConfirm={handleCashDrop}
        />
      )}
    </div>
  );
}

// =========================
// DASHBOARD VIEW
// =========================
function DashboardView({ onStartSession, onContinueSession, onCloseSession, onViewReport, onViewCustomer, onOpenCashDrop, isSessionActive, sessionData }) {
  const [isStartModalOpen, setStartModalOpen] = useState(false);

  return (
    <div className="p-6 md:p-10 relative min-h-screen flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-normal text-slate-800">Point of Sale</h1>
        <p className="text-gray-500 mt-1 text-sm">Retail POS dashboard and session management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isSessionActive ? (
          <div onClick={onContinueSession} className="bg-white border-2 border-teal-500 rounded-lg p-6 hover:shadow-xl transition-all cursor-pointer group h-full relative">
            <div className="absolute top-6 right-6 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">Active</div>
            <div className="w-12 h-12 bg-teal-600 rounded-md flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform shadow-md">
              <HiOutlinePlay className="w-6 h-6 ml-1" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Continue Session</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Resume your active POS session</p>
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 space-y-1">
              <p><span className="font-semibold">ID:</span> {sessionData?.id}</p>
              <p><span className="font-semibold">Opening Cash:</span> {formatCurrency(sessionData?.openingCash || 0)}</p>
            </div>
          </div>
        ) : (
          <div onClick={() => setStartModalOpen(true)} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-xl transition-all cursor-pointer group h-full">
            <div className="w-12 h-12 bg-teal-600 rounded-md flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform shadow-md">
              <HiOutlineLockOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Start Session</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Open cash drawer and start new session</p>
          </div>
        )}

        <div onClick={onViewReport} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-xl transition-all h-full">
          <div className="w-12 h-12 bg-teal-600 rounded-md flex items-center justify-center text-white mb-4 shadow-md">
            <HiOutlineDocumentText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Z-Report</h3>
          <p className="text-gray-500 text-sm leading-relaxed">Generate end-of-day summary report</p>
        </div>

        <div onClick={isSessionActive ? onCloseSession : undefined} className={`bg-white border border-gray-200 rounded-lg p-6 h-full transition-all ${isSessionActive ? 'cursor-pointer hover:shadow-xl border-red-200 hover:border-red-300' : 'opacity-60 cursor-not-allowed'}`}>
          <div className={`w-12 h-12 rounded-md flex items-center justify-center text-white mb-4 shadow-md ${isSessionActive ? 'bg-red-500' : 'bg-red-300'}`}>
            <HiOutlineLockClosed className="w-6 h-6" />
          </div>
          <h3 className={`text-lg font-medium mb-2 ${isSessionActive ? 'text-red-600' : 'text-gray-400'}`}>X-Report / Close Session</h3>
          <p className="text-gray-400 text-sm leading-relaxed">Close current session and generate report</p>
          {isSessionActive ? (
            <p className="text-red-400 text-xs mt-4 pt-4 border-t border-red-50 font-medium">Action Required: End session</p>
          ) : (
            <p className="text-gray-400 text-xs mt-4 pt-4 border-t border-gray-100 italic">No active session to close</p>
          )}
        </div>

        <div onClick={onViewCustomer} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-xl transition-all cursor-pointer h-full">
          <div className="w-12 h-12 bg-teal-600 rounded-md flex items-center justify-center text-white mb-4 shadow-md">
            <HiOutlineUserGroup className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Customer</h3>
          <p className="text-gray-500 text-sm leading-relaxed">Manage customer transactions</p>
        </div>

        <div onClick={onOpenCashDrop} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-xl transition-all cursor-pointer h-full">
          <div className="w-12 h-12 bg-teal-600 rounded-md flex items-center justify-center text-white mb-4 shadow-md">
            <HiOutlineCube className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Cash Drop / Out</h3>
          <p className="text-gray-500 text-sm leading-relaxed">Record cash movements</p>
        </div>
      </div>

      {isStartModalOpen && (
        <StartSessionModal
          onClose={() => setStartModalOpen(false)}
          onConfirm={(data) => {
            onStartSession(data);
            setStartModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

// =========================
// TERMINAL VIEW
// =========================
function TerminalView({ onBack, onCloseSession, onViewReport, sessionData, products, categories, customers, heldOrders, setHeldOrders, onSaleComplete }) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || 'supplements');
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState("Walk-in Customer");
  const [dateTime, setDateTime] = useState(getCurrentDateTime());
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false); // Ref Lock for Double Click Prevention

  // Modals
  const [isCustomerOpen, setCustomerOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isRecallOpen, setIsRecallOpen] = useState(false);
  const [isCashDropOpen, setIsCashDropOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setDateTime(getCurrentDateTime()), 1000);
    return () => clearInterval(t);
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) return { ...i, qty: Math.max(0, i.qty + delta) };
      return i;
    }).filter(i => i.qty > 0));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * TAX_RATE;
  const totalPayable = subtotal + tax;

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.category === activeCategory &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [activeCategory, searchQuery, products]);

  const handleHoldOrder = async () => {
    if (cart.length === 0) {
      setIsRecallOpen(true);
      return;
    }
    const orderData = {
      sessionId: sessionData?.id,
      customerName: customer,
      items: cart,
      total: totalPayable
    };

    try {
      const saved = await PosApi.holdOrder(orderData);
      setHeldOrders(prev => [saved, ...prev]);
      setCart([]);
      setCustomer("Walk-in Customer");
      alert("Order Held Successfully");
    } catch (error) {
      console.error("Hold order failed:", error);
      alert("Failed to hold order");
    }
  };

  const handleRecallOrder = (order) => {
    if (cart.length > 0) {
      if (!window.confirm("Overwrite current cart?")) return;
    }
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
    setCart(items);
    setCustomer(order.customerName || "Walk-in Customer");
    setHeldOrders(prev => prev.filter(h => h.id !== order.id));
    PosApi.deleteHeldOrder(order.id).catch(console.error);
    setIsRecallOpen(false);
  };

  const handleDiscardHold = (id) => {
    PosApi.deleteHeldOrder(id).then(() => {
      setHeldOrders(prev => prev.filter(h => h.id !== id));
    }).catch(console.error);
  };

  const handlePaymentComplete = async (method, details) => {
    if (processingRef.current) return; // Immediate check
    processingRef.current = true;
    setIsProcessing(true);

    const saleData = {
      sessionId: sessionData?.id,
      customerName: customer === "Walk-in Customer" ? "Walk-in Customer" : customer,
      items: cart.map(i => ({ productId: i.id, qty: i.qty, unitPrice: i.price })),
      subtotal,
      tax,
      total: totalPayable,
      paymentMethod: method
    };

    try {
      await PosApi.createSale(saleData);
      // ONLY call updateStats once upon success
      if (onSaleComplete) onSaleComplete(saleData);
      
      setIsPaymentOpen(false);
      setIsSuccessOpen(true);
      setCart([]);
      setCustomer("Walk-in Customer");
    } catch (error) {
      console.error("Sale failed:", error);
      alert("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
      processingRef.current = false; // Reset lock
    }
  };

  const handleCashDrop = async (data) => {
    try {
      await PosApi.recordCashMovement({ ...data, sessionId: sessionData?.id });
      setIsCashDropOpen(false);
      alert("Cash movement recorded");
    } catch (error) {
      alert("Failed to record cash movement");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-slate-800 overflow-hidden">
      <header className="bg-white shadow-sm border-b px-4 py-2 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-teal-700 border border-teal-200 bg-white px-3 py-1.5 rounded hover:bg-teal-50 text-xs font-medium transition-colors">
            <HiOutlineArrowLeft /> Dashboard
          </button>
          <div className="hidden md:block text-xs text-gray-500 leading-tight">
            <div className="font-semibold text-gray-800">Session: {sessionData?.id || "N/A"}</div>
            <div>{dateTime.date} • {dateTime.time}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onViewReport} className="border border-teal-600 text-teal-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-teal-50 flex items-center gap-1 transition-colors">
            <HiOutlineDocumentText /> Z Report
          </button>
          <button onClick={onCloseSession} className="bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded text-xs font-medium hover:bg-red-50 flex items-center gap-1 transition-colors">
            <HiOutlineLockClosed /> Close Session
          </button>
        </div>
      </header>

      <div className="px-4 py-2 bg-white border-b flex gap-2 overflow-x-auto shadow-sm z-10 no-scrollbar flex-shrink-0">
        <button onClick={() => setIsRecallOpen(true)} className="whitespace-nowrap px-3 py-1.5 border rounded text-teal-700 border-teal-100 hover:bg-teal-50 text-xs font-bold flex items-center gap-1.5 transition-colors">
          <HiOutlineSave /> Hold ({heldOrders.length})
        </button>
        <button className="whitespace-nowrap px-3 py-1.5 border rounded text-teal-700 border-teal-100 hover:bg-teal-50 text-xs font-bold flex items-center gap-1.5 transition-colors">
          <HiSearch /> Price Check
        </button>
        <button onClick={() => setIsCashDropOpen(true)} className="whitespace-nowrap px-3 py-1.5 border rounded text-teal-700 border-teal-100 hover:bg-teal-50 text-xs font-bold flex items-center gap-1.5 transition-colors">
          <HiOutlineCube /> Cash Drop
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-20 md:w-44 bg-white border-r overflow-y-auto p-2 flex flex-col gap-2 flex-shrink-0">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`p-3 rounded-lg text-left transition-all flex flex-col gap-1 group relative ${activeCategory === cat.id ? 'bg-[#1e5f5f] text-white shadow-md' : 'bg-white border border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-200'}`}>
              <div className={`text-xl ${activeCategory === cat.id ? 'text-white' : 'text-teal-700'}`}>{cat.icon}</div>
              <div className="hidden md:block">
                <div className="font-semibold text-xs md:text-sm">{cat.name}</div>
                <div className={`text-[10px] ${activeCategory === cat.id ? 'text-teal-200' : 'text-gray-400'}`}>{cat.count}</div>
              </div>
            </button>
          ))}
        </aside>

        <main className="flex-1 bg-gray-50 p-4 overflow-y-auto">
          <div className="relative mb-6">
            <HiSearch className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search products by name or SKU..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            {filteredProducts.map(p => (
              <div key={p.id} onClick={() => addToCart(p)} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md hover:border-teal-400 cursor-pointer transition-all flex flex-col h-44 relative group">
                <div className="flex-1 flex items-center justify-center text-4xl text-teal-100 group-hover:scale-110 transition-transform">
                  <FaBoxOpen />
                </div>
                <div className="mt-3 relative z-10">
                  <h3 className="font-semibold text-gray-800 text-xs mb-1 truncate" title={p.name}>{p.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-teal-700 font-bold text-sm">{formatCurrency(p.price)}</span>
                    <span className="bg-[#1e5f5f] text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center">{p.stock}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        <aside className="w-80 md:w-96 bg-white border-l flex flex-col shadow-xl z-20 flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block tracking-wider">Customer</label>
            <div className="relative">
              <button onClick={() => setCustomerOpen(!isCustomerOpen)} className="w-full flex items-center justify-between border rounded p-2.5 hover:bg-gray-50 transition-colors bg-white text-sm font-medium text-gray-700">
                <span className="flex items-center gap-2"><HiOutlineUserGroup className="text-gray-400" /> {customer}</span>
                <span className="text-xs text-gray-400">▼</span>
              </button>

              {isCustomerOpen && (
                <div className="absolute top-full left-0 w-full bg-white border shadow-lg rounded mt-1 z-30 animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto">
                  {customers.map((c, idx) => (
                    <div key={idx} onClick={() => { setCustomer(c.name); setCustomerOpen(false); }} className="p-2.5 text-sm cursor-pointer border-b last:border-0 hover:bg-teal-50 text-gray-700">
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-300">
                <HiOutlineShoppingCart className="w-16 h-16 mb-4 opacity-40" />
                <p className="text-sm font-medium">No items added</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map(i => (
                  <div key={i.id} className="bg-white p-3 rounded border border-gray-100 shadow-sm flex justify-between items-center group hover:border-teal-300 transition-colors">
                    <div className="flex-1 pr-2">
                      <div className="text-sm font-semibold text-gray-800 line-clamp-1">{i.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{formatCurrency(i.price)} x {i.qty}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded bg-white overflow-hidden">
                        <button onClick={() => updateQty(i.id, -1)} className="px-2 py-1 hover:bg-gray-100 text-gray-600 transition-colors">-</button>
                        <span className="px-2 text-sm font-semibold w-8 text-center text-gray-800">{i.qty}</span>
                        <button onClick={() => updateQty(i.id, 1)} className="px-2 py-1 hover:bg-gray-100 text-gray-600 transition-colors">+</button>
                      </div>
                      <div className="text-sm font-bold text-teal-700 w-16 text-right">
                        {formatCurrency(i.price * i.qty)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4 pt-4 border-t border-dashed border-gray-200">
              <span className="text-sm font-bold text-gray-700">Total Pay</span>
              <span className="text-xl font-bold text-teal-700">{formatCurrency(totalPayable)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <button onClick={handleHoldOrder} className="py-2 border border-teal-200 text-teal-700 rounded text-xs font-bold hover:bg-teal-50 flex items-center justify-center gap-1 transition-colors"><HiOutlineSave className="w-4 h-4" /> Hold</button>
              <button onClick={clearCart} className="py-2 border border-red-200 text-red-600 rounded text-xs font-bold hover:bg-red-50 flex items-center justify-center gap-1 transition-colors"><HiX className="w-4 h-4" /> Clear</button>
            </div>

            <button onClick={() => { if (cart.length > 0) setIsPaymentOpen(true); else alert("Cart is empty"); }} className="w-full bg-[#1e5f5f] text-white py-3.5 rounded-lg font-bold hover:bg-teal-800 transition-all shadow-md active:scale-[0.99] uppercase text-sm tracking-wide">PAY NOW</button>
          </div>
        </aside>
      </div>

      {isPaymentOpen && (
        <PaymentModal
          onClose={() => setIsPaymentOpen(false)}
          onConfirm={(method, details) => handlePaymentComplete(method, details)}
          total={totalPayable}
          count={cart.length}
          customer={customer}
          isProcessing={isProcessing}
        />
      )}

      {isSuccessOpen && <SuccessModal onClose={() => setIsSuccessOpen(false)} />}

      {isCashDropOpen && <CashDropModal onClose={() => setIsCashDropOpen(false)} onConfirm={handleCashDrop} />}

      {isRecallOpen && <RecallModal onClose={() => setIsRecallOpen(false)} heldOrders={heldOrders} onRecall={handleRecallOrder} onDiscard={handleDiscardHold} />}
    </div>
  );
}

// =========================
// CUSTOMER VIEW
// =========================
function CustomerView({ onBack, customers = [] }) {
  const [activeTab, setActiveTab] = useState('list');
  const [viewCustomer, setViewCustomer] = useState(null);

  const TabButton = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${active ? 'bg-[#1e5f5f] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
      {icon} {label}
    </button>
  );

  const CustomerList = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-700">All Customers</h3>
        <div className="relative">
          <HiSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Search customers..." className="pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 w-64" />
        </div>
      </div>

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
          {customers.map((c) => (
            <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-800">{c.name}</td>
              <td className="px-6 py-4 text-gray-600">{c.memId}</td>
              <td className="px-6 py-4 text-gray-600">{c.phone}</td>
              <td className="px-6 py-4 text-right font-medium text-teal-600">{formatCurrency(c.balance)}</td>
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center gap-2">
                  <button 
                    onClick={() => { setViewCustomer(c); setActiveTab('list'); }} 
                    className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-white hover:border-gray-400 transition-colors"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => { setViewCustomer(c); setActiveTab('statement'); }} 
                    className="px-3 py-1 bg-[#1e5f5f] text-white rounded text-xs hover:bg-teal-700 transition-colors"
                  >
                    Statement
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const CustomerDetails = ({ customer, onBackToList }) => (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBackToList} className="text-sm text-gray-500 hover:text-gray-700 font-medium">← Back to list</button>
        <h3 className="text-xl font-bold text-gray-800">{customer.name}</h3>
        <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded font-medium">{customer.memId}</span>
        <span className={`text-xs px-2 py-1 rounded font-medium ${customer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{customer.status}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-bold mb-2">Contact Info</p>
          <div className="flex items-center gap-2 text-sm text-gray-700 mb-1"><HiPhone className="text-gray-400" /> {customer.phone}</div>
          <div className="flex items-center gap-2 text-sm text-gray-700"><HiMail className="text-gray-400" /> {customer.email}</div>
        </div>

        <div className="p-4 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-bold mb-2">Wallet Balance</p>
          <div className="text-2xl font-bold text-teal-600">{formatCurrency(customer.balance)}</div>
        </div>

        <div className="p-4 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-bold mb-2">Actions</p>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('receipt')} className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium hover:bg-gray-50">Add Payment</button>
            <button onClick={() => setActiveTab('statement')} className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium hover:bg-gray-50">Statement</button>
          </div>
        </div>
      </div>

      <h4 className="font-bold text-gray-700 mb-4">Recent Transactions</h4>
      <table className="w-full text-sm text-left border-t border-gray-200">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50"><tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">Type</th><th className="px-4 py-2 text-right">Amount</th></tr></thead>
        <tbody>
          <tr className="border-b"><td className="px-4 py-2 text-gray-600">2023-10-01</td><td className="px-4 py-2">Sale</td><td className="px-4 py-2 text-right text-gray-800">AED 120.00</td></tr>
          <tr className="border-b"><td className="px-4 py-2 text-gray-600">2023-09-28</td><td className="px-4 py-2 text-teal-600 font-medium">Payment Received</td><td className="px-4 py-2 text-right text-teal-600">AED 500.00</td></tr>
        </tbody>
      </table>
    </div>
  );

  const ReceiptForm = () => (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700">Record Customer Payment</h3>
        <p className="text-gray-500 text-sm">Receive payment from customer account</p>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Customer</label>
          <select className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white" defaultValue={viewCustomer?.id || ""}>
            <option value="">Choose customer...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Amount</label>
            <input type="number" className="w-full border rounded p-2.5 text-sm" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Method</label>
            <select className="w-full border rounded p-2.5 text-sm bg-white"><option>Cash</option><option>Card</option></select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Notes</label>
          <textarea className="w-full border rounded p-2.5 text-sm h-20" placeholder="Optional notes..." />
        </div>
        <button onClick={() => alert("Payment Recorded")} className="w-full py-3 bg-[#1e5f5f] text-white rounded font-medium hover:bg-teal-700 flex items-center justify-center gap-2 mt-4"><HiOutlineCash className="w-5 h-5" /> Record Payment</button>
      </div>
    </div>
  );

  const AdvanceForm = () => (
    <div className="p-8 max-w-4xl">
      <div className="mb-6"><h3 className="text-lg font-medium text-gray-700">Receive Advance Payment</h3><p className="text-gray-500 text-sm">Accept advance deposit for future purchases</p></div>
      <div className="grid grid-cols-1 gap-6">
        <div><label className="block text-xs font-bold text-gray-700 mb-1.5">Select Customer</label><select className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white" defaultValue={viewCustomer?.id || ""}><option value="">Choose customer...</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="grid grid-cols-2 gap-6">
          <div><label className="block text-xs font-bold text-gray-700 mb-1.5">Advance Amount</label><input type="number" className="w-full border rounded p-2.5 text-sm" placeholder="0.00" /></div>
          <div><label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Method</label><select className="w-full border rounded p-2.5 text-sm bg-white"><option>Cash</option><option>Card</option></select></div>
        </div>
        <div><label className="block text-xs font-bold text-gray-700 mb-1.5">Purpose</label><textarea className="w-full border rounded p-2.5 text-sm h-20" placeholder="Reason for advance..." /></div>
        <button onClick={() => alert("Advance Received")} className="w-full py-3 bg-[#1e5f5f] text-white rounded font-medium hover:bg-teal-700 flex items-center justify-center gap-2 mt-4"><HiOutlineCreditCard className="w-5 h-5" /> Receive Advance</button>
      </div>
    </div>
  );

  const StatementForm = () => (
    <div className="p-8 max-w-4xl">
      <div className="mb-6"><h3 className="text-lg font-medium text-gray-700">Generate Customer Statement</h3><p className="text-gray-500 text-sm">View transaction summary</p></div>
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div><label className="block text-xs font-bold text-gray-700 mb-1.5">Select Customer</label><select className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white" defaultValue={viewCustomer?.id || ""}><option value="">Choose customer...</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.memId})</option>)}</select></div>
        <div className="grid grid-cols-2 gap-6">
          <div><label className="block text-xs font-bold text-gray-700 mb-1.5">From Date</label><input type="date" className="w-full border rounded p-2.5 text-sm text-gray-500" /></div>
          <div><label className="block text-xs font-bold text-gray-700 mb-1.5">To Date</label><input type="date" className="w-full border rounded p-2.5 text-sm text-gray-500" /></div>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => alert("Statement Generated (PDF)")} className="flex-1 py-2.5 bg-[#1e5f5f] text-white rounded font-medium hover:bg-teal-700 flex items-center justify-center gap-2"><HiOutlineDocumentText className="w-5 h-5" /> View Statement</button>
        <button onClick={() => alert("Printing Statement...")} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded font-medium hover:bg-gray-50 flex items-center justify-center gap-2"><HiPrinter className="w-5 h-5" /> Print</button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-6 md:p-10 font-sans text-gray-800 animate-in fade-in duration-300">
      <div className="flex justify-between items-start mb-6">
        <div><h1 className="text-3xl font-normal text-slate-800">Customer Management</h1></div>
        <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-white transition-colors flex items-center gap-2">← Back to Dashboard</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <TabButton active={activeTab === 'list'} onClick={() => { setActiveTab('list'); setViewCustomer(null); }} icon={<HiOutlineUserGroup className="w-4 h-4" />} label="Customer List" />
        <TabButton active={activeTab === 'receipt'} onClick={() => { setActiveTab('receipt'); setViewCustomer(null); }} icon={<HiOutlineCash className="w-4 h-4" />} label="Customer Receipt" />
        <TabButton active={activeTab === 'advance'} onClick={() => { setActiveTab('advance'); setViewCustomer(null); }} icon={<HiOutlineCreditCard className="w-4 h-4" />} label="Receive Advance" />
        <TabButton active={activeTab === 'statement'} onClick={() => { setActiveTab('statement'); setViewCustomer(null); }} icon={<HiOutlineDocumentText className="w-4 h-4" />} label="Customer Statement" />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm min-h-[400px]">
        {activeTab === 'list' && !viewCustomer && <CustomerList />}
        {activeTab === 'list' && viewCustomer && <CustomerDetails customer={viewCustomer} onBackToList={() => setViewCustomer(null)} />}
        {activeTab === 'receipt' && <ReceiptForm />}
        {activeTab === 'advance' && <AdvanceForm />}
        {activeTab === 'statement' && <StatementForm />}
      </div>
    </div>
  );
}

// =========================
// Z-REPORT VIEW
// =========================
function ZReportView({ onBack, stats, sessionData, categoriesList }) {
  // Real-time calculation based on session stats
  const expectedCash = (sessionData?.openingCash || 0) + stats.paymentMethods['cash'] + stats.cashIn - stats.cashOut;

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-6 md:p-10 font-sans text-gray-800 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-normal text-slate-800">Z-Report</h1>
          <p className="text-gray-500 mt-1 text-sm">End-of-day consolidated summary</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-white transition-colors">← Back to Dashboard</button>
          <button className="px-4 py-2 bg-[#1e5f5f] text-white rounded text-sm font-medium hover:bg-teal-700 flex items-center gap-2"><HiPrinter className="w-4 h-4" /> Print Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border-l-4 border-teal-500 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Total Net Sales</p>
          <h2 className="text-3xl font-bold text-teal-700 mt-2">{formatCurrency(stats.totalSales)}</h2>
          <p className="text-xs text-gray-400 mt-2">Current Session</p>
        </div>
        <div className="bg-white p-6 rounded-lg border-l-4 border-red-400 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Total Returns</p>
          <h2 className="text-3xl font-bold text-red-500 mt-2">{formatCurrency(stats.returnsTotal)}</h2>
          <p className="text-xs text-gray-400 mt-2">{stats.returnsCount} return transactions</p>
        </div>
        <div className="bg-white p-6 rounded-lg border-l-4 border-blue-400 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Total Transactions</p>
          <h2 className="text-3xl font-bold text-slate-700 mt-2">{stats.transactionCount}</h2>
          <p className="text-xs text-gray-400 mt-2">Sales Count</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50"><h3 className="font-semibold text-gray-700">Payment Mode Summary</h3></div>
        <div className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Payment Method</th>
                <th className="px-6 py-3 font-medium text-right">Transactions</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {['cash', 'card', 'digital', 'credit'].map((method) => (
                <tr key={method} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-700 capitalize flex items-center gap-2">
                    {method === 'cash' && <HiOutlineCash />}
                    {method === 'card' && <HiOutlineCreditCard />}
                    {method === 'digital' && <HiOutlineDeviceMobile />}
                    {method === 'credit' && <HiOutlineIdentification />}
                    {method}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">{stats.paymentCounts[method]}</td>
                  <td className="px-6 py-4 text-right font-semibold text-teal-700">{formatCurrency(stats.paymentMethods[method])}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="px-6 py-4 text-gray-800">Total</td>
                <td className="px-6 py-4 text-right text-gray-800">{stats.transactionCount}</td>
                <td className="px-6 py-4 text-right text-teal-800">{formatCurrency(stats.totalSales)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50"><h3 className="font-semibold text-gray-700">Department-wise Sales</h3></div>
        <div className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium text-right">Units Sold</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {categoriesList.map((cat) => {
                const catStat = stats.categorySales[cat.id] || { count: 0, amount: 0 };
                return (
                  <tr key={cat.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">{cat.name}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{catStat.count}</td>
                    <td className="px-6 py-4 text-right font-medium text-teal-700">{formatCurrency(catStat.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50"><h3 className="font-semibold text-gray-700">Cash Movement Summary</h3></div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <span className="text-gray-600 text-sm">Opening Cash</span>
            <span className="font-semibold text-gray-800">{formatCurrency(sessionData?.openingCash)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <span className="text-gray-600 text-sm">Cash Sales</span>
            <span className="font-semibold text-teal-600">{formatCurrency(stats.paymentMethods['cash'])}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <span className="text-gray-600 text-sm">Cash Drops (IN)</span>
            <span className="font-semibold text-teal-600">{formatCurrency(stats.cashIn)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <span className="text-gray-600 text-sm">Cash Out (Expenses)</span>
            <span className="font-semibold text-red-500">{formatCurrency(stats.cashOut)}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-gray-800 font-bold text-sm">Expected Cash Balance</span>
            <span className="font-bold text-gray-800 text-lg">{formatCurrency(expectedCash)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================
// MODALS
// =========================

function StartSessionModal({ onClose, onConfirm }) {
  const [openingCash, setOpeningCash] = useState("");
  const [denominations, setDenominations] = useState({ 5: '', 10: '', 20: '', 50: '', 100: '', 200: '', 500: '', 1000: '' });

  const calcTotal = Object.entries(denominations).reduce((acc, [val, count]) => acc + (Number(val) * (Number(count) || 0)), 0);
  const displayTotal = openingCash ? parseFloat(openingCash) : calcTotal;

  const handleDenomChange = (val, value) => setDenominations({ ...denominations, [val]: value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Start New POS Session</h3>
            <p className="text-sm text-gray-500 mt-1">Enter opening cash drawer amount and denomination breakdown</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"><HiX className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Opening Cash Drawer Amount</label>
            <input type="number" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-gray-300 transition-shadow" placeholder="0.00" value={openingCash} onChange={(e) => setOpeningCash(e.target.value)} />
          </div>

          <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 mb-4">Denomination Breakdown</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {[5, 10, 20, 50, 100, 200, 500, 1000].map((val) => (
                <div key={val} className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 w-16">AED {val}:</label>
                  <div className="flex items-center gap-3 flex-1">
                    <input type="number" min="0" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-teal-500 outline-none text-right bg-white" placeholder="0" value={denominations[val]} onChange={(e) => handleDenomChange(val, e.target.value)} />
                    <span className="text-[10px] text-gray-400 w-20 text-right whitespace-nowrap font-mono">= {(val * (Number(denominations[val]) || 0)).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="bg-[#1e5f5f] text-white rounded-md p-4 flex justify-between items-center mb-4 shadow-sm">
            <span className="font-medium text-sm">Total Opening Cash:</span>
            <span className="font-bold text-lg">AED {displayTotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-white transition-colors">Cancel</button>
            <button onClick={() => onConfirm({ openingCash: displayTotal })} className="px-5 py-2 bg-[#1e5f5f] text-white rounded text-sm font-medium hover:bg-teal-800 transition-colors flex items-center gap-2 shadow-sm"><HiOutlinePlay className="w-4 h-4" /> Start Session</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CloseSessionModal({ onClose, onConfirm, expectedCash }) {
  const [denominations, setDenominations] = useState({ 5: '', 10: '', 20: '', 50: '', 100: '', 200: '', 500: '', 1000: '' });
  const actualCash = Object.entries(denominations).reduce((acc, [val, count]) => acc + (Number(val) * (Number(count) || 0)), 0);
  const variance = actualCash - (expectedCash || 0);
  const handleDenomChange = (val, value) => setDenominations({ ...denominations, [val]: value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="p-6 pb-2 border-b"><div><h3 className="text-lg font-bold">Close Session</h3><p className="text-sm text-gray-500">Enter closing counts</p></div></div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">{[5, 10, 20, 50, 100, 200, 500, 1000].map(val => (
            <div key={val} className="flex justify-between items-center"><label className="text-xs font-bold">AED {val}:</label><input type="number" className="w-20 border rounded px-2 py-1 text-sm text-right" onChange={(e) => handleDenomChange(val, e.target.value)} /></div>
          ))}</div>
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm"><span>Expected:</span><span>{formatCurrency(expectedCash)}</span></div>
            <div className="flex justify-between text-sm"><span>Actual:</span><span>{formatCurrency(actualCash)}</span></div>
            <div className={`flex justify-between p-2 rounded border ${variance !== 0 ? 'bg-red-50 border-red-200' : 'bg-green-50'}`}><span>Variance:</span><span className="font-bold">{formatCurrency(variance)}</span></div>
          </div>
        </div>
        <div className="p-6 pt-0 flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button><button onClick={() => onConfirm({ closingCash: actualCash })} className="px-5 py-2 bg-red-600 text-white rounded">Close Session</button></div>
      </div>
    </div>
  );
}

function RecallModal({ onClose, heldOrders = [], onRecall, onDiscard }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6">
        <div className="flex justify-between mb-4"><h3 className="text-lg font-bold">Held Orders</h3><button onClick={onClose}><HiX /></button></div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {heldOrders.length === 0 ? <p className="text-center text-gray-500">No held orders.</p> : heldOrders.map(o => (
            <div key={o.id} className="border p-3 rounded flex justify-between items-center">
              <div><p className="font-bold">{o.customerName || "Customer"}</p><p className="text-xs text-gray-500">{new Date(o.time || Date.now()).toLocaleTimeString()} - {(typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || [])).length} items</p></div>
              <div className="flex gap-2"><button onClick={() => onDiscard(o.id)} className="text-red-500 text-xs">Discard</button><button onClick={() => onRecall(o)} className="bg-teal-600 text-white px-3 py-1 rounded text-xs">Recall</button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ onClose, onConfirm, total, count, customer, isProcessing }) {
  const [method, setMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-start p-6 pb-2">
          <div><h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><HiOutlineCreditCard className="w-5 h-5 text-teal-600" /> Select Payment Method</h3><p className="text-sm text-gray-500 mt-1">Choose your preferred payment method to complete this sale</p></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><HiX className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-4">
          <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex justify-between items-center">
            <div><h4 className="text-blue-900 font-bold text-sm">Sale Transaction</h4><p className="text-blue-700 text-xs mt-0.5">{customer} • {count} items</p></div>
            <div className="text-blue-900 font-bold text-xl">AED {total?.toFixed(2)}</div>
          </div>
        </div>

        <div className="p-6 pt-0 overflow-y-auto">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Choose Payment Method</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div onClick={() => setMethod('cash')} className={`p-4 rounded-lg border cursor-pointer transition-all flex items-start gap-3 relative ${method === 'cash' ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-gray-200 hover:border-teal-200'}`}><div className={`w-10 h-10 rounded-full flex items-center justify-center ${method === 'cash' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500'}`}><HiOutlineCash className="w-5 h-5" /></div><div><h5 className={`font-bold text-sm ${method === 'cash' ? 'text-teal-900' : 'text-gray-700'}`}>Cash</h5><p className="text-xs text-gray-500">Pay with cash</p></div>{method === 'cash' && (<div className="absolute top-4 right-4 text-teal-600 text-xs font-bold flex items-center gap-1"><HiCheckCircle className="w-4 h-4" /> Selected</div>)}</div>

            <div onClick={() => setMethod('card')} className={`p-4 rounded-lg border cursor-pointer transition-all flex items-start gap-3 relative ${method === 'card' ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-gray-200 hover:border-teal-200'}`}><div className={`w-10 h-10 rounded-full flex items-center justify-center ${method === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}><HiOutlineCreditCard className="w-5 h-5" /></div><div><h5 className="font-bold text-sm text-gray-700">Card</h5><p className="text-xs text-gray-500">Credit/Debit card</p></div></div>

            <div onClick={() => setMethod('digital')} className={`p-4 rounded-lg border cursor-pointer transition-all flex items-start gap-3 relative ${method === 'digital' ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-gray-200 hover:border-teal-200'}`}><div className={`w-10 h-10 rounded-full flex items-center justify-center ${method === 'digital' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}><HiOutlineDeviceMobile className="w-5 h-5" /></div><div><h5 className="font-bold text-sm text-gray-700">Digital</h5><p className="text-xs text-gray-500">Mobile wallet</p></div></div>

            <div onClick={() => setMethod('credit')} className={`p-4 rounded-lg border cursor-pointer transition-all flex items-start gap-3 relative ${method === 'credit' ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-gray-200 hover:border-teal-200'}`}><div className={`w-10 h-10 rounded-full flex items-center justify-center ${method === 'credit' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}><HiOutlineIdentification className="w-5 h-5" /></div><div><h5 className="font-bold text-sm text-gray-700">Credit</h5><p className="text-xs text-gray-500">Member account</p></div></div>
          </div>

          {method === 'cash' && (<div className="bg-teal-50/50 border border-teal-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2"><h5 className="text-sm font-bold text-teal-800 mb-3 flex items-center gap-2"><HiOutlineCash /> Cash Payment Details</h5><div><label className="block text-xs font-bold text-gray-600 mb-1.5">Amount Received (AED)</label><input type="number" autoFocus className="w-full border border-gray-300 rounded p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium" placeholder="0.00" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} /></div></div>)}
        </div>

        <div className="p-6 pt-0 flex justify-end gap-3 mt-auto">
          <button onClick={onClose} disabled={isProcessing} className="px-4 py-2.5 border border-gray-300 rounded text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
          <button 
            onClick={() => onConfirm(method, { amountReceived })} 
            disabled={isProcessing}
            className="px-6 py-2.5 bg-[#1e5f5f] text-white rounded text-sm font-bold hover:bg-teal-700 flex items-center gap-2 shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : <><HiCheckCircle className="w-5 h-5" /> Complete Payment</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ onClose }) {
  // Removed automatic timeout, now waits for user to click Done
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center justify-center w-80 animate-in zoom-in-95">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
          <HiCheckCircle className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Payment Successful</h2>
        <p className="text-gray-500 text-sm mb-6">Transaction completed</p>
        <button onClick={onClose} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300">Done</button>
      </div>
    </div>
  );
}

function CashDropModal({ onClose, onConfirm }) {
  const [type, setType] = useState('IN');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Cash Drop / Out</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Type</label>
            <select className="w-full border rounded p-2 text-sm" value={type} onChange={e => setType(e.target.value)}>
              <option value="IN">Cash Drop (IN)</option>
              <option value="OUT">Cash Out (OUT)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Amount</label>
            <input type="number" className="w-full border rounded p-2 text-sm" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
            <textarea className="w-full border rounded p-2 text-sm" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded text-sm">Cancel</button>
          <button onClick={() => onConfirm({ type, amount: parseFloat(amount), description })} className="px-4 py-2 bg-[#1e5f5f] text-white rounded text-sm">Save</button>
        </div>
      </div>
    </div>
  );
}