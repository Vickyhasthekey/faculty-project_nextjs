export type FetchBackendOptions = {
  fetch?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  retries?: number
  retryDelayMs?: number
}

export const DEFAULT_BACKEND_URL = "https://faculty-project-fastapi.onrender.com"

export function getBackendUrl(): string {
  return (process.env.FACULTY_API_URL ?? DEFAULT_BACKEND_URL).replace(/\/$/, "")
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchBackend(
  path: string,
  init: RequestInit = {},
  options: FetchBackendOptions = {},
): Promise<Response> {
  const fetchFn = options.fetch ?? fetch
  const sleep = options.sleep ?? defaultSleep
  const retries = options.retries ?? 6
  const retryDelayMs = options.retryDelayMs ?? 5000
  const url = `${getBackendUrl()}${path.startsWith("/") ? path : `/${path}`}`

  let last: Response | undefined
  for (let attempt = 0; attempt < retries; attempt++) {
    last = await fetchFn(url, init)
    if (last.status !== 503) {
      return last
    }
    if (attempt < retries - 1) {
      await sleep(retryDelayMs)
    }
  }
  return last as Response
}
