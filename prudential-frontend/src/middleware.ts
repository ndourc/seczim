import { NextResponse, NextRequest } from 'next/server';

// Paths that require any authenticated user
const protectedPaths = [
  '/dashboard',
  '/company',
  '/api/offsite/submit',
  '/api/risk/calculate',
];

// Paths that require COMMISSION_ANALYST
const analystOnlyPaths = [
  '/dashboard/smi',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requiresAuth = protectedPaths.some((p) => pathname.startsWith(p));
  const requiresAnalyst = analystOnlyPaths.some((p) => pathname.startsWith(p));

  if (!requiresAuth && !requiresAnalyst) return NextResponse.next();

  const access = req.cookies.get('access')?.value;
  if (!access) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (requiresAnalyst) {
    const role = req.cookies.get('role')?.value;
    if (role !== 'COMMISSION_ANALYST' && req.method !== 'GET') {
      return NextResponse.json({ detail: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/company/:path*',
    '/api/offsite/submit',
    '/api/risk/calculate',
  ],
};


