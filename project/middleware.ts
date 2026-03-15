// Middleware de protección de rutas admin + rate limiting API
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { checkRateLimit } from "@/lib/rate-limit";

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function validateRateLimit(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/api")) return null;

  const scope = pathname.startsWith("/api/admin") ? "admin" : "public";
  const limit = scope === "admin" ? 60 : 20;
  const ip = getClientIp(request);

  const result = checkRateLimit({
    key: `${scope}:${ip}`,
    limit,
    windowMs: 60 * 1000,
  });

  if (!result.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intentá nuevamente en 1 minuto." },
      { status: 429 }
    );
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";

  const rateLimitResponse = validateRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  if (!isAdminPage && !isAdminApi) return NextResponse.next();
  if (isLoginPage || isLoginApi) return NextResponse.next();

  const session = request.cookies.get("admin_session");

  if (!session?.value) {
    if (isAdminApi) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET!);
    await jwtVerify(session.value, secret);
    return NextResponse.next();
  } catch {
    if (isAdminApi) {
      return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("admin_session");
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
