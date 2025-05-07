import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth } from "next-auth/middleware";

// Role-based access control mapping
const roleRouteAccess = {
  ADMIN: [
    "/admin",
    "/api/users",
    "/api/plans",
    "/api/households",
    "/api/members",
    "/api/cards",
    "/api/audit-logs",
  ],
  OFFICE_AGENT: ["/agent", "/api/households", "/api/members", "/api/cards"],
  HOSPITAL_USER: ["/hospital", "/api/cards/verify"],
};

export default async function middleware(req: NextRequestWithAuth) {
  const token = await getToken({ req });
  const isLoggedIn = !!token;
  const path = req.nextUrl.pathname;

  // Public routes that don't require authentication
  if (
    [
      "/auth/signin",
      "/auth/register",
      "/auth/error",
      "/api/auth/register",
    ].some((p) => path.startsWith(p))
  ) {
    // If user is already logged in, redirect to their dashboard
    if (isLoggedIn && (path === "/auth/signin" || path === "/auth/register")) {
      const userRole = token.role as keyof typeof roleRouteAccess;
      const dashboardRoutes = {
        ADMIN: "/admin/dashboard",
        OFFICE_AGENT: "/agent/dashboard",
        HOSPITAL_USER: "/hospital/dashboard",
      };
      return NextResponse.redirect(new URL(dashboardRoutes[userRole], req.url));
    }
    return NextResponse.next();
  }

  // API routes check
  if (path.startsWith("/api/")) {
    if (!isLoggedIn) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }

    const userRole = token.role as keyof typeof roleRouteAccess;

    // Check if user has access to this API route
    const hasAccess = roleRouteAccess[userRole].some(
      (route) => path.startsWith(route) || route === "*"
    );

    if (!hasAccess) {
      return new NextResponse(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { "content-type": "application/json" } }
      );
    }

    return NextResponse.next();
  }

  // Non-API routes check
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  const userRole = token.role as keyof typeof roleRouteAccess;

  // Redirect to appropriate dashboard based on role
  if (path === "/") {
    const dashboardRoutes = {
      ADMIN: "/admin/dashboard",
      OFFICE_AGENT: "/agent/dashboard",
      HOSPITAL_USER: "/hospital/dashboard",
    };

    return NextResponse.redirect(new URL(dashboardRoutes[userRole], req.url));
  }

  // Check role-based access for protected routes
  if (
    (path.startsWith("/admin") && userRole !== "ADMIN") ||
    (path.startsWith("/agent") &&
      userRole !== "ADMIN" &&
      userRole !== "OFFICE_AGENT") ||
    (path.startsWith("/hospital") &&
      !["ADMIN", "OFFICE_AGENT", "HOSPITAL_USER"].includes(userRole))
  ) {
    // Redirect to appropriate dashboard if trying to access unauthorized area
    const fallbackRoutes = {
      ADMIN: "/admin/dashboard",
      OFFICE_AGENT: "/agent/dashboard",
      HOSPITAL_USER: "/hospital/dashboard",
    };

    return NextResponse.redirect(new URL(fallbackRoutes[userRole], req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
