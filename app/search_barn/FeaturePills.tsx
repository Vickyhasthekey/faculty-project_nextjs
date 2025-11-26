import { Users, BookOpen, Bot } from "lucide-react"

export default function FeaturePills() {
  return (
    <div className="flex flex-wrap gap-4 justify-center text-sm">
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-3 rounded-full border border-indigo-200/50 shadow-sm hover:shadow-md hover:border-indigo-300/50 transition-all">
        <Users className="w-4 h-4 text-indigo-600" />
        <span className="text-slate-700 font-medium">400+ Professors</span>
      </div>
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-3 rounded-full border border-purple-200/50 shadow-sm hover:shadow-md hover:border-purple-300/50 transition-all">
        <BookOpen className="w-4 h-4 text-purple-600" />
        <span className="text-slate-700 font-medium">50+ Disciplines</span>
      </div>
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-3 rounded-full border border-pink-200/50 shadow-sm hover:shadow-md hover:border-pink-300/50 transition-all">
        <Bot className="w-4 h-4 text-pink-600" />
        <span className="text-slate-700 font-medium">AI-Powered Research Matching</span>
      </div>
    </div>
  )
}