import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminCasesPage = () => {
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

  const fileInputRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
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

  const [stats, setStats] = useState({ total_documents: 0, by_status: {} });
  const [activeJobId, setActiveJobId] = useState(null);
  const [activeJobStatus, setActiveJobStatus] = useState(null);
  const abortControllerRef = useRef(null);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const getStageStatus = (stageId) => {
    if (!activeJobStatus) return 'pending';
    const status = activeJobStatus.status;

    // Each stage maps 1:1 to a backend status in order:
    // Stage 1 (5%)   → verifying
    // Stage 2 (10%)  → uploaded
    // Stage 3 (40%)  → extracting
    // Stage 4 (55%)  → extracted
    // Stage 5 (90%)  → parsing
    // Stage 6 (100%) → parsed
    const statusSequence = ['verifying', 'uploaded', 'extracting', 'extracted', 'parsing', 'parsed'];
    const effectiveStatus = activeJobId === 'verifying' ? 'verifying' : status;
    const currentIdx = statusSequence.indexOf(effectiveStatus);
    const stageIdx = stageId - 1; // convert 1-indexed stage to 0-indexed

    // Handle failure states
    if (status === 'extraction_failed') {
      if (stageIdx < 2) return 'completed';  // stages before extracting are done
      if (stageIdx === 2) return 'failed';   // extracting stage failed
      return 'pending';                       // later stages never started
    }
    if (status === 'parse_failed') {
      if (stageIdx < 4) return 'completed';  // stages before parsing are done
      if (stageIdx === 4) return 'failed';   // parsing stage failed
      return 'pending';                       // later stages never started
    }

    if (currentIdx < 0) return 'pending';
    if (currentIdx > stageIdx) return 'completed';
    if (currentIdx === stageIdx) return stageIdx === 5 ? 'completed' : 'active';
    return 'pending';
  };

  // Stage range mapping: each backend status fills a percentage range
  const stageRanges = {
    verifying: { start: 0, end: 5 },
    uploaded: { start: 5, end: 10 },
    extracting: { start: 10, end: 40 },
    extracted: { start: 40, end: 55 },
    parsing: { start: 55, end: 90 },
    parsed: { start: 90, end: 100 },
    extraction_failed: { start: 10, end: 40 },
    parse_failed: { start: 55, end: 90 },
  };

  useEffect(() => {
    if (!activeJobStatus) {
      setAnimatedProgress(0);
      return;
    }

    const effectiveStatus = activeJobId === 'verifying' ? 'verifying' : activeJobStatus.status;
    const range = stageRanges[effectiveStatus];
    if (!range) return;

    // Terminal states: jump straight to target
    if (effectiveStatus === 'parsed') {
      setAnimatedProgress(100);
      return;
    }
    if (effectiveStatus === 'extraction_failed' || effectiveStatus === 'parse_failed') {
      setAnimatedProgress(range.end);
      return;
    }

    // Set initial value to the start of this range
    setAnimatedProgress(range.start);

    // Animate toward end of range with ease-out (never quite reaching the ceiling)
    const ceiling = range.end - 1;
    let current = range.start;

    const interval = setInterval(() => {
      const remaining = ceiling - current;
      if (remaining <= 0.1) {
        clearInterval(interval);
        return;
      }
      // Move ~8% of remaining distance each tick → fast start, slow finish
      current += Math.max(0.1, remaining * 0.08);
      setAnimatedProgress(Math.round(current));
    }, 200);

    return () => clearInterval(interval);
  }, [activeJobId, activeJobStatus?.status]);

  const handleCancelIngestion = async () => {
    if (!activeJobId) return;

    if (activeJobId === 'verifying') {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    } else {
      try {
        await fetch(`/api/admin/jobs/${activeJobId}`, { method: 'DELETE' });
      } catch (err) {
        console.error("Error cancelling job:", err);
      }
    }

    setActiveJobId(null);
    setActiveJobStatus(null);
    setUploading(false);
    fetchRecentJobs(false);
  };

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
      setStats({
        total_documents: data?.total_documents || 0,
        by_status: data?.by_status || {},
      });
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

  useEffect(() => {
    if (!activeJobId || activeJobId === 'verifying') return;

    const terminalStates = ['parsed', 'parse_failed', 'extraction_failed'];
    if (activeJobStatus && terminalStates.includes(activeJobStatus.status)) {
      return;
    }

    let isSubscribed = true;
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/jobs/${activeJobId}`);
        if (res.ok) {
          const data = await res.json();
          if (isSubscribed) {
            setActiveJobStatus(data);
            if (terminalStates.includes(data.status)) {
              clearInterval(pollInterval);
              fetchRecentJobs(false);
            }
          }
        } else {
          if (res.status === 404) {
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.error("Error polling job status:", err);
      }
    }, 2000);

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };
  }, [activeJobId, activeJobStatus?.status]);

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
      setActiveJobId('verifying');
      setActiveJobStatus({
        status: 'verifying',
        filename: selectedFile.name,
      });

      const formData = new FormData();
      formData.append('file', selectedFile);

      abortControllerRef.current = new AbortController();
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
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
      setActiveJobId(data.job_id);
      setActiveJobStatus(data);
      fetchRecentJobs(false);
      if (showAllModal) fetchAllJobs();
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      setUploadError(error.message || 'Upload failed.');
      setActiveJobId(null);
      setActiveJobStatus(null);
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
                className="flex items-center gap-4 w-full px-8 py-4 transition-all duration-200 bg-[#0D1C32] text-[#E9C176] font-bold translate-x-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#E9C176' }}>gavel</span>
                <span className="font-body text-sm tracking-[0.35px]">Cases</span>
              </Link>
            </li>
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
            <button
              onClick={() => {
                localStorage.removeItem('currentAdmin');
                navigate('/admin-login');
              }}
              className="bg-[#0D1C32] text-white font-body font-medium text-xs leading-4 tracking-[1.2px] uppercase px-8 py-3 rounded-lg hover:opacity-90 transition-opacity text-center flex items-center justify-center h-[42px]"
            >
              Logout
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

        {/* Stats Section (Bento Grid) */}
        <section className="px-10 py-6 grid grid-cols-2 gap-8">
          {/* Total Ingested Documents Card */}
          <div className="bg-white p-8 rounded-lg relative overflow-hidden" style={{ boxShadow: '0px 0px 0px 1px rgba(197, 198, 205, 0.15)' }}>
            <div className="flex justify-between items-start mb-4">
              <span className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#75777E]">Total Ingested</span>
              <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '22px' }}>description</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-normal text-[48px] leading-[48px] text-[#0D1C32]">
                {recentLoading ? '...' : stats.total_documents}
              </span>
              <div className="flex items-center gap-1 mt-2 pt-2">
                <span className="font-body text-xs leading-4 text-[#44474D]">ingested documents</span>
              </div>
            </div>
          </div>

          {/* Failed Ingestions Card */}
          <div className="bg-white p-8 rounded-lg relative overflow-hidden" style={{ boxShadow: '0px 0px 0px 1px rgba(197, 198, 205, 0.15)' }}>
            <div className="flex justify-between items-start mb-4">
              <span className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#75777E]">Failed</span>
              <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '22px' }}>warning</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-normal text-[48px] leading-[48px] text-[#0D1C32]">
                {recentLoading ? '...' : (stats.by_status?.failed || 0)}
              </span>
              <div className="flex items-center gap-1 mt-2 pt-2">
                <span className="font-body text-xs leading-4 text-[#44474D]">failed processing attempts</span>
              </div>
            </div>
          </div>
        </section>

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
                  <p className="font-body text-lg text-[#0D1C32]">
                    Upload complete: <strong>{uploadResult.filename}</strong>
                  </p>
                  <p className="font-body text-sm text-[#44474D] mt-1">PDF ID: {uploadResult.pdf_id} | Type: {uploadResult.detected_type}</p>
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
                          <span className="font-body font-bold text-base leading-6 text-[#0D1C32]">{job.filename || 'Unnamed PDF'}</span>
                          <span className="font-body text-xs leading-[18px] text-[#44474D]">
                            {`${(job.status || 'uploaded').toUpperCase()} | Ref: ${job.job_id || 'N/A'}`}
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
            <div className="bg-[#0D1C32] p-8 relative overflow-hidden rounded-xl text-white" style={{ boxShadow: '0px 0px 0px 1px rgba(197, 198, 205, 0.15)' }}>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#E9C176] rounded-full animate-pulse"></span>
                    <span className="w-1.5 h-1.5 bg-[#E9C176] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#E9C176] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                  <span className="font-body font-bold text-[10px] leading-[15px] tracking-[2px] uppercase text-[#E9C176]">AI Sovereign Engine</span>
                </div>
                {activeJobId && (
                  <button
                    onClick={handleCancelIngestion}
                    className="text-xs bg-[#BA1A1A]/20 hover:bg-[#BA1A1A]/40 text-[#FFDAD6] px-3 py-1 rounded transition-colors font-body uppercase font-bold tracking-[1px]"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {activeJobStatus ? (
                <>
                  <h4 className="font-headline text-xl leading-7 text-white mb-2 relative z-10" style={{ paddingTop: '8px' }}>
                    {activeJobStatus.status === 'parsed' ? 'Ingestion Complete' :
                      (activeJobStatus.status === 'extraction_failed' || activeJobStatus.status === 'parse_failed') ? 'Ingestion Failed' :
                        'Ingesting Case...'}
                  </h4>
                  <p className="font-body text-xs leading-5 text-[#94A3B8] mb-6 relative z-10 truncate">
                    {activeJobStatus.filename || 'Processing document'}
                  </p>

                  {/* Stage List */}
                  <div className="flex flex-col gap-4 relative z-10 mb-6">
                    {[
                      { id: 1, label: 'Verifying judgment document', status: getStageStatus(1) },
                      { id: 2, label: 'Document type detection', status: getStageStatus(2) },
                      { id: 3, label: 'OCR or scanned text extraction', status: getStageStatus(3) },
                      { id: 4, label: 'Parsing document sections', status: getStageStatus(4) },
                      { id: 5, label: 'Generating headings & summaries', status: getStageStatus(5) },
                      { id: 6, label: 'Creating hierarchical tree structure', status: getStageStatus(6) },
                    ].map((stage) => (
                      <div key={stage.id} className="flex items-center gap-3">
                        <span className="material-symbols-outlined" style={{
                          fontSize: '18px',
                          color: stage.status === 'completed' ? '#22C55E' :
                            stage.status === 'active' ? '#E9C176' :
                              stage.status === 'failed' ? '#BA1A1A' : '#64748B'
                        }}>
                          {stage.status === 'completed' ? 'task_alt' :
                            stage.status === 'active' ? 'sync' :
                              stage.status === 'failed' ? 'cancel' : 'radio_button_unchecked'}
                        </span>
                        <span className={`font-body text-xs ${stage.status === 'completed' ? 'text-white' :
                            stage.status === 'active' ? 'text-[#E9C176] font-semibold animate-pulse' :
                              stage.status === 'failed' ? 'text-[#FFDAD6]' : 'text-[#64748B]'
                          }`}>
                          {stage.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-body font-bold text-[10px] leading-[15px] uppercase text-[#64748B]">Progress</span>
                      <span className="font-body font-bold text-[10px] leading-[15px] uppercase text-[#64748B]">
                        {animatedProgress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                      <div
                        className={`h-full rounded-full transition-all duration-200 ${(activeJobStatus.status === 'extraction_failed' || activeJobStatus.status === 'parse_failed')
                            ? 'bg-[#BA1A1A]'
                            : 'bg-[#E9C176]'
                          }`}
                        style={{ width: `${animatedProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="font-headline text-xl leading-7 text-white mb-2 relative z-10" style={{ paddingTop: '16px' }}>Sovereign Parser Idle</h4>
                  <p className="font-body text-xs leading-5 text-[#94A3B8] relative z-10">
                    Ready for Ingestion. No active processing queues. Upload a judgment document on the left to begin high-fidelity semantic parsing and entity extraction.
                  </p>
                </>
              )}

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
                          {`${(job.status || 'uploaded').toUpperCase()} | Ref: ${job.job_id || 'N/A'}`}
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
