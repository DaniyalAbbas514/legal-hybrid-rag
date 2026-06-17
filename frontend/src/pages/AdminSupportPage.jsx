import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminSupportPage = () => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('currentAdmin');
    if (!storedAdmin) {
      navigate('/admin-login');
    } else {
      try {
        setCurrentAdmin(JSON.parse(storedAdmin));
      } catch (err) {
        console.error('Error parsing admin data:', err);
        navigate('/admin-login');
      }
    }
  }, [navigate]);

  const [queries, setQueries] = useState([]);
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, urgent: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('1_to_n');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteQueryId, setDeleteQueryId] = useState(null);
  const QUERIES_PER_PAGE = 5;

  const fetchQueries = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/support');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Failed to load support queries.');
      setQueries(data.queries || []);
      setStats({
        total: data.total || 0,
        resolved: data.resolved || 0,
        pending: data.pending || 0,
        urgent: data.urgent || 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries(true);
    const interval = setInterval(() => fetchQueries(false), 15000);
    return () => clearInterval(interval);
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Urgent':
        return 'bg-[#FFDAD6] text-[#93000A] shadow-[inset_0_0_0_1px_rgba(186,26,26,0.2)]';
      case 'Pending':
        return 'bg-[#FFDEA5] text-[#261900] shadow-[inset_0_0_0_1px_rgba(233,193,118,0.5)]';
      case 'Solved':
        return 'bg-[#D1FAE5] text-[#065F46] shadow-[inset_0_0_0_1px_rgba(5,150,105,0.2)]';
      default:
        return 'bg-[#E1E2E4] text-[#191C1E] shadow-[inset_0_0_0_1px_rgba(117,119,126,0.2)]';
    }
  };

  const formatDateTime = (isoStr) => {
    if (!isoStr) return { date: 'N/A', time: '' };
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return { date: 'N/A', time: '' };
    const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { date, time };
  };

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStatusChange = async (queryId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/support/${queryId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.detail || 'Failed to update status.');
      }
      // Optimistic update: change locally then refresh
      setQueries((prev) =>
        prev.map((q) => q.query_id === queryId ? { ...q, status: newStatus } : q)
      );
      // Refresh stats
      fetchQueries(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteQuery = async (queryId) => {
    try {
      const res = await fetch(`/api/admin/support/${queryId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.detail || 'Failed to delete query.');
      }
      // Optimistic update
      setQueries((prev) => prev.filter((q) => q.query_id !== queryId));
      fetchQueries(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExportLogs = () => {
    if (queries.length === 0) {
      alert("No queries to export.");
      return;
    }
    
    // Create CSV content
    const headers = ["Query ID", "Full Name", "Email", "Subject", "Message", "Date/Time", "Status"];
    const rows = queries.map(q => {
      const { date, time } = formatDateTime(q.created_at);
      return [
        q.query_id || "",
        `"${(q.full_name || "").replace(/"/g, '""')}"`,
        `"${(q.email || "").replace(/"/g, '""')}"`,
        `"${(q.subject || "").replace(/"/g, '""')}"`,
        `"${(q.message || "").replace(/"/g, '""')}"`,
        `"${date} ${time}"`,
        q.status || ""
      ].join(",");
    });
    
    const csvContent = [headers.join(","), ...rows].join("\n");
    
    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "support_logs.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredQueries = queries.filter((q) => {
    const matchesFilter = statusFilter === 'All' || q.status === statusFilter;
    const matchesSearch = !searchTerm ||
      (q.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedAndFilteredQueries = [...filteredQueries].sort((a, b) => {
    // Both 1_to_n and n_to_1 assume ascending / descending logic based on ID or creation time
    // We'll use the query_id (CQXXXX) since it increments linearly
    if (sortBy === '1_to_n') {
      return (a.query_id || '').localeCompare(b.query_id || '', undefined, { numeric: true, sensitivity: 'base' });
    } else {
      return (b.query_id || '').localeCompare(a.query_id || '', undefined, { numeric: true, sensitivity: 'base' });
    }
  });

  const totalPages = Math.ceil(sortedAndFilteredQueries.length / QUERIES_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (safeCurrentPage - 1) * QUERIES_PER_PAGE;
  const paginatedQueries = sortedAndFilteredQueries.slice(startIndex, startIndex + QUERIES_PER_PAGE);

  return (
    <div className="flex min-h-screen bg-[#F8F9FB]">

      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 w-72 h-screen flex flex-col bg-[#191C1E] z-50"
        style={{
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Brand */}
        <div className="px-8 py-10">
          <span className="font-body font-bold text-lg leading-7 tracking-[1.8px] uppercase text-white">
            Admin Console
          </span>
          <p className="font-body text-[10px] leading-[15px] tracking-[2px] uppercase text-[#64748B] mt-1">
            System Oversight
          </p>
        </div>

        <nav className="flex-1 mt-4">
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-4 w-full px-8 py-4 transition-all duration-200 text-[#64748B] hover:bg-[#0D1C32] hover:text-white"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#64748B' }}>group</span>
                <span className="font-body text-sm tracking-[0.35px]">User Management</span>
              </Link>
            </li>
            {/* Admin Management */}
            {currentAdmin?.role === 'super_admin' && (
              <li>
                <Link
                  to="/admin/management"
                  className="flex items-center gap-4 w-full px-8 py-4 transition-all duration-200 text-[#64748B] hover:bg-[#0D1C32] hover:text-white"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748B' }}>manage_accounts</span>
                  <span className="font-body text-sm tracking-[0.35px]">Admin Management</span>
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/admin/cases"
                className="flex items-center gap-4 w-full px-8 py-4 transition-all duration-200 text-[#64748B] hover:bg-[#0D1C32] hover:text-white"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748B' }}>gavel</span>
                <span className="font-body text-sm tracking-[0.35px]">Cases</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/support"
                className="flex items-center gap-4 w-full px-8 py-4 transition-all duration-200 bg-[#0D1C32] text-[#E9C176] font-bold translate-x-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#E9C176' }}>contact_support</span>
                <span className="font-body text-sm tracking-[0.35px]">Support</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-8 relative">
          {showProfileMenu && (
            <div 
              className="absolute bottom-24 left-8 right-8 bg-[#191C1E] rounded-xl p-2 flex flex-col gap-1 border border-white/10 shadow-2xl animate-fade-in"
              style={{
                boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.3), 0px 4px 6px -4px rgba(0, 0, 0, 0.3)',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  navigate('/admin/settings');
                  setShowProfileMenu(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-body text-[#94A3B8] hover:bg-white/5 hover:text-white transition-all text-left"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
                Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('currentAdmin');
                  navigate('/admin-login');
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-body text-[#BA1A1A] hover:bg-[#BA1A1A]/10 transition-all text-left"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Logout
              </button>
            </div>
          )}

          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="bg-white/5 p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E9C176] flex items-center justify-center flex-shrink-0">
              <span className="font-body font-bold text-base leading-6 text-[#261900]">
                {getInitials(currentAdmin?.name || 'Admin')}
              </span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-body text-xs leading-4 text-white truncate max-w-[120px]">
                {currentAdmin?.name || 'Admin'}
              </span>
              <span className="font-body text-[10px] leading-[15px] text-[#94A3B8]">
                {currentAdmin?.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
              </span>
            </div>
            <span className={`material-symbols-outlined text-[#64748B] transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} style={{ fontSize: '16px' }}>
              keyboard_arrow_up
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 flex flex-col min-h-screen p-12" style={{ gap: '48px' }}>

        {/* Header Section */}
        <header className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            <h1 className="font-headline font-bold text-[48px] leading-[48px] tracking-[-1.2px] text-[#191C1E]">
              User Support
            </h1>
            <p className="font-body text-lg leading-7 text-[#44474D] max-w-[672px]">
              Manage incoming communications and client inquiries through the central sovereign terminal.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Logout Button */}
            <button
              onClick={() => {
                localStorage.removeItem('currentAdmin');
                navigate('/admin-login');
              }}
              className="bg-[#0D1C32] text-white font-body font-medium text-xs leading-4 tracking-[1.2px] uppercase px-8 py-3 rounded-lg hover:opacity-90 transition-opacity text-center flex items-center justify-center h-[42px]"
            >
              Logout
            </button>

            {/* Export Logs Button */}
            <button
              onClick={handleExportLogs}
              className="bg-[#0D1C32] text-white font-body font-medium text-xs leading-4 tracking-[1.2px] uppercase px-8 py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity h-[42px]"
            >
              <span className="material-symbols-outlined text-white" style={{ fontSize: '14px' }}>archive</span>
              Export Logs
            </button>
          </div>
        </header>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-4 gap-0">
          {/* Total Queries */}
          <div className="bg-[#F3F4F6] p-8 flex flex-col justify-between" style={{ borderLeft: '4px solid #E9C176', minHeight: '140px' }}>
            <span className="font-body font-bold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">Total Queries</span>
            <h3 className="font-headline text-4xl leading-10 text-[#191C1E] mt-2">{loading ? '...' : stats.total}</h3>
            <span className="font-body text-xs leading-4 text-[#44474D] mt-2">all time inquiries</span>
          </div>

          {/* Resolved */}
          <div className="bg-white p-8 flex flex-col justify-between" style={{ borderLeft: '1px solid #EDEEF0', minHeight: '140px' }}>
            <span className="font-body font-bold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">Resolved</span>
            <h3 className="font-headline text-4xl leading-10 text-[#065F46] mt-2">{loading ? '...' : stats.resolved}</h3>
            <span className="font-body text-xs leading-4 text-[#44474D] mt-2">solved queries</span>
          </div>

          {/* Pending */}
          <div className="bg-white p-8 flex flex-col justify-between" style={{ borderLeft: '1px solid #EDEEF0', minHeight: '140px' }}>
            <span className="font-body font-bold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">Pending</span>
            <h3 className="font-headline text-4xl leading-10 text-[#92400E] mt-2">{loading ? '...' : stats.pending}</h3>
            <span className="font-body text-xs leading-4 text-[#44474D] mt-2">awaiting review</span>
          </div>

          {/* Urgent */}
          <div className="bg-white p-8 flex flex-col justify-between" style={{ borderLeft: '1px solid #EDEEF0', minHeight: '140px' }}>
            <span className="font-body font-bold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">Urgent</span>
            <h3 className="font-headline text-4xl leading-10 text-[#93000A] mt-2">{loading ? '...' : stats.urgent}</h3>
            <div className="flex items-center gap-1 mt-2">
              {stats.urgent > 0 && <span className="material-symbols-outlined text-[#BA1A1A]" style={{ fontSize: '14px' }}>priority_high</span>}
              <span className="font-body text-xs leading-4 text-[#44474D]">requires attention</span>
            </div>
          </div>
        </div>

        {/* Messages Table Container */}
        <div className="bg-white flex flex-col">
          {/* Table Header */}
          <div
            className="px-6 py-6 flex justify-between items-center"
            style={{
              background: 'rgba(237, 238, 240, 0.3)',
              borderBottom: '1px solid #EDEEF0',
            }}
          >
            <h2 className="font-headline font-bold text-xl leading-7 text-[#191C1E]">
              Communication Queue
            </h2>
            <div className="flex items-center gap-4">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white text-sm leading-[17px] text-[#191C1E] font-body rounded-lg px-4 py-2 outline-none cursor-pointer transition-all"
                style={{ border: '1px solid rgba(197, 198, 205, 0.3)' }}
              >
                <option value="All">All Statuses</option>
                <option value="Urgent">Urgent</option>
                <option value="Pending">Pending</option>
                <option value="Solved">Solved</option>
              </select>

              {/* Sort Splitter Dropdown */}
              <div className="relative flex items-center gap-2 bg-white px-3 py-2 rounded-lg" style={{ border: '1px solid rgba(197, 198, 205, 0.3)' }}>
                <span className="material-symbols-outlined text-[#75777E]" style={{ fontSize: '16px' }}>sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-sm text-[#6B7280] font-body outline-none cursor-pointer pr-4"
                >
                  <option value="1_to_n">1 to n</option>
                  <option value="n_to_1">n to 1</option>
                </select>
              </div>

              {/* Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#44474D]" style={{ fontSize: '15px' }}>search</span>
                <input
                  type="text"
                  placeholder="Search inquiries..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2 bg-white text-sm leading-[17px] text-[#6B7280] font-body rounded-lg w-64 outline-none transition-all placeholder:text-[#6B7280]"
                  style={{ border: '1px solid rgba(197, 198, 205, 0.2)' }}
                />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F3F4F6]">
                  <th className="px-6 py-4 font-body font-semibold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">Query ID</th>
                  <th className="px-6 py-4 font-body font-semibold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">Full Name</th>
                  <th className="px-6 py-4 font-body font-semibold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">Email</th>
                  <th className="px-6 py-4 font-body font-semibold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">Subject</th>
                  <th className="px-6 py-4 font-body font-semibold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">Message</th>
                  <th className="px-6 py-4 font-body font-semibold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">Date / Time</th>
                  <th className="px-6 py-4 font-body font-semibold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">Status</th>
                  <th className="px-6 py-4 font-body font-semibold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center font-body text-sm text-[#44474D]">Loading support queries...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center font-body text-sm text-red-600">{error}</td>
                  </tr>
                ) : filteredQueries.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center font-body text-sm text-[#44474D]">
                      {statusFilter !== 'All' ? `No ${statusFilter.toLowerCase()} queries found.` : 'No support queries yet.'}
                    </td>
                  </tr>
                ) : (
                  paginatedQueries.map((q, index) => {
                    const { date, time } = formatDateTime(q.created_at);
                    return (
                      <tr
                        key={q.query_id || index}
                        className="group hover:bg-[#F3F4F6]/50 transition-colors"
                        style={{
                          borderTop: index > 0 ? '1px solid rgba(237, 238, 240, 0.5)' : 'none',
                        }}
                      >
                        {/* Query ID */}
                        <td className="px-6 py-5">
                          <span className="font-mono text-sm font-semibold text-[#0D1C32]">{q.query_id || 'N/A'}</span>
                        </td>

                        {/* Full Name */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#E7E8EA] flex items-center justify-center flex-shrink-0">
                              <span className="font-body text-sm leading-[17px] text-[#76849F]">{getInitials(q.full_name)}</span>
                            </div>
                            <span className="font-body text-sm leading-5 text-[#191C1E]">{q.full_name}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-5">
                          <span className="font-body text-xs leading-4 text-[#44474D]">{q.email}</span>
                        </td>

                        {/* Subject */}
                        <td className="px-6 py-5">
                          <span className="font-body text-sm leading-5 text-[#191C1E]">{q.subject}</span>
                        </td>

                        {/* Message */}
                        <td className="px-6 py-5 max-w-[220px]">
                          <span className="font-body text-xs leading-4 text-[#44474D] line-clamp-2">{q.message}</span>
                        </td>

                        {/* Date / Time */}
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-body text-xs leading-4 text-[#44474D]">{date}</span>
                            <span className="font-body text-[10px] leading-3 uppercase text-[#44474D]/70 mt-1">{time}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <select
                            value={q.status}
                            onChange={(e) => handleStatusChange(q.query_id, e.target.value)}
                            className={`appearance-none cursor-pointer px-2.5 py-1 rounded-[2px] font-body font-bold text-[10px] leading-3 uppercase border-0 outline-none transition-all ${getStatusStyle(q.status)}`}
                            style={{ backgroundImage: 'none' }}
                          >
                            <option value="Urgent">Urgent</option>
                            <option value="Pending">Pending</option>
                            <option value="Solved">Solved</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() => setDeleteQueryId(q.query_id)}
                            className="p-2 text-[#75777E] hover:text-[#BA1A1A] transition-colors"
                            title="Delete Query"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer (Pagination) */}
          <div
            className="px-6 py-6 flex justify-between items-center bg-white"
            style={{ borderTop: '1px solid #EDEEF0' }}
          >
            <button
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="flex items-center gap-1 px-4 py-2 font-body font-bold text-xs leading-4 text-[#75777E] hover:text-[#0D1C32] disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_left</span>
              Previous
            </button>

            <span className="font-body text-xs leading-4 text-[#44474D]">
              Showing {paginatedQueries.length} of {filteredQueries.length} entries
              {statusFilter !== 'All' && ` (filtered: ${statusFilter})`}
            </span>

            <button
              disabled={safeCurrentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="flex items-center gap-1 px-4 py-2 font-body font-bold text-xs leading-4 text-[#75777E] hover:text-[#0D1C32] disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Next
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-row justify-between items-center px-10 max-w-[1280px]">
          <span className="font-body text-sm leading-5 text-[#0D1C32]">Verdict AI</span>
          <div className="flex items-center gap-8">
            <a className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
              Terms of Service
            </a>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteQueryId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl relative border border-gray-100 flex flex-col items-center gap-6 text-center">
            <span className="material-symbols-outlined text-[#BA1A1A] bg-[#FFDAD6] p-4 rounded-full" style={{ fontSize: '32px' }}>delete_forever</span>
            <div className="flex flex-col gap-2">
              <h2 className="font-headline font-semibold text-xl text-[#0D1C32]">Delete Query?</h2>
              <p className="font-body text-sm text-gray-500">
                Are you sure to delete the query <span className="font-semibold text-[#191C1E]">{deleteQueryId}</span>?
              </p>
            </div>
            <div className="flex justify-center gap-4 w-full mt-2">
              <button
                onClick={() => setDeleteQueryId(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all font-medium text-gray-600 text-sm"
              >
                No
              </button>
              <button
                onClick={() => {
                  handleDeleteQuery(deleteQueryId);
                  setDeleteQueryId(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#BA1A1A] text-white hover:opacity-90 transition-opacity font-medium text-sm"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default AdminSupportPage;
