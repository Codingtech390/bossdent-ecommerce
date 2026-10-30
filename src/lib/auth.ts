import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "dentalkart_super_secret_jwt_key_9283748291";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "customer" | "admin";
  membershipTier?: "none" | "plus";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("dk_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function extractSessionFromRequest(req: NextRequest): SessionPayload | null {
  const tokenFromCookie = req.cookies.get("dk_token")?.value;
  if (tokenFromCookie) {
    const verified = verifyToken(tokenFromCookie);
    if (verified) return verified;
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  return null;
}
