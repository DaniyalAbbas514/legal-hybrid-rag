import React from 'react';

const IngestionProgress = ({
  activeJobId,
  activeJobStatus,
  animatedProgress,
  getStageStatus,
  handleCancelIngestion,
}) => {
  if (!activeJobId) return null;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-headline font-bold text-xl text-[#0D1C32]">Document Ingestion Progress</h3>
          <p className="font-body text-xs text-gray-500 mt-1">
            Job ID: <span className="font-mono text-[#0D1C32]">{activeJobId}</span>
          </p>
        </div>
        <button
          onClick={handleCancelIngestion}
          className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
        >
          Cancel Job
        </button>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
        <div
          className="bg-[#E9C176] h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${animatedProgress}%` }}
        ></div>
      </div>

      {/* Multi-stage Checklist */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 font-body text-xs">
        {[
          { id: 1, label: 'Verifying' },
          { id: 2, label: 'Uploaded' },
          { id: 3, label: 'Extracting' },
          { id: 4, label: 'Extracted' },
          { id: 5, label: 'Parsing' },
          { id: 6, label: 'Parsed' },
        ].map((stage) => {
          const status = getStageStatus(stage.id);
          return (
            <div
              key={stage.id}
              className={`p-3 rounded-xl flex flex-col items-center gap-2 text-center transition-all ${
                status === 'completed'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : status === 'active'
                  ? 'bg-amber-50 text-amber-800 border border-amber-300 font-bold'
                  : status === 'failed'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-gray-50 text-gray-400'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {status === 'completed'
                  ? 'check_circle'
                  : status === 'active'
                  ? 'sync'
                  : status === 'failed'
                  ? 'error'
                  : 'hourglass_empty'}
              </span>
              <span>{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IngestionProgress;
