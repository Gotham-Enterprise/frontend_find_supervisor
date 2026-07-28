import { type NextRequest, NextResponse } from 'next/server'

// Same-origin proxy for saved profile photos. The photo editor crops via
// canvas and exports with toBlob(); loading the image straight from S3 taints
// the canvas (the bucket sends no CORS headers) and the export throws a
// SecurityError. Serving the bytes from our own origin sidesteps CORS
// entirely.
//
// Mirrors the images.remotePatterns allowlist in next.config.ts:
// *.s3.amazonaws.com and *.s3.<region>.amazonaws.com only, so this can't be
// used as an open proxy.
const ALLOWED_HOSTNAME = /^[a-z0-9][a-z0-9.-]*\.s3(?:\.[a-z0-9-]+)?\.amazonaws\.com$/

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }

  if (parsed.protocol !== 'https:' || !ALLOWED_HOSTNAME.test(parsed.hostname)) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 400 })
  }

  try {
    const upstream = await fetch(parsed.toString())

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: upstream.status })
    }

    const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream'

    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Not an image' }, { status: 400 })
    }

    return new NextResponse(upstream.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=300',
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
