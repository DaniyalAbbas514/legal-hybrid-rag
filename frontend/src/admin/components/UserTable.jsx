import React from 'react';

const UserTable = ({
  loading,
  users,
  sortedAndFilteredUsers,
  paginatedUsers,
  filterQuery,
  setFilterQuery,
  sortBy,
  setSortBy,
  setCurrentPage,
  handlePlanChange,
  handleEditClick,
  handleDeleteClick,
  getInitials,
}) => {
  return (
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
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75777E]"
              style={{ fontSize: '14px' }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="Filter users..."
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
          <div
            className="relative flex items-center gap-2 bg-white px-3 py-2 rounded-lg"
            style={{ boxShadow: '0px 0px 0px 1px rgba(197, 198, 205, 0.2)' }}
          >
            <span className="material-symbols-outlined text-[#75777E]" style={{ fontSize: '16px' }}>
              sort
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-sm text-[#6B7280] font-body outline-none cursor-pointer pr-4"
            >
              <option value="id_asc">ID: 1 to n</option>
              <option value="id_desc">ID: n to 1</option>
              <option value="name_asc">User: A to Z</option>
              <option value="name_desc">User: Z to A</option>
            </select>
          </div>
        </div>

        <span className="font-body font-medium text-xs leading-4 text-[#44474D]">
          Showing {sortedAndFilteredUsers.length} of {users.length} users
        </span>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white" style={{ borderBottom: '1px solid rgba(197, 198, 205, 0.1)' }}>
              <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E]">
                User ID
              </th>
              <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E]">
                Username
              </th>
              <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E]">
                Email
              </th>
              <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E]">
                Organization
              </th>
              <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E]">
                Plan
              </th>
              <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E]">
                Phone No
              </th>
              <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-8 py-10 text-center font-body text-sm text-[#75777E]">
                  Loading registered users...
                </td>
              </tr>
            ) : sortedAndFilteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-8 py-10 text-center font-body text-sm text-[#75777E]">
                  No users found.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user, index) => (
                <tr
                  key={user.id || index}
                  className="group hover:bg-[#F3F4F6] transition-colors"
                  style={{ borderTop: index > 0 ? '1px solid rgba(197, 198, 205, 0.05)' : 'none' }}
                >
                  <td className="px-8 py-6">
                    <span className="font-mono text-sm font-semibold text-[#0D1C32]">{user.id}</span>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0D1C32] text-white flex items-center justify-center font-bold text-xs ring-1 ring-transparent group-hover:ring-[#E9C176] transition-all flex-shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline font-bold text-sm leading-5 text-[#0D1C32]">{user.name}</span>
                        <span className="font-body text-xs text-gray-500">@{user.username}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <span className="font-body text-sm text-[#44474D]">{user.email}</span>
                  </td>

                  <td className="px-8 py-6">
                    <span className="font-body font-medium text-sm leading-5 text-[#0D1C32]">{user.org}</span>
                  </td>

                  <td className="px-8 py-6">
                    <select
                      value={user.plan}
                      onChange={(e) => handlePlanChange(user.id, e.target.value)}
                      className={`appearance-none cursor-pointer px-3 py-1 font-body font-bold text-[10px] leading-3 tracking-[1px] uppercase rounded-full outline-none border-0 transition-all ${
                        user.plan === 'Pro' ? 'bg-[#FFDEA5] text-[#261900]' : 'bg-[#E7E8EA] text-[#44474D]'
                      }`}
                      style={{ backgroundImage: 'none' }}
                    >
                      <option value="Standard">STANDARD</option>
                      <option value="Pro">PRO</option>
                    </select>
                  </td>

                  <td className="px-8 py-6">
                    <span className="font-body text-sm text-[#44474D]">{user.phone_no || 'N/A'}</span>
                  </td>

                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="p-2 text-[#75777E] hover:text-[#0D1C32] transition-colors"
                        title="Edit User"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          edit_note
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="p-2 text-[#75777E] hover:text-[#BA1A1A] transition-colors"
                        title="Delete User"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
