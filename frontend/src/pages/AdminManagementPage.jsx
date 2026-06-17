import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ADMINS_PER_PAGE = 5;

const AdminManagementPage = () => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState({ total: 0, super_admins: 0, standard_admins: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Search, Sort, Pagination
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState('id_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteAdminId, setDeleteAdminId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form
  const [formData, setFormData] = useState({
    adminid: '',
    name: '',
    email: '',
    role: 'admin',
    dob: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedAdmin = localStorage.getItem('currentAdmin');
    if (!storedAdmin) {
      navigate('/admin-login');
      return;
    }

    try {
      const parsedAdmin = JSON.parse(storedAdmin);
      if (parsedAdmin.role !== 'super_admin') {
        navigate('/admin/dashboard');
        return;
      }
      setCurrentAdmin(parsedAdmin);
    } catch (err) {
      console.error('Error parsing admin data:', err);
      navigate('/admin-login');
      return;
    }

    fetchAdmins();
  }, [navigate]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch('/api/admin/admins');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
        setStats({
          total: data.total || 0,
          super_admins: data.super_admins || 0,
          standard_admins: data.standard_admins || 0
        });
      } else {
        const data = await res.json();
        setErrorMsg(data?.detail || 'Failed to load system administrators.');
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
      setErrorMsg('Failed to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAddClick = () => {
    setIsEditMode(false);
    setErrorMsg('');
    setSuccessMsg('');
    setFormData({
      adminid: '',
      name: '',
      email: '',
      role: 'admin',
      dob: '',
      password: '',
      confirmPassword: ''
    });
    setModalOpen(true);
  };

  const handleEditClick = (admin) => {
    setIsEditMode(true);
    setErrorMsg('');
    setSuccessMsg('');
    setFormData({
      adminid: admin.adminid || '',
      name: admin.name || '',
      email: admin.email || '',
      role: admin.role || 'admin',
      dob: admin.dob || '',
      password: admin.password || '',
      confirmPassword: admin.password || ''
    });
    setModalOpen(true);
  };

  const handleDeleteClick = (admin) => {
    if (admin.adminid === currentAdmin?.adminid) {
      // Rejection alert / disabled state handles this, but safety check:
      alert("You cannot delete your own logged-in administrator account.");
      return;
    }
    setDeleteAdminId(admin.adminid);
  };

  const confirmDeleteAdmin = async () => {
    if (!deleteAdminId) return;
    try {
      const res = await fetch(`/api/admin/admins/${encodeURIComponent(deleteAdminId)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchAdmins();
      } else {
        const err = await res.json();
        alert(`Error deleting admin: ${err.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Failed to connect to the backend server.');
    } finally {
      setDeleteAdminId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // --- Frontend Validations ---

    // 1. Check required fields
    if (!formData.adminid.trim() || !formData.name.trim() || !formData.email.trim() || !formData.dob || !formData.password) {
      setErrorMsg('All fields are required.');
      return;
    }

    // 2. Email domain check (contains @)
    if (!formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // 3. Password Check: length >= 8, uppercase, lowercase, number, special character
    const pwRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{}|;:',.<>?/`~"\\-]).{8,}$/;
    if (!pwRegex.test(formData.password)) {
      setErrorMsg('Password must be at least 8 characters long, contain a capital letter, a small letter, a number, and a special character.');
      return;
    }

    // 4. Confirm Password Match (only check on add admin)
    if (!isEditMode && formData.password !== formData.confirmPassword) {
      setErrorMsg('Password and Confirm Password do not match.');
      return;
    }

    // 5. DOB check (validate format and make sure it is a valid date)
    const dobDate = new Date(formData.dob);
    if (isNaN(dobDate.getTime())) {
      setErrorMsg('Please select a valid Date of Birth.');
      return;
    }

    try {
      setSaving(true);
      const url = isEditMode ? `/api/admin/admins/${encodeURIComponent(formData.adminid)}` : '/api/admin/admins';
      const method = isEditMode ? 'PUT' : 'POST';

      const payload = {
        adminid: formData.adminid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        dob: formData.dob,
        password: formData.password
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg(isEditMode ? 'Admin profile updated successfully!' : 'Admin created successfully!');
        
        // If the logged-in admin updated their own details, update localStorage session
        if (isEditMode && formData.adminid === currentAdmin?.adminid) {
          const updatedSession = {
            adminid: formData.adminid,
            name: formData.name,
            role: formData.role
          };
          localStorage.setItem('currentAdmin', JSON.stringify(updatedSession));
          setCurrentAdmin(updatedSession);
        }

        setTimeout(() => {
          setModalOpen(false);
          fetchAdmins();
        }, 1000);
      } else {
        const err = await res.json();
        setErrorMsg(err.detail || 'An error occurred during submission.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMsg('Failed to communicate with the backend server.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentAdmin');
    navigate('/admin-login');
  };

  // Sort and filter admins client-side
  const sortedAndFilteredAdmins = React.useMemo(() => {
    const query = filterQuery.toLowerCase().trim();
    const filtered = admins.filter((a) => {
      return (
        (a.name || '').toLowerCase().includes(query) ||
        (a.email || '').toLowerCase().includes(query) ||
        (a.adminid || '').toLowerCase().includes(query) ||
        (a.role || '').toLowerCase().includes(query) ||
        (a.dob || '').toLowerCase().includes(query)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'id_asc') {
        return (a.adminid || '').localeCompare(b.adminid || '', undefined, { numeric: true, sensitivity: 'base' });
      } else if (sortBy === 'id_desc') {
        return (b.adminid || '').localeCompare(a.adminid || '', undefined, { numeric: true, sensitivity: 'base' });
      } else if (sortBy === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'name_desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      return 0;
    });
  }, [admins, filterQuery, sortBy]);

  const totalPages = Math.ceil(sortedAndFilteredAdmins.length / ADMINS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (safeCurrentPage - 1) * ADMINS_PER_PAGE;
  const paginatedAdmins = sortedAndFilteredAdmins.slice(startIndex, startIndex + ADMINS_PER_PAGE);

  return (
    <div className="flex min-h-screen bg-[#F8F9FB]">
      {/* Sidebar - SideNavBar */}
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

        {/* Navigation */}
        <nav className="flex-1 mt-4">
          <ul className="flex flex-col gap-1">
            {/* User Management */}
            <li>
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-4 w-full px-8 py-4 transition-all duration-200 text-[#64748B] hover:bg-[#0D1C32] hover:text-white"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#64748B' }}>group</span>
                <span className="font-body text-sm tracking-[0.35px]">User Management</span>
              </Link>
            </li>
            {/* Admin Management (Active) */}
            <li>
              <Link
                to="/admin/management"
                className="flex items-center gap-4 w-full px-8 py-4 transition-all duration-200 bg-[#0D1C32] text-[#E9C176] font-bold translate-x-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#E9C176' }}>manage_accounts</span>
                <span className="font-body text-sm tracking-[0.35px]">Admin Management</span>
              </Link>
            </li>
            {/* Cases */}
            <li>
              <Link
                to="/admin/cases"
                className="flex items-center gap-4 w-full px-8 py-4 transition-all duration-200 text-[#64748B] hover:bg-[#0D1C32] hover:text-white"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748B' }}>gavel</span>
                <span className="font-body text-sm tracking-[0.35px]">Cases</span>
              </Link>
            </li>
            {/* Support */}
            <li>
              <Link
                to="/admin/support"
                className="flex items-center gap-4 w-full px-8 py-4 transition-all duration-200 text-[#64748B] hover:bg-[#0D1C32] hover:text-white"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#64748B' }}>contact_support</span>
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
                onClick={handleLogout}
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

      {/* Main Content Canvas */}
      <main className="ml-72 flex-1 flex flex-col min-h-screen">
        {/* TopNavBar Header */}
        <header className="flex justify-between items-center w-full px-12 py-8 bg-[#F8F9FB] sticky top-0 z-40 h-[128px]">
          <div className="flex flex-col gap-1">
            <h1 className="font-headline font-semibold text-4xl leading-10 tracking-[-0.9px] text-[#0D1C32]">
              Admin Management
            </h1>
            <p className="font-body text-sm leading-5 text-[#44474D]">
              Orchestrate system administrators, roles and permissions.
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Add Admin Button */}
            <button
              onClick={handleAddClick}
              className="bg-[#0D1C32] text-white font-body font-medium text-xs leading-4 tracking-[1.2px] uppercase px-8 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Add Admin
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-[#0D1C32] text-white font-body font-medium text-xs leading-4 tracking-[1.2px] uppercase px-8 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Logout
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <span className="material-symbols-outlined text-[#75777E] cursor-pointer hover:text-[#0D1C32] transition-colors" style={{ fontSize: '20px' }}>notifications</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#BA1A1A] rounded-full"></span>
            </div>
          </div>
        </header>

        {/* Stats Section (Bento Grid) */}
        <section className="px-12 py-6 grid grid-cols-3 gap-8">
          {/* Total Admins Card */}
          <div className="bg-white p-8 rounded-lg relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#75777E]">Total Admin</span>
              <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '22px' }}>manage_accounts</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-normal text-[48px] leading-[48px] text-[#0D1C32]">
                {loading ? '...' : stats.total}
              </span>
              <div className="flex items-center gap-1 mt-2 pt-2">
                <span className="font-body text-xs leading-4 text-[#44474D]">registered operators</span>
              </div>
            </div>
          </div>

          {/* Super Admins Card */}
          <div className="bg-white p-8 rounded-lg relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#75777E]">Super Admin</span>
              <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '18px' }}>workspace_premium</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-normal text-[48px] leading-[48px] text-[#0D1C32]">
                {loading ? '...' : stats.super_admins}
              </span>
              <div className="flex items-center gap-1 mt-2 pt-2">
                <span className="font-body text-xs leading-4 text-[#44474D]">full access roles</span>
              </div>
            </div>
          </div>

          {/* Standard Admins Card */}
          <div className="bg-white p-8 rounded-lg relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#75777E]">Standard Admin</span>
              <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '17px' }}>grade</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-normal text-[48px] leading-[48px] text-[#0D1C32]">
                {loading ? '...' : stats.standard_admins}
              </span>
              <div className="flex items-center gap-1 mt-2 pt-2">
                <span className="font-body text-xs leading-4 text-[#44474D]">limited control roles</span>
              </div>
            </div>
          </div>
        </section>

        {/* Admins Table Section */}
        <section className="px-12 py-10 flex-1">
          <div
            className="bg-white overflow-hidden flex flex-col"
            style={{ boxShadow: '0px 0px 0px 1px rgba(197, 198, 205, 0.15)' }}
          >
            {/* Table Header Controls */}
            <div
              className="px-8 py-6 flex justify-between items-center"
              style={{ background: 'rgba(243, 244, 246, 0.5)' }}
            >
              <div className="flex gap-4 items-center">
                {/* Search Input */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75777E]" style={{ fontSize: '14px' }}>search</span>
                  <input
                    type="text"
                    placeholder="Filter admins..."
                    value={filterQuery}
                    onChange={(e) => {
                      setFilterQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 pr-4 py-2 bg-white text-sm leading-[17px] text-[#6B7280] font-body rounded-lg w-64 outline-none transition-all placeholder:text-[#6B7280]"
                    style={{ boxShadow: '0px 0px 0px 1px rgba(197, 198, 205, 0.2)' }}
                  />
                </div>

                {/* Sort Splitter Dropdown */}
                <div className="relative flex items-center gap-2 bg-white px-3 py-2 rounded-lg" style={{ boxShadow: '0px 0px 0px 1px rgba(197, 198, 205, 0.2)' }}>
                  <span className="material-symbols-outlined text-[#75777E]" style={{ fontSize: '16px' }}>sort</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-sm text-[#6B7280] font-body outline-none cursor-pointer pr-4"
                  >
                    <option value="id_asc">ID: A to Z</option>
                    <option value="id_desc">ID: Z to A</option>
                    <option value="name_asc">Admin: A to Z</option>
                    <option value="name_desc">Admin: Z to A</option>
                  </select>
                </div>
              </div>

              <span className="font-body font-medium text-xs leading-4 text-[#44474D]">
                Showing {sortedAndFilteredAdmins.length} of {admins.length} admins
              </span>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white" style={{ borderBottom: '1px solid rgba(197, 198, 205, 0.1)' }}>
                    <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E]">Admin ID</th>
                    <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E]">Admin Name</th>
                    <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E]">Email</th>
                    <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E]">Password</th>
                    <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E]">DOB</th>
                    <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E]">Role</th>
                    <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-8 py-10 text-center font-body text-sm text-[#75777E]">
                        Loading registered administrators...
                      </td>
                    </tr>
                  ) : sortedAndFilteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-8 py-10 text-center font-body text-sm text-[#75777E]">
                        No administrators found.
                      </td>
                    </tr>
                  ) : (
                    paginatedAdmins.map((admin, index) => (
                      <tr
                        key={admin.adminid || index}
                        className="group hover:bg-[#F3F4F6] transition-colors"
                        style={{ borderTop: index > 0 ? '1px solid rgba(197, 198, 205, 0.05)' : 'none' }}
                      >
                        {/* Admin ID */}
                        <td className="px-8 py-6">
                          <span className="font-mono text-xs font-semibold text-[#0D1C32]">{admin.adminid}</span>
                        </td>

                        {/* Admin Name */}
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#0D1C32] text-white flex items-center justify-center font-bold text-xs ring-1 ring-transparent group-hover:ring-[#E9C176] transition-all flex-shrink-0">
                              {getInitials(admin.name)}
                            </div>
                            <span className="font-headline font-bold text-sm leading-5 text-[#0D1C32]">{admin.name}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-8 py-6">
                          <span className="font-body text-sm text-[#44474D]">{admin.email || admin.adminid}</span>
                        </td>

                        {/* Password with Hover/Toggle visibility */}
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-[#44474D]">
                              {visiblePasswords[admin.adminid] ? admin.password : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setVisiblePasswords(prev => ({
                                  ...prev,
                                  [admin.adminid]: !prev[admin.adminid]
                                }));
                              }}
                              className="text-gray-400 hover:text-[#0D1C32] transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {visiblePasswords[admin.adminid] ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                          </div>
                        </td>

                        {/* DOB */}
                        <td className="px-8 py-6">
                          <span className="font-body text-sm text-[#44474D]">{admin.dob || 'N/A'}</span>
                        </td>

                        {/* Role */}
                        <td className="px-8 py-6">
                          <span
                            className={`px-3 py-1 font-body font-bold text-[10px] leading-3 tracking-[1px] uppercase rounded-full ${
                              admin.role === 'super_admin' ? 'bg-[#FFDEA5] text-[#261900]' : 'bg-[#E7E8EA] text-[#44474D]'
                            }`}
                          >
                            {admin.role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleEditClick(admin)}
                              className="p-2 text-[#75777E] hover:text-[#0D1C32] transition-colors"
                              title="Edit Admin"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_note</span>
                            </button>
                            
                            {/* Deleting own active account is disabled */}
                            <button
                              onClick={() => handleDeleteClick(admin)}
                              disabled={admin.adminid === currentAdmin?.adminid}
                              className={`p-2 transition-colors ${
                                admin.adminid === currentAdmin?.adminid 
                                  ? 'text-gray-200 cursor-not-allowed' 
                                  : 'text-[#75777E] hover:text-[#BA1A1A]'
                              }`}
                              title={admin.adminid === currentAdmin?.adminid ? 'Cannot delete logged in account' : 'Delete Admin'}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div
              className="px-8 py-6 flex justify-between items-center"
              style={{
                background: 'rgba(243, 244, 246, 0.2)',
                borderTop: '1px solid rgba(197, 198, 205, 0.1)',
              }}
            >
              <button
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="flex items-center gap-1 px-4 py-2 font-body font-bold text-xs leading-4 text-[#75777E] hover:text-[#0D1C32] disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_left</span>
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 flex items-center justify-center font-body font-bold text-xs rounded-[2px] transition-all ${
                      safeCurrentPage === p
                        ? 'bg-[#0D1C32] text-white'
                        : 'bg-transparent text-[#75777E] hover:bg-gray-100 hover:text-[#0D1C32]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

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
        </section>

        {/* Footer */}
        <footer className="w-full py-12 border-t border-[#F1F5F9] bg-[#F8F9FB] mt-auto">
          <div className="max-w-full mx-auto flex flex-row justify-between items-center px-8">
            <span className="font-body text-sm leading-5 text-[#0D1C32]">Verdict AI</span>
            <div className="flex items-center gap-8">
              <a className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
                Privacy Policy
              </a>
              <a className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
                Terms of Service
              </a>
              <a className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
                Legal Disclaimer
              </a>
            </div>
          </div>
        </footer>
      </main>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative border border-gray-100 flex flex-col gap-6">
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
            </button>

            <div>
              <h2 className="font-headline font-semibold text-2xl text-[#0D1C32]">
                {isEditMode ? 'Edit Administrator Details' : 'Add New Administrator'}
              </h2>
              <p className="font-body text-xs text-gray-500 mt-1">
                {isEditMode ? 'Modify administrative credentials and system permissions.' : 'Create a new administrative profile with secure credentials.'}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-body border border-red-100">
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl text-xs font-body border border-green-100">
                ✅ {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 font-body text-sm">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Marcus Sterling"
                  className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32]"
                />
              </div>

              {/* Admin ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Admin ID (Username/Key)</label>
                <input
                  type="text"
                  required
                  disabled={isEditMode}
                  value={formData.adminid}
                  onChange={(e) => setFormData({ ...formData, adminid: e.target.value })}
                  placeholder="e.g. AdminDaniyal@cust.com"
                  className={`px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32] ${isEditMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. admin@cust.com"
                  className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32]"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Password</label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 8 chars, 1 Upper, 1 Lower, 1 Num, 1 Spec"
                  className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32]"
                />
              </div>

              {/* Confirm Password (only on Add Mode) */}
              {!isEditMode ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Confirm Password</label>
                  <input
                    type="text"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32]"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {/* System Role (Editable in modal) */}
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">System Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32] bg-white"
                  >
                    <option value="admin">Administrator</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>
              )}

              {/* System Role Selection for ADD Mode */}
              {!isEditMode && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">System Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32] bg-white"
                  >
                    <option value="admin">Administrator</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>
              )}

              {/* Date of Birth */}
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32]"
                />
              </div>

              {/* Form Buttons */}
              <div className="col-span-2 flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all font-medium text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-2.5 rounded-lg bg-[#0D1C32] text-white hover:opacity-90 transition-opacity font-medium"
                >
                  {saving ? 'Submitting...' : isEditMode ? 'Save Changes' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Center of the screen) */}
      {deleteAdminId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl relative border border-gray-100 flex flex-col items-center gap-6 text-center">
            <span className="material-symbols-outlined text-[#BA1A1A] bg-[#FFDAD6] p-4 rounded-full" style={{ fontSize: '32px' }}>delete_forever</span>
            <div className="flex flex-col gap-2">
              <h2 className="font-headline font-semibold text-xl text-[#0D1C32]">Delete Admin?</h2>
              <p className="font-body text-sm text-gray-500">
                Are you sure to delete the admin <span className="font-semibold text-[#191C1E]">{deleteAdminId}</span>?
              </p>
            </div>
            <div className="flex justify-center gap-4 w-full mt-2">
              <button
                onClick={() => setDeleteAdminId(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all font-medium text-gray-600 text-sm"
              >
                No
              </button>
              <button
                onClick={confirmDeleteAdmin}
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

export default AdminManagementPage;
