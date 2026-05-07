import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    const adminPassword = process.env.ADMIN_PASSWORD
    const sessionSecret = process.env.ADMIN_SESSION_SECRET

    if (!adminPassword || !sessionSecret) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 })
    }

    if (!password || password !== adminPassword) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    const res = NextResponse.json({ success: true })
    res.cookies.set('fynde-admin-session', sessionSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
