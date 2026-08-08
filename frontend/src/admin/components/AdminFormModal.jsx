import React from 'react';

const AdminFormModal = ({
  isOpen,
  onClose,
  isEditMode,
  errorMsg,
  successMsg,
  formData,
  setFormData,
  handleSubmit,
  saving,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative border border-gray-100 flex flex-col gap-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
            close
          </span>
        </button>

        <div>
          <h2 className="font-headline font-semibold text-2xl text-[#0D1C32]">
            {isEditMode ? 'Edit Administrator' : 'Add New Administrator'}
          </h2>
          <p className="font-body text-xs text-gray-500 mt-1">
            {isEditMode
              ? 'Modify details and permissions for this administrator account.'
              : 'Create a new administrative account with specific system role permissions.'}
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
              placeholder="e.g. Eleanor Vance"
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32]"
            />
          </div>

          {/* Admin ID / Email */}
          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Admin ID (Email Address)
            </label>
            <input
              type="text"
              required
              disabled={isEditMode}
              value={formData.adminid}
              onChange={(e) => setFormData({ ...formData, adminid: e.target.value, email: e.target.value })}
              placeholder="e.g. AdminEleanor@cust.com"
              className={`px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32] ${
                isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>

          {/* System Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32] bg-white cursor-pointer"
            >
              <option value="admin">Administrator</option>
              <option value="super_admin">Super Administrator</option>
            </select>
          </div>

          {/* DOB */}
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

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32]"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32]"
            />
          </div>

          {/* Modal Actions */}
          <div className="col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-[#0D1C32] text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminFormModal;
