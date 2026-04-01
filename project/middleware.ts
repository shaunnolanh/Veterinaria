// Middleware de protección de rutas admin + rate limiting API + headers de seguridad
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

function buildCspHeader(request: NextRequest) {
  const selfOrigin = request.nextUrl.origin;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const connectSrc = ["'self'", selfOrigin];
  if (supabaseUrl) {
    connectSrc.push(supabaseUrl);
    try {
      connectSrc.push(new URL(supabaseUrl).origin);
    } catch {
      // Ignorar URL inválida y mantener política estricta.
    }
  }

  let supabaseOrigin = "";

  try {
    supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : "";
  } catch {
    supabaseOrigin = "";
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `connect-src ${Array.from(new Set(connectSrc)).join(" ")}`,
    `img-src 'self' data: blob: https:${supabaseOrigin ? " " + supabaseOrigin : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "frame-src 'self' https://www.google.com https://maps.google.com https://*.google.com",
    "upgrade-insecure-requests",
  ].join("; ");
}

function applySecurityHeaders(response: NextResponse, request: NextRequest) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.set("Content-Security-Policy", buildCspHeader(request));
  return response;
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
    return applySecurityHeaders(
      NextResponse.json(
        { error: "Demasiadas solicitudes. Intentá nuevamente en 1 minuto." },
        { status: 429 },
      ),
      request,
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

  if (!isAdminPage && !isAdminApi)
    return applySecurityHeaders(NextResponse.next(), request);
  if (isLoginPage || isLoginApi)
    return applySecurityHeaders(NextResponse.next(), request);

  const session = request.cookies.get("admin_session");

  if (!session?.value) {
    if (isAdminApi) {
      return applySecurityHeaders(
        NextResponse.json({ error: "No autorizado." }, { status: 401 }),
        request,
      );
    }
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/admin/login", request.url)),
      request,
    );
  }

  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET!);
    await jwtVerify(session.value, secret);
    return applySecurityHeaders(NextResponse.next(), request);
  } catch {
    if (isAdminApi) {
      return applySecurityHeaders(
        NextResponse.json({ error: "Sesión inválida." }, { status: 401 }),
        request,
      );
    }
    const response = NextResponse.redirect(
      new URL("/admin/login", request.url),
    );
    response.cookies.delete("admin_session");
    return applySecurityHeaders(response, request);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
