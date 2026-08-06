import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  HelpCircle, MessageSquare, Ticket, CheckCircle2, Search, ArrowRight,
  ShieldCheck, AlertTriangle, User, Mail, Phone, MapPin, Package, Clock,
  RefreshCw, ChevronRight, MessageCircle, Send, FileText
} from 'lucide-react';
import { FirebaseService } from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export default function Support() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'lookup' ? 'lookup' : 'create');

  // New Ticket Form State
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [issueType, setIssueType] = useState('Size Exchange & Sizing');
  const [priority, setPriority] = useState('HIGH');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [userOrders, setUserOrders] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Ticket Lookup State
  const [lookupQuery, setLookupQuery] = useState('');
  const [foundTickets, setFoundTickets] = useState(null);
  const [searching, setSearching] = useState(false);

  // Auto-fetch customer's own tickets directly
  const [myTickets, setMyTickets] = useState([]);
  const [loadingMyTickets, setLoadingMyTickets] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      FirebaseService.getUserOrders(user.uid).then(orders => {
        setUserOrders(orders || []);
      }).catch(() => {});
    }

    // Subscribe to live tickets for logged in customer
    const unsub = FirebaseService.subscribeToTickets((allTickets) => {
      setLoadingMyTickets(false);
      if (user?.email) {
        const uEmail = user.email.toLowerCase();
        const mine = (allTickets || []).filter(t => 
          (t.customerEmail && t.customerEmail.toLowerCase() === uEmail) ||
          (t.userId && t.userId === user.uid)
        );
        setMyTickets(mine);
      }
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [user]);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !message || !subject) {
      alert('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        userId: user?.uid || '',
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        orderId: orderId.trim(),
        issueType,
        priority,
        subject: subject.trim(),
        message: message.trim(),
      };
      const created = await FirebaseService.createTicket(payload);
      setSubmittedTicket(created);
    } catch (err) {
      alert('Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookupTicket = async (e) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    setSearching(true);
    try {
      const all = await FirebaseService.getTickets();
      const query = lookupQuery.trim().toLowerCase();
      const matches = all.filter(t => 
        (t.ticketId && t.ticketId.toLowerCase().includes(query)) ||
        (t.id && t.id.toLowerCase().includes(query)) ||
        (t.customerEmail && t.customerEmail.toLowerCase().includes(query)) ||
        (t.orderId && t.orderId.toLowerCase().includes(query))
      );
      setFoundTickets(matches);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const displayList = foundTickets !== null ? foundTickets : myTickets;

  return (
    <div className="min-h-screen bg-white text-black font-mono page-enter pb-24">
      {/* Top Banner */}
      <div className="bg-zinc-950 text-white border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] uppercase font-mono tracking-widest text-emerald-400">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>OFFICIAL CUSTOMER SUPPORT &amp; TICKET CENTER</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight">
            HOW CAN OUR TEAM HELP YOU TODAY?
          </h1>
          <p className="text-xs text-zinc-400 max-w-2xl font-mono uppercase leading-relaxed">
            Create an official support ticket for size exchanges, shipping inquiries, custom DTG printing assistance, or return requests. Dedicated staff response guaranteed.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 space-y-12">
        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-3 px-6 font-display font-black text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'create'
                ? 'border-black text-black'
                : 'border-transparent text-zinc-400 hover:text-black'
            }`}
          >
            <Ticket className="w-4 h-4" /> CREATE NEW SUPPORT TICKET
          </button>
          <button
            onClick={() => setActiveTab('lookup')}
            className={`py-3 px-6 font-display font-black text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'lookup'
                ? 'border-black text-black'
                : 'border-transparent text-zinc-400 hover:text-black'
            }`}
          >
            <Search className="w-4 h-4" /> CHECK TICKET STATUS {myTickets.length > 0 ? `(${myTickets.length})` : ''}
          </button>
        </div>

        {/* TAB 1: CREATE SUPPORT TICKET */}
        {activeTab === 'create' && (
          <div>
            {submittedTicket ? (
              <div className="bg-zinc-950 text-white p-8 border border-zinc-800 space-y-6 max-w-2xl mx-auto text-center font-mono">
                <div className="w-16 h-16 bg-emerald-500 text-black flex items-center justify-center rounded-full mx-auto shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest block">TICKET CREATED SUCCESSFULLY</span>
                  <h2 className="font-display font-black text-2xl uppercase text-white">TICKET #{submittedTicket.ticketId}</h2>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed uppercase">
                    Your support request has been logged into our real-time employee queue. Our support staff will review customer details and update you promptly.
                  </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 text-left font-mono text-xs space-y-2">
                  <div className="flex justify-between text-[10px] text-zinc-400 uppercase border-b border-zinc-800 pb-2">
                    <span>CUSTOMER: {submittedTicket.customerName}</span>
                    <span>STATUS: <strong className="text-amber-400">{submittedTicket.status}</strong></span>
                  </div>
                  <p className="text-zinc-300 font-bold uppercase">ISSUE: {submittedTicket.subject}</p>
                  <p className="text-zinc-400 text-[11px]">{submittedTicket.message}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setSubmittedTicket(null)}
                    className="flex-1 py-3 bg-zinc-800 text-white font-bold text-xs uppercase hover:bg-zinc-700 transition-colors"
                  >
                    CREATE ANOTHER TICKET
                  </button>
                  <button
                    onClick={() => {
                      setLookupQuery(submittedTicket.ticketId);
                      setActiveTab('lookup');
                    }}
                    className="flex-1 py-3 bg-white text-black font-extrabold text-xs uppercase hover:bg-zinc-200 transition-colors"
                  >
                    TRACK THIS TICKET →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Form Fields */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                        FULL NAME *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="ENTER YOUR FULL NAME"
                        className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-mono text-black uppercase focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                        EMAIL ADDRESS *
                      </label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        placeholder="YOUR EMAIL@EXAMPLE.COM"
                        className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-mono text-black focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                        PHONE NUMBER *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-mono text-black uppercase focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                        ASSOCIATED ORDER ID (OPTIONAL)
                      </label>
                      {userOrders.length > 0 ? (
                        <select
                          value={orderId}
                          onChange={e => setOrderId(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-mono text-black uppercase focus:outline-none focus:border-black"
                        >
                          <option value="">-- SELECT FROM YOUR RECENT ORDERS --</option>
                          {userOrders.map(o => (
                            <option key={o.id} value={o.orderNumber || o.id}>
                              ORDER #{o.orderNumber || o.id} (₹{o.total} · {o.status})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={orderId}
                          onChange={e => setOrderId(e.target.value)}
                          placeholder="e.g. GW-849201"
                          className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-mono text-black uppercase focus:outline-none focus:border-black"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                      SHIPPING / DELIVERY ADDRESS (FOR RETURNS OR REPLACEMENTS)
                    </label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      placeholder="ENTER HOUSE/STREET, CITY, STATE & PINCODE"
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-mono text-black uppercase focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                        ISSUE CATEGORY *
                      </label>
                      <select
                        value={issueType}
                        onChange={e => setIssueType(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-mono text-black uppercase focus:outline-none focus:border-black cursor-pointer"
                      >
                        <option value="Size Exchange & Sizing">Size Exchange &amp; Fit Issue</option>
                        <option value="Shipping & Tracking Delay">Shipping &amp; Tracking Update</option>
                        <option value="Return / Refund Request">Return &amp; Refund Request</option>
                        <option value="Custom Print Studio Help">Custom DTG Print Graphic Inquiry</option>
                        <option value="Damaged Item Received">Damaged or Incorrect Item Received</option>
                        <option value="Address Change Before Dispatch">Address Update Request</option>
                        <option value="General Inquiry">General Question / Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                        PRIORITY LEVEL *
                      </label>
                      <select
                        value={priority}
                        onChange={e => setPriority(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-mono text-black uppercase focus:outline-none focus:border-black cursor-pointer"
                      >
                        <option value="NORMAL">NORMAL — Routine Question</option>
                        <option value="HIGH">HIGH — Order Change / Dispatch Issue</option>
                        <option value="URGENT">URGENT — Urgent Replacement / Address Change</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                      SUBJECT / SUMMARY *
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="e.g. Need size exchange for Heavyweight Tee from XL to L"
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-mono text-black uppercase focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                      DETAILED MESSAGE / EXPLANATION *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="PROVIDE ALL DETAILS REGARDING YOUR REQUEST SO OUR STAFF CAN RESOLVE IT QUICKLY..."
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-mono text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-black text-white font-extrabold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {submitting ? 'LOGGING TICKET TO CLOUD QUEUE...' : 'SUBMIT SUPPORT TICKET →'}
                  </button>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-zinc-50 border border-zinc-200 p-6 space-y-4">
                    <h3 className="font-display font-black text-black text-base uppercase border-b border-zinc-200 pb-3">
                      GENWIN TICKET SLA &amp; GUARANTEE
                    </h3>
                    <ul className="space-y-3 text-xs text-zinc-600 font-mono">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Every ticket is directly assigned to our active fulfillment &amp; support staff team.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Average initial response time is under 2 business hours.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Hassle-free 7-day size exchange &amp; replacement processing.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-black text-white p-6 space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400">DIRECT SUPPORT CHANNELS</h4>
                    <div className="space-y-2 text-xs font-mono text-zinc-300">
                      <p className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{settings.supportEmail || 'support@genwin.studio'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{settings.supportPhone || '+91 98765 43210'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: LOOKUP & MY TICKETS DIRECT VIEW */}
        {activeTab === 'lookup' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* If user is logged in, show their tickets directly */}
            {user?.email && myTickets.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                  <h3 className="font-display font-black text-lg uppercase text-black flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-emerald-600" />
                    YOUR SUPPORT TICKETS ({myTickets.length})
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">LOGGED IN AS: {user.email}</span>
                </div>

                <div className="space-y-4">
                  {myTickets.map(t => (
                    <div key={t.id || t.ticketId} className="bg-zinc-950 text-white border border-zinc-800 p-6 space-y-4 font-mono text-xs shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-2">
                        <div>
                          <span className="text-[10px] text-emerald-400 font-bold uppercase block">TICKET #{t.ticketId || t.id}</span>
                          <strong className="text-white text-base uppercase font-bold">{t.subject}</strong>
                        </div>
                        <span className={`self-start px-3 py-1 text-[10px] font-bold uppercase border ${
                          t.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                          t.status === 'IN_PROGRESS' ? 'bg-blue-950 text-blue-300 border-blue-800' :
                          'bg-amber-950 text-amber-300 border-amber-800'
                        }`}>
                          {t.status || 'OPEN'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-900 p-3 border border-zinc-800 text-[11px]">
                        <div><span className="text-zinc-500 uppercase">Category:</span> <strong className="text-zinc-200 uppercase">{t.issueType}</strong></div>
                        <div><span className="text-zinc-500 uppercase">Priority:</span> <strong className="text-zinc-200 uppercase">{t.priority}</strong></div>
                        <div><span className="text-zinc-500 uppercase">Order ID:</span> <strong className="text-zinc-200 uppercase">{t.orderId || 'N/A'}</strong></div>
                        <div><span className="text-zinc-500 uppercase">Logged Date:</span> <strong className="text-zinc-200 uppercase">{new Date(t.createdAt || Date.now()).toLocaleDateString()}</strong></div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">YOUR MESSAGE DETAILS:</span>
                        <p className="bg-zinc-900 p-3 border border-zinc-800 text-zinc-300 leading-relaxed text-[11px]">{t.message}</p>
                      </div>

                      {t.responseNote ? (
                        <div className="bg-emerald-950/80 border border-emerald-700 p-4 space-y-1.5 shadow-lg">
                          <div className="flex items-center justify-between border-b border-emerald-900 pb-1">
                            <span className="text-[10px] text-emerald-300 font-bold uppercase flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> OFFICIAL EMPLOYEE RESOLUTION RESPONSE
                            </span>
                            <span className="text-[9px] text-emerald-400 font-mono">Staff: {t.assignedTo || 'Support Agent'}</span>
                          </div>
                          <p className="text-white text-xs leading-relaxed font-bold uppercase pt-1">{t.responseNote}</p>
                        </div>
                      ) : (
                        <div className="bg-zinc-900 p-3 border border-zinc-800 text-[10px] text-amber-400 font-bold uppercase flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          STATUS: AWAITING EMPLOYEE ACTION. STAFF REPLIES WILL POP UP HERE IN REAL-TIME.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Manual Search Bar */}
            <div className="space-y-4 pt-4 border-t border-zinc-200">
              <form onSubmit={handleLookupTicket} className="space-y-3">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  SEARCH ANY TICKET NUMBER (e.g. TKT-849201) OR GUEST EMAIL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={lookupQuery}
                    onChange={e => setLookupQuery(e.target.value)}
                    placeholder="e.g. TKT-1092 OR GUEST@EMAIL.COM"
                    className="flex-1 bg-zinc-50 border border-zinc-200 p-3 text-xs font-mono text-black uppercase focus:outline-none focus:border-black"
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="px-8 py-3 bg-black text-white font-extrabold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors shrink-0"
                  >
                    {searching ? 'SEARCHING...' : 'SEARCH TICKET'}
                  </button>
                </div>
              </form>

              {/* Manual Search Results */}
              {foundTickets !== null && (
                <div className="space-y-4 pt-2">
                  <h3 className="font-display font-black text-sm uppercase text-black border-b border-zinc-200 pb-2">
                    SEARCH RESULTS ({foundTickets.length} TICKETS FOUND)
                  </h3>

                  {foundTickets.length === 0 ? (
                    <div className="bg-zinc-50 border border-zinc-200 p-8 text-center space-y-2">
                      <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                      <p className="text-xs font-bold uppercase text-black">NO TICKET FOUND FOR "{lookupQuery}"</p>
                      <p className="text-[11px] text-zinc-500 uppercase">Please check your Ticket ID or Email spelling and try again.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {foundTickets.map(t => (
                        <div key={t.id || t.ticketId} className="bg-zinc-950 text-white border border-zinc-800 p-6 space-y-4 font-mono text-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-2">
                            <div>
                              <span className="text-[10px] text-emerald-400 font-bold uppercase block">TICKET #{t.ticketId || t.id}</span>
                              <strong className="text-white text-base uppercase font-bold">{t.subject}</strong>
                            </div>
                            <span className={`self-start px-3 py-1 text-[10px] font-bold uppercase border ${
                              t.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                              t.status === 'IN_PROGRESS' ? 'bg-blue-950 text-blue-300 border-blue-800' :
                              'bg-amber-950 text-amber-300 border-amber-800'
                            }`}>
                              {t.status || 'OPEN'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-900 p-3 border border-zinc-800 text-[11px]">
                            <div><span className="text-zinc-500 uppercase">Category:</span> <strong className="text-zinc-200 uppercase">{t.issueType}</strong></div>
                            <div><span className="text-zinc-500 uppercase">Priority:</span> <strong className="text-zinc-200 uppercase">{t.priority}</strong></div>
                            <div><span className="text-zinc-500 uppercase">Order ID:</span> <strong className="text-zinc-200 uppercase">{t.orderId || 'N/A'}</strong></div>
                            <div><span className="text-zinc-500 uppercase">Logged Date:</span> <strong className="text-zinc-200 uppercase">{new Date(t.createdAt || Date.now()).toLocaleDateString()}</strong></div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-zinc-400 uppercase font-bold">YOUR MESSAGE DETAILS:</span>
                            <p className="bg-zinc-900 p-3 border border-zinc-800 text-zinc-300 leading-relaxed text-[11px]">{t.message}</p>
                          </div>

                          {t.responseNote && (
                            <div className="bg-emerald-950/80 border border-emerald-700 p-4 space-y-1.5">
                              <div className="flex items-center justify-between border-b border-emerald-900 pb-1">
                                <span className="text-[10px] text-emerald-300 font-bold uppercase flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> OFFICIAL EMPLOYEE RESOLUTION RESPONSE
                                </span>
                                <span className="text-[9px] text-emerald-400 font-mono">Staff: {t.assignedTo || 'Support Agent'}</span>
                              </div>
                              <p className="text-white text-xs leading-relaxed font-bold uppercase pt-1">{t.responseNote}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
