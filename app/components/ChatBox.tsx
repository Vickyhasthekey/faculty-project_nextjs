'use client'
import { useState, useRef, useEffect, type ReactNode } from "react"
import { MessageCircle, Send, X } from "lucide-react"

type FacultyCard = {
  Professor: string
  University: string
  Department: string
  Interest?: string
  Interests?: string[]
  "Personal Website"?: string
}

type Message = { role: "user" | "assistant"; content: string; hits?: FacultyCard[] }

const STARTERS = ["Who works on medical imaging?", "Compare two robotics professors"]

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g)
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`
    const bold = part.match(/^\*\*([^*]+)\*\*$/)
    if (bold) return <strong key={key}>{bold[1]}</strong>
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/)
    if (!link) return <span key={key}>{part}</span>
    return (
      <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer" className="underline">
        {link[1]}
      </a>
    )
  })
}

function renderAssistant(text: string) {
  const blocks: ReactNode[] = []
  let items: string[] = []

  const flushList = () => {
    if (items.length === 0) return
    const list = items
    items = []
    blocks.push(
      <ul key={`list-${blocks.length}`} className="list-disc space-y-2 pl-4">
        {list.map((item, index) => (
          <li key={index}>{renderInline(item, `item-${blocks.length}-${index}`)}</li>
        ))}
      </ul>,
    )
  }

  for (const line of text.split("\n")) {
    const item = line.match(/^\s*[-*]\s+(.*)$/)
    if (item) {
      items.push(item[1])
      continue
    }
    flushList()
    if (!line.trim()) continue
    blocks.push(
      <p key={`p-${blocks.length}`} className="mb-2 last:mb-0">
        {renderInline(line, `p-${blocks.length}`)}
      </p>,
    )
  }
  flushList()
  return blocks
}

export default function ChatBox() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const handleSend = async (preset?: string) => {
    const text = (preset ?? input).trim()
    if (!text || loading) return

    const history = messages
    const priorHits = history.flatMap((message) => message.hits ?? [])
    const nextMessages: Message[] = [...messages, { role: "user", content: text }, { role: "assistant", content: "" }]
    setMessages(nextMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, priorHits }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => ({ error: `Chat failed (${res.status})` }))
        throw new Error(payload.error || "Chat failed")
      }

      if (!res.body) throw new Error("No response body")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const parts = buffer.split("\n\n")
        buffer = parts.pop() ?? ""

        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith("data:")) continue
          const payload = line.slice(5).trim()
          if (payload === "[DONE]") continue
          try {
            const obj = JSON.parse(payload)
            if (Array.isArray(obj.hits)) {
              setMessages((prev) => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = { ...last, hits: obj.hits }
                }
                return updated
              })
            } else if (obj.delta) {
              setMessages((prev) => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = { ...last, content: last.content + obj.delta }
                }
                return updated
              })
            } else if (obj.error) {
              setMessages((prev) => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last && last.role === "assistant") {
                  const note = `Error: ${obj.error}`
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content ? `${last.content}\n\n${note}` : note,
                  }
                }
                return updated
              })
            }
          } catch {
            // ignore malformed line
          }
        }
      }
    } catch (err) {
      console.error(err)
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last && last.role === "assistant" && last.content === "") {
          updated[updated.length - 1] = { ...last, content: err instanceof Error ? err.message : "Something went wrong." }
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[380px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl shadow-indigo-200/40 border border-slate-200/70 overflow-hidden flex flex-col origin-bottom-right animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/70 bg-linear-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white rounded-lg shadow-sm">
                <MessageCircle className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="font-semibold text-slate-800 text-sm">Find a professor</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md hover:bg-white/60 text-slate-500 hover:text-slate-800 transition"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="h-96 overflow-y-auto px-5 py-4 space-y-3 text-left">
            {messages.length === 0 && (
              <div className="py-6 space-y-3">
                <p className="text-slate-500 text-sm text-center">
                  Ask who studies a topic. Replies cite professors and link to their pages.
                </p>
                <div className="flex flex-col gap-2">
                  {STARTERS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="text-left text-sm px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] space-y-2 ${m.role === "user" ? "" : "w-full"}`}>
                <div
                  className={`px-4 py-2 rounded-2xl text-sm ${
                    m.role === "user"
                      ? "whitespace-pre-wrap bg-linear-to-r from-indigo-600 to-purple-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {m.content ? (m.role === "assistant" ? renderAssistant(m.content) : m.content) : (loading && i === messages.length - 1 ? (
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "120ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "240ms" }} />
                    </span>
                  ) : "")}
                </div>
                {m.role === "assistant" && m.hits && m.hits.length > 0 && (
                  <ul className="space-y-2">
                    {m.hits.map((hit) => {
                      const website = hit["Personal Website"]?.trim()
                      const interests = hit.Interests?.length ? hit.Interests : hit.Interest ? [hit.Interest] : []
                      return (
                        <li key={`${hit.Professor}-${hit.Department}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                          <p className="text-sm font-semibold text-slate-800">{hit.Professor}</p>
                          <p className="text-xs text-slate-500">{hit.University} · {hit.Department}</p>
                          {interests.length > 0 && (
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{interests.join(" · ")}</p>
                          )}
                          {website && (
                            <a
                              href={website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-block text-xs font-medium text-indigo-600 underline"
                            >
                              Website
                            </a>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-200/70 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e)}
              placeholder="Type a message..."
              disabled={loading}
              className="flex-1 py-2 px-3 text-slate-800 placeholder-slate-400 focus:outline-none text-sm bg-transparent disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold p-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  )
}
