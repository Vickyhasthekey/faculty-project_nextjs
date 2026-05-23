import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()


    // Deployed backend
    const upstream = await fetch("https://faculty-project-fastapi.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    // // Local backend
    // const upstream = await fetch("http://localhost:8000/chat", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(body),
    // })


  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}
