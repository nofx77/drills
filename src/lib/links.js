export function safeUrl(raw) {
  const text = (raw ?? '').trim()
  if (!text) return null
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`
  try {
    const url = new URL(candidate)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    if (!url.hostname.includes('.')) return null
    return url.href
  } catch {
    return null
  }
}

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'])
const VIDEO_ID = /^[\w-]{11}$/

function seconds(t) {
  if (!t) return 0
  if (/^\d+$/.test(t)) return Number(t)
  const [, h = 0, m = 0, s = 0] = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/) ?? []
  return Number(h) * 3600 + Number(m) * 60 + Number(s)
}

export function youtubeEmbed(raw) {
  const href = safeUrl(raw)
  if (!href) return null
  const url = new URL(href)
  if (!YOUTUBE_HOSTS.has(url.hostname)) return null
  const [first, second] = url.pathname.split('/').filter(Boolean)
  const id = url.hostname === 'youtu.be' ? first : first === 'watch' ? url.searchParams.get('v') : ['shorts', 'embed', 'live'].includes(first) ? second : null
  if (!id || !VIDEO_ID.test(id)) return null
  return { id, start: seconds(url.searchParams.get('t') ?? url.searchParams.get('start')) }
}
