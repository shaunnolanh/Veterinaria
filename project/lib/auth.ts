// JWT session utilities for admin panel
import { SignJWT, jwtVerify } from "jose";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "peonpets-admin-session-secret-dev";
  return new TextEncoder().encode(secret);
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
