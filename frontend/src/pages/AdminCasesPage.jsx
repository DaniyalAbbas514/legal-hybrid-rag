import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const AdminCasesPage = () => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState('');
  const [allJobs, setAllJobs] = useState([]);
  const [allJobsLoading, setAllJobsLoading] = useState(false);
  const [allJobsError, setAllJobsError] = useState('');
  const [showAllModal, setShowAllModal] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const safeReadJson = async (response) => {
    const raw = await response.text();
    try {
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {
        detail: "Backend returned non-JSON response. Check FastAPI server and Vite proxy target.",
      };
    }
  };

  const formatRelativeTime = (dateValue) => {
    if (!dateValue) return 'Unknown time';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Unknown time';

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const fetchRecentJobs = async (showLoader = false) => {
    if (showLoader) setRecentLoading(true);
    setRecentError('');

    try {
      const response = await fetch('/api/admin/status');
      const data = await safeReadJson(response);
      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to fetch recent uploads.');
      }
      setRecentJobs(Array.isArray(data?.recent_jobs) ? data.recent_jobs : []);
    } catch (error) {
      setRecentError(error.message || 'Failed to fetch recent uploads.');
    } finally {
      if (showLoader) setRecentLoading(false);
    }
  };

  const fetchAllJobs = async () => {
    setAllJobsLoading(true);
    setAllJobsError('');
    try {
      const response = await fetch('/api/admin/jobs');
      const data = await safeReadJson(response);
      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to fetch all uploads.');
      }
      setAllJobs(Array.isArray(data?.jobs) ? data.jobs : []);
    } catch (error) {
      setAllJobsError(error.message || 'Failed to fetch all uploads.');
    } finally {
      setAllJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentJobs(true);
    const intervalId = setInterval(() => {
      fetchRecentJobs(false);
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const handlePickFile = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelected = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setUploadError('');
    setUploadResult(null);

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Please select a PDF file.');
      event.target.value = '';
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const raw = await response.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        if (response.status === 0 || response.status >= 500) {
          throw new Error('Backend is unreachable. Ensure FastAPI is running and Vite proxy target is correct.');
        }
        throw new Error(data?.detail || 'Upload failed.');
      }

      setUploadResult(data);
      fetchRecentJobs(false);
      if (showAllModal) fetchAllJobs();
    } catch (error) {
      setUploadError(error.message || 'Upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const openAllUploadsModal = async () => {
    setShowAllModal(true);
    await fetchAllJobs();
  };

  const handleDeleteJob = async (jobId) => {
    if (!jobId || deletingJobId) return;

    setDeletingJobId(jobId);
    setUploadError('');
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, { method: 'DELETE' });
      const data = await safeReadJson(response);
      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to delete case.');
      }
      await fetchRecentJobs(false);
      if (showAllModal) await fetchAllJobs();
    } catch (error) {
      setUploadError(error.message || 'Failed to delete case.');
    } finally {
      setDeletingJobId('');
    }
  };

  const requestDeleteJob = (job) => {
    if (!job?.job_id) return;
    setDeleteTarget({ job_id: job.job_id, filename: job.filename || 'Unnamed PDF' });
  };

  const confirmDeleteJob = async () => {
    if (!deleteTarget?.job_id) return;
    await handleDeleteJob(deleteTarget.job_id);
    setDeleteTarget(null);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FB]">
      <aside
        className="fixed left-0 top-0 w-72 h-screen flex flex-col bg-[#191C1E] z-50"
        style={{
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="px-6 py-8">
          <span className="font-body text-lg leading-7 tracking-[1.8px] uppercase text-white">Admin Console</span>
          <p className="font-body text-[10px] leading-[15px] tracking-[2px] uppercase text-[#64748B] mt-1">System Oversight</p>
        </div>

        <nav className="flex-1 mt-4">
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-4 w-full px-6 py-4 transition-all duration-200 text-[#64748B] hover:bg-[#0D1C32] hover:text-white"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#64748B' }}>group</span>
                <span className="font-body font-medium text-sm tracking-[0.35px]">User Management</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/cases"
                className="flex items-center gap-4 w-full px-6 py-4 transition-all duration-200 bg-[#0D1C32] text-[#E9C176] font-bold translate-x-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#E9C176' }}>gavel</span>
                <span className="font-body font-medium text-sm tracking-[0.35px]">Cases</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/support"
                className="flex items-center gap-4 w-full px-6 py-4 transition-all duration-200 text-[#64748B] hover:bg-[#0D1C32] hover:text-white"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#64748B' }}>contact_support</span>
                <span className="font-body font-medium text-sm tracking-[0.35px]">Support</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-6">
          <div className="bg-[#0D1C32] p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E9C176] flex items-center justify-center">
              <span className="font-body font-bold text-sm leading-5 text-[#261900]">JD</span>
            </div>
            <div className="flex flex-col pl-1">
              <span className="font-body font-semibold text-sm leading-5 text-white">Chief Registrar</span>
              <span className="font-body text-[10px] leading-[15px] text-[#64748B]">Active Session</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-72 flex-1 flex flex-col min-h-screen">
        <header
          className="flex justify-between items-end w-full px-10 py-8 sticky top-0 z-40"
          style={{
            background: 'rgba(248, 249, 251, 0.8)',
            backdropFilter: 'blur(6px)',
            height: '132px',
          }}
        >
          <div className="flex flex-col gap-2">
            <h2 className="font-headline font-bold text-4xl leading-10 tracking-[-0.9px] text-[#0D1C32]">Case Management</h2>
            <p className="font-body font-medium text-sm leading-5 text-[#44474D]">Ingest and catalog judicial precedents with high-fidelity OCR.</p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="bg-[#0D1C32] text-white font-body font-medium text-xs leading-4 tracking-[1.2px] uppercase px-8 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Logout
            </Link>

            <button
              onClick={handlePickFile}
              disabled={uploading}
              className="bg-[#0D1C32] text-white font-body font-semibold text-sm leading-5 px-5 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-white" style={{ fontSize: '14px' }}>upload_file</span>
              {uploading ? 'Uploading...' : 'Upload PDF'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={handleFileSelected}
            />
          </div>
        </header>

        <div className="px-10 pb-20 grid grid-cols-12 gap-8">
          <section className="col-span-12 lg:col-span-8 flex flex-col gap-8">
            <div className="bg-white p-8 relative overflow-hidden" style={{ borderLeft: '4px solid #E9C176' }}>
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="font-headline font-bold text-2xl leading-8 text-[#0D1C32]">Judgment Document Ingestion</h3>
                  <p className="font-body text-sm leading-5 text-[#44474D]">Drag and drop the official court PDF to begin sovereign processing.</p>
                </div>
                <div className="bg-[#F3F4F6] p-3 rounded-xl flex-shrink-0">
                  <span className="material-symbols-outlined text-[#0D1C32]" style={{ fontSize: '16px' }}>description</span>
                </div>
              </div>

              <div
                onClick={handlePickFile}
                className="mt-8 flex flex-col items-center justify-center py-12 rounded-lg cursor-pointer hover:bg-[#F3F4F6] transition-colors"
                style={{ border: '2px dashed #C5C6CD' }}
              >
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(233, 193, 118, 0.2)' }}>
                  <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '28px' }}>cloud_upload</span>
                </div>
                <p className="font-body font-semibold text-base leading-6 text-[#0D1C32]">Select a PDF file</p>
                <p className="font-body text-xs leading-4 text-[#44474D] mt-1">Maximum file size: 50MB. Searchable PDFs preferred.</p>
              </div>

              {uploadError && <p className="mt-4 font-body text-sm text-red-600">{uploadError}</p>}

              {uploadResult && (
                <div className="mt-4 bg-[#F8F9FB] p-4 rounded-lg">
                  <p className="font-body text-sm text-[#0D1C32]">
                    Upload complete: <strong>{uploadResult.filename}</strong>
                  </p>
                  <p className="font-body text-xs text-[#44474D] mt-1">PDF ID: {uploadResult.pdf_id} | Type: {uploadResult.detected_type}</p>
                </div>
              )}
            </div>

            <div className="bg-[#E7E8EA] p-8">
              <h5 className="font-headline text-lg leading-7 text-[#0D1C32] mb-6">Recent Uploads</h5>

              {recentLoading ? (
                <p className="font-body text-sm text-[#44474D]">Loading recent uploads...</p>
              ) : recentError ? (
                <p className="font-body text-sm text-red-600">{recentError}</p>
              ) : recentJobs.length === 0 ? (
                <p className="font-body text-sm text-[#44474D]">No uploads yet.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {recentJobs.slice(0, 5).map((job) => (
                    <div key={job.job_id} className="flex gap-4 justify-between items-start">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-white flex-shrink-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#0D1C32]" style={{ fontSize: '14px' }}>task_alt</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-body font-bold text-xs leading-4 text-[#0D1C32]">{job.filename || 'Unnamed PDF'}</span>
                          <span className="font-body text-[10px] leading-[15px] text-[#44474D]">
                            {`${(job.status || 'uploaded').toUpperCase()} ${formatRelativeTime(job.created_at)} | Ref: ${job.job_id || 'N/A'}`}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => requestDeleteJob(job)}
                        disabled={deletingJobId === job.job_id}
                        className="text-[#B42318] text-xs font-body font-semibold hover:opacity-70 disabled:opacity-50"
                      >
                        {deletingJobId === job.job_id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={openAllUploadsModal}
                className="w-full mt-8 font-body font-bold text-[11px] leading-4 tracking-[1.1px] uppercase text-[#0D1C32] pb-1 hover:opacity-70 transition-opacity"
                style={{ borderBottom: '1px solid rgba(13, 28, 50, 0.1)' }}
              >
                Show All
              </button>
            </div>
          </section>

          <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#0D1C32] p-8 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#E9C176] rounded-full animate-pulse"></span>
                  <span className="w-1.5 h-1.5 bg-[#E9C176] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-[#E9C176] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                </div>
                <span className="font-body font-bold text-[10px] leading-[15px] tracking-[2px] uppercase text-[#E9C176]">AI Sovereign Engine</span>
              </div>

              <h4 className="font-headline text-xl leading-7 text-white mb-2 relative z-10" style={{ paddingTop: '16px' }}>Reading PDF...</h4>

              <p className="font-body text-xs leading-5 text-[#94A3B8] relative z-10">
                The Verdict is currently extracting semantic structures, legal citations, and party entities from the uploaded document.
              </p>

              <div className="mt-6 relative z-10" style={{ paddingTop: '24px' }}>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-body font-bold text-[10px] leading-[15px] uppercase text-[#64748B]">OCR Precision</span>
                  <span className="font-body font-bold text-[10px] leading-[15px] uppercase text-[#64748B]">88%</span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <div className="h-full rounded-full bg-[#E9C176] transition-all duration-1000" style={{ width: '88%' }}></div>
                </div>
              </div>

              <div className="absolute -bottom-5 -right-8 opacity-5" style={{ transform: 'rotate(12deg)' }}>
                <span className="material-symbols-outlined text-white" style={{ fontSize: '120px' }}>visibility</span>
              </div>
            </div>
          </aside>
        </div>

        <footer className="w-full py-12 border-t border-[#F1F5F9] bg-[#F8F9FB] mt-auto">
          <div className="max-w-full mx-auto flex flex-row justify-between items-center px-10">
            <span className="font-body text-sm leading-5 text-[#0D1C32]">Verdict AI</span>
            <div className="flex items-center gap-8">
              <a className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">Privacy Policy</a>
              <a className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">Terms of Service</a>
            </div>
          </div>
        </footer>
      </main>

      {showAllModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="font-headline text-xl text-[#0D1C32]">All Uploaded Judgments</h3>
              <button
                onClick={() => setShowAllModal(false)}
                className="w-9 h-9 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[#0D1C32]">close</span>
              </button>
            </div>

            <div className="px-6 py-4 overflow-y-auto max-h-[70vh]">
              {allJobsLoading ? (
                <p className="font-body text-sm text-[#44474D]">Loading all uploads...</p>
              ) : allJobsError ? (
                <p className="font-body text-sm text-red-600">{allJobsError}</p>
              ) : allJobs.length === 0 ? (
                <p className="font-body text-sm text-[#44474D]">No uploads found.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {allJobs.map((job) => (
                    <div key={job.job_id} className="border border-[#E5E7EB] rounded-lg px-4 py-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-body font-semibold text-sm text-[#0D1C32]">{job.filename || 'Unnamed PDF'}</p>
                        <p className="font-body text-xs text-[#6B7280] mt-1">
                          {`${(job.status || 'uploaded').toUpperCase()} ${formatRelativeTime(job.created_at)} | Ref: ${job.job_id || 'N/A'}`}
                        </p>
                      </div>
                      <button
                        onClick={() => requestDeleteJob(job)}
                        disabled={deletingJobId === job.job_id}
                        className="text-[#B42318] text-xs font-body font-semibold hover:opacity-70 disabled:opacity-50"
                      >
                        {deletingJobId === job.job_id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[120] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
            <h4 className="font-headline text-xl text-[#0D1C32]">Confirm Delete</h4>
            <p className="font-body text-sm text-[#44474D] mt-3">
              Are you sure to delete <strong>"{deleteTarget.filename}"</strong>?
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-[#D1D5DB] text-[#374151] font-body text-sm hover:bg-[#F9FAFB]"
              >
                No
              </button>
              <button
                onClick={confirmDeleteJob}
                disabled={deletingJobId === deleteTarget.job_id}
                className="px-4 py-2 rounded-lg bg-[#B42318] text-white font-body text-sm hover:opacity-90 disabled:opacity-50"
              >
                {deletingJobId === deleteTarget.job_id ? 'Deleting...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCasesPage;
