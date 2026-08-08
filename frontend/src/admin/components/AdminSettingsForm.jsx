import React from 'react';

const AdminSettingsForm = ({
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  loading,
  saving,
  errorMsg,
  successMsg,
  handleSubmit,
  getInitials,
}) => {
  return (
    <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 flex flex-col gap-8">
      {/* Header Profile Identity */}
      <div className="flex items-center gap-6 pb-8 border-b border-gray-100">
        <div className="w-20 h-20 rounded-2xl bg-[#0D1C32] text-[#E9C176] flex items-center justify-center font-bold text-2xl shadow-inner">
          {getInitials(formData.name)}
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="font-headline font-bold text-2xl text-[#0D1C32]">
            {loading ? 'Loading Profile...' : formData.name}
          </h2>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-gray-500">{formData.adminid}</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFDEA5] text-[#261900]">
              {formData.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
            </span>
          </div>
        </div>
      </div>

      {/* Error / Success Notifications */}
      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-body border border-red-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600">error</span>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-xs font-body border border-green-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-green-600">check_circle</span>
          {successMsg}
        </div>
      )}

      {/* Profile Edit Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-body text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Administrator Name"
              className="px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32]"
            />
          </div>

          {/* Admin ID */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Admin ID (System Identifier)
            </label>
            <input
              type="text"
              required
              value={formData.adminid}
              onChange={(e) => setFormData({ ...formData, adminid: e.target.value })}
              placeholder="Admin ID Email"
              className="px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32]"
            />
          </div>

          {/* Date of Birth */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Date of Birth
            </label>
            <input
              type="date"
              required
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32]"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Password
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E9C176] focus:ring-2 focus:ring-[#E9C176]/20 outline-none transition-all text-[#0D1C32] pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving || loading}
            className="bg-[#0D1C32] text-white px-8 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? 'Updating Credentials...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsForm;
