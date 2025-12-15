import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    /*
     * Logging to debug white screen issue
     */
    // console.log('Middleware running for:', request.nextUrl.pathname);

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            request.cookies.set(name, value)
                        )
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const {
            data: { user },
        } = await supabase.auth.getUser()

        const path = request.nextUrl.pathname

        // Redirect to login if accessing admin but not logged in
        if (path.startsWith('/admin') && !user) {
            console.log('Redirecting to /login from', path);
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Redirect to admin if accessing login but already logged in
        if (path === '/login' && user) {
            const role = user.user_metadata?.role;
            if (role === 'admin') {
                console.log('Redirecting to /admin');
                return NextResponse.redirect(new URL('/admin', request.url));
            } else {
                console.log('Redirecting to / (home)');
                return NextResponse.redirect(new URL('/', request.url));
            }
        }
    } catch (e) {
        console.error('Middleware Error:', e);
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
