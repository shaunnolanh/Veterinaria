// POST /api/admin/login — Autenticación con cookie JWT
import { NextRequest, NextResponse } from "next/server";
import { crearSesionToken } from "@/lib/auth";
import { sanitizeText } from "@/lib/request-security";

// Rate limiting en memoria: máx 5 intentos por IP cada 10 minutos
const intentosFallidos = new Map<string, { count: number; resetAt: number }>();

function verificarRateLimit(ip: string): boolean {
  const ahora = Date.now();
  const registro = intentosFallidos.get(ip);

  if (!registro || ahora > registro.resetAt) {
    intentosFallidos.set(ip, { count: 1, resetAt: ahora + 10 * 60 * 1000 });
    return true;
  }
  if (registro.count >= 5) return false;
  registro.count++;
  return true;
}

function resetearRateLimit(ip: string) {
  intentosFallidos.delete(ip);
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!verificarRateLimit(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Esperá 10 minutos." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const usuario = sanitizeText(body.usuario, 80);
    const contrasena = sanitizeText(body.contrasena, 120);

    const usuarioCorrecto = usuario === process.env.ADMIN_USER;
    const contrasenaCorrrecta = contrasena === process.env.ADMIN_PASSWORD;

    if (!usuarioCorrecto || !contrasenaCorrrecta) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    resetearRateLimit(ip);

    const token = await crearSesionToken();

    const response = NextResponse.json({ ok: true });
    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60, // 8 horas en segundos
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
