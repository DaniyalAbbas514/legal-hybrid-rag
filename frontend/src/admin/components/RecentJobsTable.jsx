import React from 'react';
import AdminPagination from './AdminPagination';

const RecentJobsTable = ({
  recentLoading,
  recentError,
  allJobs = [],
  filteredJobs = [],
  paginatedJobs = [],
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  totalPages,
  formatRelativeTime,
  setShowAllModal,
  setDeleteTarget,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Header with Search & View All History Modal Trigger */}
      <div className="p-8 pb-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-headline font-bold text-xl text-[#0D1C32]">Case Ingestion History</h3>
          <p className="font-body text-xs text-gray-500 mt-1">Manage, search, and navigate through uploaded judgment PDF files.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Search Input Box */}
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75777E]" style={{ fontSize: '16px' }}>
              search
            </span>
            <input
              type="text"
              placeholder="Search case by title or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-[#F3F4F6] text-xs font-body text-[#191C1E] rounded-lg outline-none focus:ring-1 focus:ring-[#E9C176]"
            />
          </div>

          {/* View All History Trigger Button */}
          <button
            onClick={() => setShowAllModal(true)}
            className="text-xs font-bold text-[#0D1C32] hover:text-[#E9C176] transition-colors flex items-center gap-1 flex-shrink-0"
          >
            View All History
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </button>
        </div>
      </div>

      {recentError && (
        <div className="mx-8 mt-4 bg-red-50 text-red-700 p-4 rounded-xl text-xs font-body">
          ⚠️ {recentError}
        </div>
      )}

      {/* Counter Banner */}
      <div className="px-8 py-3 bg-[#F8F9FB] border-b border-gray-100 flex justify-between items-center text-xs font-body text-[#75777E]">
        <span>
          Showing {paginatedJobs.length} of {filteredJobs.length} judgment cases
        </span>
        {searchTerm && (
          <span className="text-[#0D1C32] font-semibold">
            Filtered from {allJobs.length} total uploads
          </span>
        )}
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 font-body text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
              <th className="py-4 px-8">Filename / Judgment Title</th>
              <th className="py-4 px-6">Job ID</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Uploaded</th>
              <th className="py-4 px-8 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="font-body text-sm divide-y divide-gray-50">
            {recentLoading ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-gray-400">
                  Loading ingestion activity...
                </td>
              </tr>
            ) : filteredJobs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-gray-400">
                  {searchTerm ? 'No cases match your search query.' : 'No ingestion jobs recorded.'}
                </td>
              </tr>
            ) : (
              paginatedJobs.map((job) => (
                <tr key={job.job_id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-4 px-8 font-medium text-[#0D1C32]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0D1C32]/5 text-[#0D1C32] flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-base">description</span>
                      </div>
                      <span className="truncate max-w-sm font-semibold">{job.filename || 'Unnamed document'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-gray-500">{job.job_id}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        job.status === 'parsed' || job.status === 'complete'
                          ? 'bg-green-100 text-green-800'
                          : job.status?.includes('failed')
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          job.status === 'parsed' || job.status === 'complete'
                            ? 'bg-green-500'
                            : job.status?.includes('failed')
                            ? 'bg-red-500'
                            : 'bg-amber-500 animate-pulse'
                        }`}
                      ></span>
                      {job.status === 'complete' ? 'parsed' : job.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-400 text-xs">{formatRelativeTime(job.created_at)}</td>
                  <td className="py-4 px-8 text-right">
                    <button
                      onClick={() => setDeleteTarget(job)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      title="Delete Record"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls Footer */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default RecentJobsTable;
