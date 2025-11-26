'use client'
import { useState } from "react"
import { Search, Sparkles, Users, BookOpen } from "lucide-react"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setHasSearched(true)
    try {
      const res = await fetch("https://faculty-project-fastapi.onrender.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "query": query, "top_k": 50 })
      })
      const data = await res.json()
      if (data.results) setResults(data.results)
      else setResults([])
      setLoading(false)
    } catch (err) {
      console.error(err)
      setResults([])
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header - 10% */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <span className="text-xl font-semibold text-slate-800">ProfMatch</span>
          </div>
        </div>
      </header>

      {/* Hero Section - 60% dominant color (slate-50 background) */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="max-w-3xl w-full text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-4 leading-tight">
            Find Your Perfect<br />
            <span className="text-indigo-600">Research Match</span>
          </h1>
          <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
            Connect with professors who share your academic passions. 
            Discover mentors aligned with your research interests in seconds.
          </p>
          {/* Search Box - 30% secondary color (white) */}
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-3 mb-8 max-w-2xl mx-auto border border-slate-100">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400 ml-3" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., machine learning, quantum physics, medieval literature..."
                className="flex-1 py-3 px-2 text-slate-700 placeholder-slate-400 focus:outline-none text-base"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-indigo-600 text-white font-medium px-8 py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {/* Feature Pills */}
          {!results.length && (
            <div className="flex flex-wrap gap-3 justify-center text-sm">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-600">400+ Professors</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-600">50+ Disciplines</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-600">AI-Powered Matching</span>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="w-full max-w-3xl animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">
                Top {results.length} {results.length === 1 ? 'match' : 'matches'}
              </h2>
              <button 
                onClick={() => setResults([])}
                className="text-sm text-slate-600 hover:text-indigo-600 transition"
              >
                Clear results
              </button>
            </div>
            <div className="space-y-4">
              {results.map((r, idx) => (
                <a
                  key={idx}
                  href={r['Personal Website']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white p-6 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 group cursor-pointer"
                >
                  {/* Header */}
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
                        {r.Similarity !== undefined && (
                          <span className="text-slate-500">
                            {Math.round(parseFloat(r.Similarity) * 100)}% match
                          </span>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    {r.Interest && (
                      <div className="flex items-start gap-3">
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                            Research Interests
                          </p>
                          <p className="text-slate-700 leading-relaxed">
                            {r.Interest}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-slate-500 mb-2">No professors found matching your interests.</p>
            <p className="text-sm text-slate-400">Try refining your search or using different keywords.</p>
          </div>
        )}
      </main>

      {/* Footer - subtle */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-center text-sm text-slate-500">
        <p>Connecting inspiring students with professors.</p>
      </footer>
    </div>
  )
}