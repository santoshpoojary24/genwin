import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, ShoppingBag, Truck, CheckCircle, AlertTriangle, Search,
  RefreshCw, Eye, Edit3, Save, X, Filter, LogOut, UserCheck, Clock,
  ArrowUpRight, ChevronRight, Menu, Box, QrCode, FileText, Check, ShieldAlert,
  BarChart2, HelpCircle, Phone, Mail, ArrowRight, CornerDownRight, Tag, Camera
} from 'lucide-react';
import { FirebaseService } from '../../services/firebaseService';

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  // Employee Session state
  const [employee, setEmployee] = useState(() => {
    try {
      const saved = localStorage.getItem('genwin_employee_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      role: 'EMPLOYEE',
      name: 'Rahul Sharma',
      email: 'staff@genwin.studio',
      employeeId: 'EMP-4092',
      department: 'fulfillment',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      loginTime: new Date().toLocaleString(),
    };
  });

  // Active Workspace Tab
  const [activeTab, setActiveTabState] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl && ['orders', 'inventory', 'tickets', 'scanner'].includes(tabFromUrl)) {
      return tabFromUrl;
    }
    return employee.department === 'inventory' ? 'inventory' : 'orders';
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', url.toString());
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [viewingOrder, setViewingOrder] = useState(null);
  const [editingStockProduct, setEditingStockProduct] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [statusUpdatedToast, setStatusUpdatedToast] = useState('');

  // Support Tickets State
  const [tickets, setTickets] = useState([]);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');

  const loadEmployeeData = async () => {
    setLoading(true);
    const [o, p, empList, tkts] = await Promise.all([
      FirebaseService.getAllOrders(),
      FirebaseService.getProducts(),
      FirebaseService.getEmployees(),
      FirebaseService.getTickets()
    ]);
    setOrders(o);
    setProducts(p);
    setEmployees(empList);
    setTickets(tkts || []);

    // If current employee is found in admin employee list, sync latest profile image
    const matchingEmp = empList.find(e => e.employeeId === employee.employeeId || e.email === employee.email);
    if (matchingEmp && matchingEmp.image) {
      const updatedEmp = { ...employee, image: matchingEmp.image, name: matchingEmp.name };
      setEmployee(updatedEmp);
      localStorage.setItem('genwin_employee_session', JSON.stringify(updatedEmp));
    }

    setLoading(false);
  };

  useEffect(() => {
    loadEmployeeData();

    // Live subscription for support tickets
    const unsubTickets = FirebaseService.subscribeToTickets((liveTickets) => {
      if (liveTickets) setTickets(liveTickets);
    });

    return () => {
      if (typeof unsubTickets === 'function') unsubTickets();
    };
  }, []);

  // Employee Logout
  const handleEmployeeLogout = () => {
    localStorage.removeItem('genwin_employee_session');
    navigate('/employee/login');
  };

  // Order Fulfillment Action
  const handleUpdateStatus = async (orderId, newStatus) => {
    await FirebaseService.updateOrderStatus(orderId, newStatus);
    setStatusUpdatedToast(`ORDER #${orders.find(o => o.id === orderId)?.orderNumber || orderId} UPDATED TO ${newStatus.toUpperCase()}`);
    setTimeout(() => setStatusUpdatedToast(''), 3000);
    loadEmployeeData();
    if (viewingOrder && viewingOrder.id === orderId) {
      setViewingOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  // Save Ticket Resolution & Customer Note
  const handleSaveTicketResolution = async (e) => {
    e.preventDefault();
    if (!viewingTicket) return;
    const updated = await FirebaseService.updateTicketStatus(
      viewingTicket.id || viewingTicket.ticketId,
      viewingTicket.status || 'RESOLVED',
      viewingTicket.responseNote || '',
      viewingTicket.assignedTo || employee.name
    );
    setStatusUpdatedToast(`TICKET #${updated.ticketId || updated.id} RESOLUTION SAVED!`);
    setTimeout(() => setStatusUpdatedToast(''), 3500);
    setViewingTicket(null);
  };

  // Quick Stock Adjustment
  const handleSaveStock = async (e) => {
    e.preventDefault();
    await FirebaseService.saveProduct(editingStockProduct);
    setEditingStockProduct(null);
    loadEmployeeData();
  };

  // Barcode / Order Scanner Simulation
  const handleScanBarcode = (e) => {
    e.preventDefault();
    if (!barcodeInput) return;
    const foundOrder = orders.find(o => o.orderNumber.toString().includes(barcodeInput) || o.id.includes(barcodeInput));
    if (foundOrder) {
      setScanResult({ type: 'order', data: foundOrder });
    } else {
      const foundProd = products.find(p => p.id.includes(barcodeInput) || p.name.toLowerCase().includes(barcodeInput.toLowerCase()));
      if (foundProd) {
        setScanResult({ type: 'product', data: foundProd });
      } else {
        setScanResult({ type: 'not_found', query: barcodeInput });
      }
    }
  };

  // Metrics
  const pendingFulfillment = orders.filter(o => ['placed', 'confirmed', 'packed'].includes(o.status));
  const readyToShip = orders.filter(o => o.status === 'packed');
  const lowStockCount = products.filter(p => (p.stockQty || 10) < 5).length;
  const processedToday = orders.filter(o => o.status === 'shipped' || o.status === 'delivered').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row font-mono">
      
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* ── Employee Sidebar Drawer ───────────────────────────────────────── */}
      <aside className={`
        fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between shrink-0 transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <span className="font-display font-black text-2xl tracking-tighter text-white">
                जेनwin.
              </span>
              <span className="block text-[9px] font-bold tracking-widest text-blue-400 uppercase mt-0.5">
                STAFF WORKSPACE CONSOLE
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 text-zinc-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 text-xs font-bold uppercase">
            {[
              { id: 'orders', label: 'FULFILLMENT & ORDERS', icon: ShoppingBag, count: pendingFulfillment.length },
              { id: 'inventory', label: 'INVENTORY & STOCK', icon: Package, count: lowStockCount ? `${lowStockCount} LOW` : null },
              { id: 'scanner', label: 'BARCODE SCANNER', icon: QrCode, count: null },
              { id: 'tickets', label: 'CUSTOMER TICKETS', icon: HelpCircle, count: tickets.length },
            ].map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 tracking-wider transition-all ${
                    active
                      ? 'bg-white text-black font-extrabold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count && (
                    <span className={`text-[9px] px-1.5 py-0.2 font-mono ${active ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Staff Profile Footer with Employee Image */}
        <div className="p-4 border-t border-zinc-800 space-y-3">
          <div className="bg-zinc-950 border border-zinc-800 p-3 flex items-center gap-3">
            {/* Employee Profile Photo */}
            <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 overflow-hidden shrink-0">
              {employee.image ? (
                <img src={employee.image} alt={employee.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-black text-sm">
                  {employee.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="truncate space-y-0.5">
              <strong className="block text-white text-xs uppercase font-bold truncate">{employee.name}</strong>
              <span className="block text-[9px] text-zinc-500 uppercase font-mono">{employee.employeeId || 'EMP-4092'}</span>
              <span className="inline-block px-1.5 py-0.2 text-[8px] text-emerald-400 font-bold uppercase bg-emerald-950 border border-emerald-800">
                {employee.department}
              </span>
            </div>
          </div>

          <button
            onClick={handleEmployeeLogout}
            className="w-full py-2.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" /> LOG OUT STAFF SESSION
          </button>
        </div>
      </aside>

      {/* ── Main Work Area ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Top Header Bar with Employee Avatar */}
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-zinc-400 hover:text-white lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display font-black text-base sm:text-lg text-white uppercase tracking-tight truncate">
              {activeTab} WORKSPACE
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Header Employee Avatar Badge */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-800">
              <div className="w-8 h-8 bg-zinc-950 border border-zinc-700 overflow-hidden shrink-0">
                {employee.image ? (
                  <img src={employee.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                    {employee.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-xs font-bold text-white uppercase leading-tight">{employee.name}</span>
                <span className="block text-[9px] text-zinc-500 font-mono uppercase">{employee.employeeId}</span>
              </div>
            </div>

            <button
              onClick={loadEmployeeData}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleEmployeeLogout}
              className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold uppercase flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> LOGOUT
            </button>
          </div>
        </header>

        {/* Toast Alert */}
        {statusUpdatedToast && (
          <div className="bg-emerald-950 border-b border-emerald-800 text-emerald-300 px-4 py-2.5 text-xs font-bold uppercase flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{statusUpdatedToast}</span>
            </div>
            <button onClick={() => setStatusUpdatedToast('')} className="p-1 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Content Body */}
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 flex-1">

          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-1">
              <span className="text-[9px] font-bold text-zinc-500 uppercase">NEEDS FULFILLMENT</span>
              <p className="font-display font-black text-xl sm:text-2xl text-white">{pendingFulfillment.length}</p>
              <span className="text-[8px] text-amber-400 font-bold uppercase">PENDING PACKING</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-1">
              <span className="text-[9px] font-bold text-zinc-500 uppercase">READY FOR DISPATCH</span>
              <p className="font-display font-black text-xl sm:text-2xl text-white">{readyToShip.length}</p>
              <span className="text-[8px] text-blue-400 font-bold uppercase">PACKED &amp; SEALED</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-1">
              <span className="text-[9px] font-bold text-zinc-500 uppercase">PROCESSED TODAY</span>
              <p className="font-display font-black text-xl sm:text-2xl text-emerald-400">{processedToday}</p>
              <span className="text-[8px] text-zinc-400 uppercase">SHIPPED / DELIVERED</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-1">
              <span className="text-[9px] font-bold text-zinc-500 uppercase">LOW STOCK ALERTS</span>
              <p className="font-display font-black text-xl sm:text-2xl text-white">{lowStockCount}</p>
              <span className="text-[8px] text-red-400 font-bold uppercase">REQUIRES REORDER</span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 1: ORDER FULFILLMENT WORKSPACE                              */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="SEARCH ORDER #, CUSTOMER OR PHONE..."
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs py-2.5 pl-9 pr-3 uppercase focus:outline-none focus:border-zinc-500"
                  />
                </div>

                {/* Status Filter Scroll Pill Bar */}
                <div className="overflow-x-auto pb-1 sm:pb-0">
                  <div className="flex gap-1 bg-zinc-900 p-1 border border-zinc-800 text-[10px] w-max">
                    {['all', 'placed', 'confirmed', 'packed', 'shipped', 'delivered', 'return_requested', 'return_picked', 'refund_processed', 'cancelled'].map(st => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 uppercase font-bold transition-all ${
                          statusFilter === st ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Cards Grid for Employees */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders
                  .filter(o => {
                    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
                    if (orderSearch && !o.orderNumber.toString().includes(orderSearch) && !(o.customerName || '').toLowerCase().includes(orderSearch.toLowerCase())) return false;
                    return true;
                  })
                  .map(o => (
                    <div key={o.id} className="bg-zinc-900 border border-zinc-800 p-4 space-y-3 flex flex-col justify-between relative group">
                      
                      <div className="space-y-3">
                        {/* Card Header */}
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                          <div>
                            <strong className="font-mono text-base font-black text-white uppercase block">#{o.orderNumber}</strong>
                            <span className="text-[9px] text-zinc-500 uppercase">{new Date(o.createdAt).toLocaleString()}</span>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase border ${
                            o.status === 'delivered'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : o.status === 'packed'
                              ? 'bg-blue-950 text-blue-300 border-blue-800'
                              : o.status === 'cancelled'
                              ? 'bg-red-950 text-red-300 border-red-800'
                              : o.status === 'return_requested'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : o.status === 'return_picked'
                              ? 'bg-orange-950 text-orange-300 border-orange-800'
                              : o.status === 'refund_processed'
                              ? 'bg-purple-950 text-purple-300 border-purple-800'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}>
                            {o.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Customer & Address */}
                        <div className="text-xs text-zinc-300 space-y-1">
                          <strong className="block text-white uppercase font-bold">{o.customerName || 'Guest Customer'}</strong>
                          <p className="text-[10px] text-zinc-400 uppercase leading-snug truncate">
                            {o.shippingAddress?.line1 || 'Address details in order modal'}, {o.shippingAddress?.city || ''}
                          </p>
                        </div>

                        {/* Items Preview */}
                        <div className="bg-zinc-950 p-2.5 border border-zinc-800 space-y-1.5">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase block">ITEMS ({o.items?.length || 1}):</span>
                          {o.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] text-zinc-200">
                              <span className="truncate max-w-[180px] font-bold uppercase">{item.name}</span>
                              <span className="text-[9px] text-zinc-400 font-mono">QTY: {item.quantity} ({item.size})</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Staff Fulfillment Workflow Buttons */}
                      <div className="pt-3 border-t border-zinc-800 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                          {o.status === 'placed' && (
                            <button
                              onClick={() => handleUpdateStatus(o.id, 'confirmed')}
                              className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white uppercase col-span-2 flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> CONFIRM ORDER
                            </button>
                          )}
                          {o.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(o.id, 'packed')}
                              className="w-full py-2 bg-purple-900 hover:bg-purple-800 text-white uppercase col-span-2 flex items-center justify-center gap-1"
                            >
                              <Box className="w-3.5 h-3.5" /> MARK PACKED &amp; SEALED
                            </button>
                          )}
                          {o.status === 'packed' && (
                            <button
                              onClick={() => handleUpdateStatus(o.id, 'shipped')}
                              className="w-full py-2 bg-emerald-900 hover:bg-emerald-800 text-white uppercase col-span-2 flex items-center justify-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" /> DISPATCH TO COURIER
                            </button>
                          )}
                          {o.status === 'shipped' && (
                            <button
                              onClick={() => handleUpdateStatus(o.id, 'delivered')}
                              className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white uppercase col-span-2 flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> MARK DELIVERED
                            </button>
                          )}
                          {o.status === 'return_requested' && (
                            <button
                              onClick={() => handleUpdateStatus(o.id, 'return_picked')}
                              className="w-full py-2 bg-amber-900 hover:bg-amber-800 text-white uppercase col-span-2 flex items-center justify-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" /> MARK RETURN PICKED
                            </button>
                          )}
                          {o.status === 'return_picked' && (
                            <button
                              onClick={() => handleUpdateStatus(o.id, 'refund_processed')}
                              className="w-full py-2 bg-purple-900 hover:bg-purple-800 text-white uppercase col-span-2 flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> PROCESS REFUND
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => setViewingOrder(o)}
                          className="w-full py-1.5 bg-zinc-950 text-zinc-300 hover:text-white text-[10px] uppercase font-bold flex items-center justify-center gap-1 border border-zinc-800"
                        >
                          <Eye className="w-3 h-3" /> FULL ORDER SLIP
                        </button>
                      </div>

                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 2: INVENTORY & STOCK MANAGEMENT                             */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="SEARCH INVENTORY..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs py-2.5 pl-9 pr-3 uppercase focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              {/* Stock Inventory Table */}
              <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[600px]">
                  <thead className="bg-zinc-950 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">PRODUCT ITEM</th>
                      <th className="p-4">CATEGORY</th>
                      <th className="p-4">RETAIL PRICE</th>
                      <th className="p-4">CURRENT STOCK</th>
                      <th className="p-4">STATUS</th>
                      <th className="p-4 text-right">QUICK ADJUST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {products
                      .filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()))
                      .map(p => {
                        const isLow = (p.stockQty || 10) < 5;
                        return (
                          <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={p.images?.[0]} alt="" className="w-9 h-11 object-cover bg-zinc-800 border border-zinc-700 shrink-0" />
                                <div>
                                  <strong className="block text-white uppercase font-bold">{p.name}</strong>
                                  <span className="text-[9px] text-zinc-500 uppercase">SKU: {p.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 uppercase text-zinc-300">{p.category}</td>
                            <td className="p-4 font-bold text-white">₹{p.discountPrice || p.basePrice}</td>
                            <td className="p-4">
                              <span className="font-mono font-black text-sm text-white">{p.stockQty || 10} UNITS</span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                                isLow ? 'bg-red-950 text-red-300 border-red-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              }`}>
                                {isLow ? 'LOW STOCK' : 'IN STOCK'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setEditingStockProduct(p)}
                                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-[10px] uppercase transition-colors"
                              >
                                EDIT QTY
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 3: BARCODE SCANNER SIMULATOR                                 */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'scanner' && (
            <div className="space-y-6 max-w-xl mx-auto animate-fade-in">
              <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-4 text-center">
                <div className="w-12 h-12 bg-white text-black flex items-center justify-center mx-auto border-2 border-zinc-700 shadow-md">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-display font-black text-white text-lg uppercase">DISPATCH BARCODE SCANNER</h3>
                <p className="text-xs text-zinc-400 uppercase">ENTER OR SCAN ORDER NUMBER / PRODUCT ID FOR INSTANT PROCESSING</p>

                <form onSubmit={handleScanBarcode} className="space-y-3 text-left pt-2">
                  <input
                    type="text"
                    required
                    placeholder="ENTER ORDER # (e.g. 9821) OR PRODUCT SKU..."
                    value={barcodeInput}
                    onChange={e => setBarcodeInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono uppercase focus:outline-none focus:border-zinc-500"
                  />
                  <button type="submit" className="w-full py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-zinc-200">
                    SCAN BARCODE
                  </button>
                </form>
              </div>

              {/* Scan Result */}
              {scanResult && (
                <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-3 font-mono text-xs">
                  {scanResult.type === 'order' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                        <strong className="text-white text-base">ORDER #{scanResult.data.orderNumber} FOUND</strong>
                        <span className="px-2 py-0.5 bg-blue-950 text-blue-300 text-[10px] font-bold uppercase">{scanResult.data.status}</span>
                      </div>
                      <p className="text-zinc-300">Customer: {scanResult.data.customerName || 'Guest'}</p>
                      <p className="text-zinc-400">Total: ₹{scanResult.data.total}</p>
                      <button
                        onClick={() => handleUpdateStatus(scanResult.data.id, 'packed')}
                        className="w-full py-2.5 bg-purple-900 hover:bg-purple-800 text-white font-bold uppercase text-xs"
                      >
                        CONFIRM PACK &amp; SEAL
                      </button>
                    </div>
                  )}

                  {scanResult.type === 'product' && (
                    <div className="space-y-3">
                      <strong className="text-white text-base block">{scanResult.data.name}</strong>
                      <p className="text-zinc-400">Stock Qty: {scanResult.data.stockQty || 10} Units</p>
                      <p className="text-zinc-400">Price: ₹{scanResult.data.discountPrice || scanResult.data.basePrice}</p>
                    </div>
                  )}

                  {scanResult.type === 'not_found' && (
                    <p className="text-red-400 text-center uppercase font-bold">NO MATCHING ORDER OR SKU FOUND FOR "{scanResult.query}"</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 4: CUSTOMER SUPPORT TICKETS & RESOLUTION SYSTEM             */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'tickets' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="SEARCH TICKETS BY ID, CUSTOMER, OR EMAIL..."
                    value={ticketSearch}
                    onChange={e => setTicketSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs py-2.5 pl-9 pr-3 uppercase focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">FILTER:</span>
                  <select
                    value={ticketStatusFilter}
                    onChange={e => setTicketStatusFilter(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-xs text-white p-2 font-mono uppercase focus:outline-none cursor-pointer"
                  >
                    <option value="all">ALL STATUSES ({tickets.length})</option>
                    <option value="OPEN">OPEN ({tickets.filter(t => (t.status || 'OPEN') === 'OPEN').length})</option>
                    <option value="IN_PROGRESS">IN PROGRESS ({tickets.filter(t => t.status === 'IN_PROGRESS').length})</option>
                    <option value="RESOLVED">RESOLVED ({tickets.filter(t => t.status === 'RESOLVED').length})</option>
                    <option value="CLOSED">CLOSED ({tickets.filter(t => t.status === 'CLOSED').length})</option>
                  </select>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[750px]">
                  <thead className="bg-zinc-950 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">TICKET ID</th>
                      <th className="p-4">CUSTOMER &amp; CONTACT</th>
                      <th className="p-4">CATEGORY / SUBJECT</th>
                      <th className="p-4">ORDER ID</th>
                      <th className="p-4">PRIORITY</th>
                      <th className="p-4">STATUS</th>
                      <th className="p-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {tickets
                      .filter(t => {
                        const matchesFilter = ticketStatusFilter === 'all' || (t.status || 'OPEN') === ticketStatusFilter;
                        const query = ticketSearch.toLowerCase();
                        const matchesQuery = !ticketSearch || 
                          (t.ticketId && t.ticketId.toLowerCase().includes(query)) ||
                          (t.id && t.id.toLowerCase().includes(query)) ||
                          (t.customerName && t.customerName.toLowerCase().includes(query)) ||
                          (t.customerEmail && t.customerEmail.toLowerCase().includes(query)) ||
                          (t.orderId && t.orderId.toLowerCase().includes(query));
                        return matchesFilter && matchesQuery;
                      })
                      .map(t => {
                        const isUrgent = t.priority === 'URGENT';
                        const isHigh = t.priority === 'HIGH';
                        return (
                          <tr key={t.id || t.ticketId} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="p-4 font-bold text-white font-mono">#{t.ticketId || t.id}</td>
                            <td className="p-4">
                              <strong className="block text-white uppercase font-bold">{t.customerName || t.customer || 'Anonymous'}</strong>
                              <span className="text-[10px] text-zinc-400 block">{t.customerEmail}</span>
                              {t.customerPhone && <span className="text-[9px] text-zinc-500 block">{t.customerPhone}</span>}
                            </td>
                            <td className="p-4">
                              <span className="text-[10px] font-bold text-emerald-400 block uppercase">{t.issueType || t.issue}</span>
                              <span className="text-zinc-300 line-clamp-1">{t.subject}</span>
                            </td>
                            <td className="p-4 font-mono font-bold text-zinc-300">
                              {t.orderId ? `GW-${t.orderId.toString().replace('GW-', '')}` : '—'}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                                isUrgent ? 'bg-red-950 text-red-300 border-red-800' :
                                isHigh ? 'bg-amber-950 text-amber-300 border-amber-800' :
                                'bg-blue-950 text-blue-300 border-blue-800'
                              }`}>
                                {t.priority || 'MEDIUM'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                                t.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                                t.status === 'IN_PROGRESS' ? 'bg-blue-950 text-blue-300 border-blue-800' :
                                t.status === 'CLOSED' ? 'bg-zinc-800 text-zinc-400 border-zinc-700' :
                                'bg-amber-950 text-amber-300 border-amber-800'
                              }`}>
                                {t.status || 'OPEN'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setViewingTicket(t)}
                                className="px-3 py-1.5 bg-white text-black font-extrabold text-[10px] uppercase hover:bg-zinc-200 transition-colors shadow-sm"
                              >
                                RESOLVE TICKET
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Stock Edit Modal */}
      {editingStockProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleSaveStock} className="bg-zinc-900 border border-zinc-800 max-w-sm w-full p-6 space-y-4 font-mono text-xs">
            <h3 className="font-display font-black text-white text-base uppercase">ADJUST STOCK QUANTITY</h3>
            <strong className="block text-zinc-300 uppercase">{editingStockProduct.name}</strong>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">UNITS IN INVENTORY</label>
              <input
                type="number"
                required
                value={editingStockProduct.stockQty || 10}
                onChange={e => setEditingStockProduct({ ...editingStockProduct, stockQty: parseInt(e.target.value) || 0 })}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono"
              />
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setEditingStockProduct(null)} className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 uppercase font-bold">
                CANCEL
              </button>
              <button type="submit" className="flex-1 py-2.5 bg-white text-black font-extrabold uppercase">
                SAVE STOCK
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ticket Details & Resolution Modal */}
      {viewingTicket && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form onSubmit={handleSaveTicketResolution} className="bg-zinc-900 border border-zinc-800 max-w-2xl w-full p-6 space-y-5 font-mono text-xs my-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">CUSTOMER SUPPORT TICKET #{viewingTicket.ticketId || viewingTicket.id}</span>
                <h3 className="font-display font-black text-white text-lg uppercase">{viewingTicket.subject}</h3>
              </div>
              <button type="button" onClick={() => setViewingTicket(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Full Details Card */}
            <div className="bg-zinc-950 p-4 border border-zinc-800 space-y-2">
              <strong className="block text-emerald-400 text-[10px] uppercase tracking-widest font-bold border-b border-zinc-900 pb-1">
                CUSTOMER FULL CONTACT &amp; SHIPPING DETAILS
              </strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div><span className="text-zinc-500 uppercase">NAME:</span> <strong className="text-white uppercase">{viewingTicket.customerName || viewingTicket.customer}</strong></div>
                <div><span className="text-zinc-500 uppercase">EMAIL:</span> <strong className="text-white">{viewingTicket.customerEmail}</strong></div>
                <div><span className="text-zinc-500 uppercase">PHONE:</span> <strong className="text-white">{viewingTicket.customerPhone || 'N/A'}</strong></div>
                <div><span className="text-zinc-500 uppercase">ISSUE TYPE:</span> <strong className="text-emerald-400 uppercase">{viewingTicket.issueType || viewingTicket.issue}</strong></div>
              </div>
              {viewingTicket.customerAddress && (
                <div className="pt-1">
                  <span className="text-zinc-500 text-[10px] uppercase block">SHIPPING ADDRESS:</span>
                  <p className="text-zinc-300 text-[11px] uppercase font-bold">{viewingTicket.customerAddress}</p>
                </div>
              )}
            </div>

            {/* Linked Order Info (if Order ID attached) */}
            {viewingTicket.orderId && (() => {
              const matchedOrder = orders.find(o => o.orderNumber.toString() === viewingTicket.orderId.toString().replace('GW-', '') || o.id === viewingTicket.orderId);
              return (
                <div className="bg-zinc-950 p-4 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-1">
                    <strong className="text-amber-400 text-[10px] uppercase tracking-widest font-bold">
                      LINKED STORE ORDER #{viewingTicket.orderId}
                    </strong>
                    {matchedOrder && <span className="text-[10px] text-blue-400 font-bold uppercase">{matchedOrder.status}</span>}
                  </div>
                  {matchedOrder ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-zinc-300 font-bold">
                        <span>Total: ₹{matchedOrder.total} ({matchedOrder.paymentMethod || 'COD'})</span>
                        <span>Date: {new Date(matchedOrder.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="space-y-1 pt-1">
                        {matchedOrder.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-[10px] text-zinc-400 bg-zinc-900 p-1.5 border border-zinc-800">
                            <span>{item.name} (Size: {item.size})</span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-500 uppercase">Order ID #{viewingTicket.orderId} recorded by customer.</p>
                  )}
                </div>
              );
            })()}

            {/* Customer Message Body */}
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">CUSTOMER MESSAGE &amp; REQUEST DETAILS:</span>
              <div className="bg-zinc-950 p-3.5 border border-zinc-800 text-zinc-200 leading-relaxed text-xs">
                {viewingTicket.message || viewingTicket.issue}
              </div>
            </div>

            {/* Employee Actions */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">UPDATE TICKET STATUS</label>
                  <select
                    value={viewingTicket.status || 'OPEN'}
                    onChange={e => setViewingTicket({ ...viewingTicket, status: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 p-2 text-white text-xs font-mono font-bold uppercase focus:outline-none"
                  >
                    <option value="OPEN">OPEN — Awaiting Action</option>
                    <option value="IN_PROGRESS">IN PROGRESS — Employee Working</option>
                    <option value="RESOLVED">RESOLVED — Solved &amp; Approved</option>
                    <option value="CLOSED">CLOSED — Finished</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">ASSIGNED EMPLOYEE</label>
                  <input
                    type="text"
                    value={viewingTicket.assignedTo || employee.name}
                    onChange={e => setViewingTicket({ ...viewingTicket, assignedTo: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 p-2 text-white text-xs font-mono font-bold uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                  OFFICIAL RESOLUTION RESPONSE / CUSTOMER NOTE
                </label>
                <textarea
                  rows={3}
                  value={viewingTicket.responseNote || ''}
                  onChange={e => setViewingTicket({ ...viewingTicket, responseNote: e.target.value })}
                  placeholder="WRITE RESOLUTION NOTE FOR CUSTOMER (e.g. Size L dispatched via express courier #GW-EX9021...)"
                  className="w-full bg-zinc-950 border border-zinc-700 p-2.5 text-white text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setViewingTicket(null)}
                className="flex-1 py-3 bg-zinc-800 text-zinc-300 uppercase font-bold text-xs hover:bg-zinc-700"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-white text-black font-extrabold uppercase text-xs hover:bg-zinc-200 shadow-md"
              >
                SAVE &amp; RESOLVE TICKET →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Order Detail Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-zinc-900 border border-zinc-800 max-w-lg w-full p-4 sm:p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-display font-black text-white text-base uppercase">ORDER PACKING SLIP #{viewingOrder.orderNumber}</h3>
              <button onClick={() => setViewingOrder(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-zinc-950 p-4 border border-zinc-800 space-y-1">
              <strong className="block text-white uppercase">{viewingOrder.customerName || 'Guest'}</strong>
              <p className="text-zinc-400 text-[10px]">{viewingOrder.shippingAddress?.line1}, {viewingOrder.shippingAddress?.city} - {viewingOrder.shippingAddress?.pincode}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[10px]">PACKING ITEMS:</h4>
              {viewingOrder.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-zinc-950 border border-zinc-800">
                  <span className="text-white font-bold uppercase">{item.name}</span>
                  <span className="text-[10px] text-zinc-400">SIZE: {item.size} · QTY: {item.quantity}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setViewingOrder(null)} className="w-full py-2.5 bg-white text-black font-bold uppercase">
              CLOSE SLIP
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
