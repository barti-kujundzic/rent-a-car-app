import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/profile';

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
          }
        },
      },
    }
  );

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Supabase OAuth exchange error:', error);
      return NextResponse.redirect(
        `${origin}/login?oauth_error=1&msg=${encodeURIComponent(error.message ?? 'unknown')}`
      );
    }

    if (data?.session) {
      try {
        const user = data.user;
        if (user?.id) {
          await supabase
            .from('profiles')
            .upsert(
              {
                id: user.id,
                full_name: (user.user_metadata as any)?.full_name ?? null,
                updated_at: new Date().toISOString()
              },
              { onConflict: 'id' }
            );
        }
      } catch (e) {
        console.error('Profile upsert failed (non-blocking):', e);
      }

      if (next.startsWith('/login')) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.error('Sign out after OAuth signup failed (non-blocking):', e);
        }
        const emailParam = data.user?.email ? `&email=${encodeURIComponent(data.user.email)}` : '';
        return NextResponse.redirect(`${origin}/login?signup_complete=1${emailParam}`);
      }

      const redirectUrl = next.startsWith('http') ? next : `${origin}${next}`;
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.redirect(`${origin}/login?signup_complete=1`);
  }

  return NextResponse.redirect(`${origin}/login?oauth_error=1`);
}