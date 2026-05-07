import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=no_code`)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

  if (sessionError || !sessionData.session) {
    return NextResponse.redirect(`${origin}/admin/login?error=invalid_link`)
  }

  const userEmail = sessionData.session.user.email

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('role')
    .eq('email', userEmail)
    .single()

  if (adminError || !adminUser) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/admin/login?error=unauthorized`)
  }

  return NextResponse.redirect(`${origin}/admin/orders`)
}