import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const LOGIN_PAGE = "/admin"
const POST_LOGIN_REDIRECT = "/admin/products"

export default auth((req: NextRequest & { auth: unknown }) => {
    const { pathname } = req.nextUrl
    const session = (req as { auth: unknown }).auth

    // Protect all admin sub-routes (everything under /admin/ except the login page itself)
    if (pathname.startsWith("/admin/") && !session) {
        const loginUrl = new URL(LOGIN_PAGE, req.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Already logged in — redirect away from login page
    if (pathname === LOGIN_PAGE && session) {
        return NextResponse.redirect(new URL(POST_LOGIN_REDIRECT, req.url))
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         * - _next/static, _next/image, favicon, public assets
         * - api/auth (NextAuth routes must always be reachable)
         */
        "/((?!_next/static|_next/image|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/auth).*)",
    ],
}
