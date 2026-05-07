/**
 * POST /api/admin/upload
 * Accepts a multipart/form-data body with a single "file" field (image).
 * Signs the upload, pushes it to Cloudinary, and returns the secure URL.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

function verifySession(req: NextRequest): boolean {
  const session = req.cookies.get('fynde-admin-session')?.value
  const expected = process.env.ADMIN_SESSION_SECRET
  return !!expected && session === expected
}

/** Build a Cloudinary v1 signed-upload signature (SHA-1 of sorted params + secret) */
function cloudinarySignature(params: Record<string, string>, apiSecret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&')
  return createHash('sha1').update(sorted + apiSecret).digest('hex')
}

export async function POST(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Only allow images
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
  }

  // 20 MB max
  const MAX_BYTES = 20 * 1024 * 1024
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 20 MB)' }, { status: 400 })
  }

  try {
    const timestamp = String(Math.round(Date.now() / 1000))
    const folder    = 'fynde/products'

    const sigParams: Record<string, string> = { folder, timestamp }
    const signature = cloudinarySignature(sigParams, apiSecret)

    // Build the multipart body for Cloudinary
    const upload = new FormData()
    upload.append('file', file)
    upload.append('api_key', apiKey)
    upload.append('timestamp', timestamp)
    upload.append('signature', signature)
    upload.append('folder', folder)

    const cldRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: upload }
    )

    const cldJson = await cldRes.json()

    if (!cldRes.ok) {
      console.error('Cloudinary upload error:', cldJson)
      return NextResponse.json(
        { error: cldJson?.error?.message ?? 'Upload failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: cldJson.secure_url as string })
  } catch (err) {
    console.error('Upload route error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
