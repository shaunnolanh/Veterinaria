// JWT session utilities for admin panel
import { SignJWT, jwtVerify } from "jose";

function getSecret() {
  if (!process.env.ADMIN_SESSION_SECRET) {
    throw new Error("ADMIN_SESSION_SECRET no configurado en .env.local");
  }
  return new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET);
}

export async function crearSesionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verificarSesionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}
