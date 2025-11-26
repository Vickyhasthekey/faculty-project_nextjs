import { Sparkles } from "lucide-react"
import SearchBox from './SearchBox'
import FeaturePills from './FeaturePills'

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header - Server Rendered */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ProfMatch
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section - Server Rendered */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16 pt-8">
        <div className="max-w-4xl w-full text-center mb-12">          
          <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
            Find Your Perfect<br />
            <span className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Research Match
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Connect with professors who share your academic passions. 
            Discover mentors aligned with your research interests in seconds.
          </p>
          
          {/* Client Component - Search Box and Results */}
          <SearchBox />
          
          {/* Server Component - Feature Pills */}
          <FeaturePills />
        </div>
      </main>

      {/* Footer - Server Rendered */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/60 py-8 px-6 text-center">
        <p className="text-slate-600 font-medium">Connecting inspiring students with exceptional professors.</p>
      </footer>
    </div>
  )
}