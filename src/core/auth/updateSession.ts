import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export type SessionGuardOptions = {
  /** Default `/admin` */
  adminPrefix?: string;
  /** Default `/admin/login` */
  loginPath?: string;
  /** Where to send logged-in users away from login. Default `/admin` */
  afterLoginPath?: string;
};

export async function updateSession(
  request: NextRequest,
  options: SessionGuardOptions = {}
) {
  const adminPrefix = options.adminPrefix ?? "/admin";
  const loginPath = options.loginPath ?? `${adminPrefix}/login`;
  const afterLoginPath = options.afterLoginPath ?? adminPrefix;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options: cookieOptions }) =>
            supabaseResponse.cookies.set(name, value, cookieOptions)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith(adminPrefix);
  const isLoginPage = path === loginPath;

  if (isAdminRoute && !isLoginPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    return NextResponse.redirect(url);
  }

  if (isLoginPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = afterLoginPath;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
