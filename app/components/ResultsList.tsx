'use client'

interface Result {
  Professor: string
  University: string
  Department: string
  Interest?: string
  Interests?: string[]
  Similarity?: number | string
  'Personal Website': string
}

interface ResultsListProps {
  results: Result[]
  onClear: () => void
}

function matchPercent(similarity: number | string | undefined): string | null {
  if (similarity === undefined) return null
  const value = typeof similarity === "number" ? similarity : parseFloat(similarity)
  if (Number.isNaN(value)) return null
  return `${Math.round(value * 100)}% match`
}

export default function ResultsList({ results, onClear }: ResultsListProps) {
  return (
    <div className="w-full max-w-3xl animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800">
          Top {results.length} {results.length === 1 ? 'match' : 'matches'}
        </h2>
        <button 
          onClick={onClear}
          className="text-sm text-slate-600 hover:text-indigo-600 transition"
        >
          Clear results
        </button>
      </div>
      <div className="space-y-4">
        {results.map((r, idx) => {
          const interests = r.Interests?.length ? r.Interests : r.Interest ? [r.Interest] : []
          const website = r['Personal Website'] || undefined
          return (
          <a
            key={`${r.Professor}-${idx}`}
            href={website || undefined}
            target={website ? "_blank" : undefined}
            rel={website ? "noopener noreferrer" : undefined}
            className="block bg-white p-6 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition">
                  {r.Professor}
                </h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                    {r.University}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                    {r.Department}
                  </span>
                  {matchPercent(r.Similarity) && (
                    <span className="text-slate-500">
                      {matchPercent(r.Similarity)}
                    </span>
                  )}
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>

            {interests.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                      Research Interests
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      {interests.join(" · ")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </a>
          )
        })}
      </div>
    </div>
  )
}
