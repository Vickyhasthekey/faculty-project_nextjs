import { Users, BookOpen, Sparkles } from "lucide-react"
import { FACULTY_ROWS } from "@/lib/faculty-data"

export default function FeaturePills() {
  const professors = new Set(FACULTY_ROWS.map((row) => row.Professor)).size
  const disciplines = new Set(FACULTY_ROWS.map((row) => row.Department)).size

  return (
    <div className="flex flex-wrap gap-3 justify-center text-sm">
      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200">
        <Users className="w-4 h-4 text-indigo-600" />
        <span className="text-slate-600">{professors} Professors</span>
      </div>
      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200">
        <BookOpen className="w-4 h-4 text-indigo-600" />
        <span className="text-slate-600">{disciplines} Disciplines</span>
      </div>
      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200">
        <Sparkles className="w-4 h-4 text-indigo-600" />
        <span className="text-slate-600">AI-Powered Matching</span>
      </div>
    </div>
  )
}
