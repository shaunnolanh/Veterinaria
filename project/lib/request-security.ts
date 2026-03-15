import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const PUBLIC_LIMIT = 20;
const ADMIN_LIMIT = 60;
const WINDOW_MS = 60 * 1000;

export function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function enforceRateLimit(request: NextRequest, scope: "public" | "admin") {
  const ip = getClientIp(request);
  const limit = scope === "admin" ? ADMIN_LIMIT : PUBLIC_LIMIT;
  const result = checkRateLimit({
    key: `${scope}:${ip}`,
    limit,
    windowMs: WINDOW_MS,
  });

  if (!result.allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intentá nuevamente en 1 minuto.` },
      { status: 429 }
    );
  }

  return null;
}

function stripDangerousChars(value: string) {
  return value.replace(/[<>`\\]/g, "").replace(/[\u0000-\u001F\u007F]/g, "").trim();
}

export function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return stripDangerousChars(value).slice(0, maxLength);
}

export function sanitizeEmail(value: unknown) {
  const email = sanitizeText(value, 120).toLowerCase();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return isValid ? email : "";
}

export function sanitizePhone(value: unknown) {
  const digits = typeof value === "string" ? value.replace(/\D/g, "") : "";
  return digits.slice(0, 20);
}

export function sanitizeDate(value: unknown) {
  const date = sanitizeText(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
}

export function sanitizeTime(value: unknown) {
  const time = sanitizeText(value, 5);
  return /^\d{2}:\d{2}$/.test(time) ? time : "";
}

export function sanitizeNumber(value: unknown, opts?: { min?: number; max?: number }) {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return null;
  if (opts?.min !== undefined && num < opts.min) return null;
  if (opts?.max !== undefined && num > opts.max) return null;
  return num;
}
