'use client'

interface Result {
  Professor: string
  University: string
  Department: string
  Interest?: string
  Similarity?: string
  'Personal Website': string
}

interface ResultsListProps {
  results: Result[]
  onClear: () => void
}

export default function ResultsList({ results, onClear }: ResultsListProps) {
  return (
    <div className="w-full max-w-4xl animate-in fade-in duration-700 slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-2xl font-bold text-slate-800">
          <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Top {results.length}
          </span> {results.length === 1 ? 'match' : 'matches'}
        </h2>
        <button 
          onClick={onClear}
          className="text-sm text-slate-600 hover:text-indigo-600 transition font-medium px-4 py-2 hover:bg-white/60 rounded-lg"
        >
          Clear results
        </button>
      </div>
      <div className="space-y-5">
        {results.map((r, idx) => (
          <a
            key={idx}
            href={r['Personal Website']}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white/90 backdrop-blur-sm p-7 rounded-2xl border border-slate-200/60 hover:border-indigo-300/80 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 group cursor-pointer hover:scale-[1.01]"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5 pb-5 border-b border-slate-100">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-slate-900 mb-3 group-hover:bg-linear-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                  {r.Professor}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-linear-to-r from-indigo-50 to-purple-50 text-indigo-700 font-semibold border border-indigo-200/50">
                    {r.University}
                  </span>
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-linear-to-r from-purple-50 to-pink-50 text-purple-700 font-semibold border border-purple-200/50">
                    {r.Department}
                  </span>
                  {r.Similarity !== undefined && (
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-green-50 text-green-700 font-semibold border border-green-200/50">
                      {Math.round(parseFloat(r.Similarity) * 100)}% match
                    </span>
                  )}
                </div>
              </div>
              <svg className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>

            {/* Content */}
            <div className="space-y-3">
              {r.Interest && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Research Interests
                  </p>
                  <p className="text-slate-700 leading-relaxed text-base">
                    {r.Interest}
                  </p>
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}