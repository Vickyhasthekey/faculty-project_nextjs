'use client'
import { useState } from "react"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await fetch("http://127.0.0.1:8000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      })
      const data = await res.json()
      if (data.results) setResults(data.results)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Search Professor with Similar Interest</h1>

      <div className="flex w-full max-w-md mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          className="flex-1 p-3 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          onClick={handleSearch}
          className="bg-indigo-500 text-white font-semibold px-6 rounded-r-md hover:bg-indigo-600 transition"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="w-full max-w-md">
        {results.length > 0 && (
          <ul className="space-y-3">
            {results.map((r, idx) => (
              <li
                key={idx}
                className="p-4 border border-gray-200 rounded-md bg-white shadow-sm hover:shadow-md transition"
              >
                {Object.entries(r).map(([k, v]) => (
                  <p key={k}>
                    <span className="font-semibold text-gray-700">{k}:</span> {String(v)}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!loading && results.length === 0 && query && (
        <p className="text-gray-500 mt-4">No results found.</p>
      )}
    </div>
  )
}
