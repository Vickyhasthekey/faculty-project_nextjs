import { Sparkles } from "lucide-react"
import SearchBox from './components/SearchBox'
import FeaturePills from './components/FeaturePills'

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header - Server Rendered */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <span className="text-xl font-semibold text-slate-800">ProfMatch</span>
          </div>
        </div>
      </header>

      {/* Hero Section - Server Rendered */}
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
          
          {/* Client Component - Search Box and Results */}
          <SearchBox />
          
          {/* Server Component - Feature Pills */}
          <FeaturePills />
        </div>
      </main>

      {/* Footer - Server Rendered */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-center text-sm text-slate-500">
        <p>Connecting inspiring students with professors.</p>
      </footer>
    </div>
  )
}
