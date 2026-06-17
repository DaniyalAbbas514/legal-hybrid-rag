import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminSettingsPage = () => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    adminid: '',
    name: '',
    dob: '',
    password: '',
    role: ''
  });

  useEffect(() => {
    const storedAdmin = localStorage.getItem('currentAdmin');
    if (!storedAdmin) {
      navigate('/admin-login');
      return;
    }

    let parsedAdmin;
    try {
      parsedAdmin = JSON.parse(storedAdmin);
      setCurrentAdmin(parsedAdmin);
    } catch (err) {
      console.error('Error parsing admin data:', err);
      navigate('/admin-login');
      return;
    }

    // Fetch full profile details (including password and DOB)
    fetchProfile(parsedAdmin.adminid);
  }, [navigate]);

  const fetchProfile = async (adminid) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch(`/api/admin/profile?adminid=${encodeURIComponent(adminid)}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          adminid: data.adminid || '',
          name: data.name || '',
          dob: data.dob || '',
          password: data.password || '',
          role: data.role || 'admin'
        });
      } else {
        const data = await res.json();
        setErrorMsg(data?.detail || 'Failed to fetch account details.');
      }
    } catch (err) {
      console.error('Error fetching admin profile:', err);
      setErrorMsg('Failed to connect to the backend server.');
    } finally {
      setLoading(false);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // --- Frontend Validations ---

    // 1. Name Check
    if (!formData.name.trim()) {
      setErrorMsg('Name is required.');
      return;
    }

    // 2. Admin ID Check
    if (!formData.adminid.trim()) {
      setErrorMsg('Admin ID is required.');
      return;
    }

    // 3. Password Check (length >= 8, containing upper, lower, number, special char)
    const pwRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{}|;:',.<>?/`~"\\-]).{8,}$/;
    if (!pwRegex.test(formData.password)) {
      setErrorMsg('Password must be at least 8 characters long, contain a capital letter, a small letter, a number, and a special character.');
      return;
    }

    // 4. DOB Check
    const dobDate = new Date(formData.dob);
    if (isNaN(dobDate.getTime())) {
      setErrorMsg('Please select a valid Date of Birth.');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          original_adminid: currentAdmin.adminid,
          adminid: formData.adminid,
          password: formData.password,
          dob: formData.dob,
          name: formData.name
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg('Account details updated successfully!');
        
        // Update local session info
        const updatedSession = {
          adminid: data.adminid,
          name: data.name,
          role: data.role
        };
        localStorage.setItem('currentAdmin', JSON.stringify(updatedSession));
        setCurrentAdmin(updatedSession);
        
        setTimeout(() => {
          setSuccessMsg('');
        }, 3000);
      } else {
        const data = await res.json();
        setErrorMsg(data?.detail || 'An error occurred during submission.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrorMsg('Failed to communicate with the backend server.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentAdmin');
    navigate('/admin-login');
  };

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
              Account Settings
            </h1>
            <p className="font-body text-sm leading-5 text-[#44474D]">
              Manage your administrative credentials and personal details.
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Logout Button on top right */}
            <button
              onClick={handleLogout}
              className="bg-[#0D1C32] text-white font-body font-medium text-xs leading-4 tracking-[1.2px] uppercase px-8 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Settings Form Section */}
        <section className="px-12 py-10 flex-1 flex justify-center items-start">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-10 shadow-sm border border-gray-100 flex flex-col gap-6">
            <div>
              <h2 className="font-headline font-semibold text-2xl text-[#0D1C32]">
                Administrative Profile
              </h2>
              <p className="font-body text-xs text-gray-500 mt-1">
                Edit your identification, credentials and birth date. Note that role changes require system database operations.
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

            {loading ? (
              <div className="py-20 text-center font-body text-sm text-gray-500">
                Loading credential profile details...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-body text-sm">
                
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
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
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Admin ID (Email)</label>
                  <input
                    type="text"
                    required
                    value={formData.adminid}
                    onChange={(e) => setFormData({ ...formData, adminid: e.target.value })}
                    placeholder="e.g. AdminDaniyal@cust.com"
                    className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32]"
                  />
                </div>

                {/* Password with Toggle Visibility */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="At least 8 chars, 1 Upper, 1 Lower, 1 Num, 1 Spec"
                      className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32]"
                  />
                </div>

                {/* Role (Read-only) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Role (Read-Only)</label>
                  <input
                    type="text"
                    disabled
                    value={formData.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                    className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 font-semibold cursor-not-allowed outline-none"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/dashboard')}
                    className="px-6 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all font-medium text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-2.5 rounded-lg bg-[#0D1C32] text-white hover:opacity-90 disabled:opacity-50 transition-opacity font-medium"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
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
    </div>
  );
};

export default AdminSettingsPage;
