import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
    const isLoggedIn = !!req.auth;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login');
    const isProtectedRoute =
        req.nextUrl.pathname.startsWith('/competitions/new') ||
        req.nextUrl.pathname.includes('/rounds/new');

    // Redirect logged-in users away from login page
    if (isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Redirect non-logged-in users to login for protected routes
    if (isProtectedRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
});


export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
