import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "playarena_super_secret_jwt_key_2026_xyz"
);

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
  role: "player" | "organizer" | "super_admin";
  name: string;
  avatarUrl?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signJWT(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;
    return await verifyJWT(token);
  } catch {
    return null;
  }
}

/**
 * Strict authentication check. Throws UNAUTHORIZED if not logged in.
 */
export async function requireAuth(): Promise<TokenPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

/**
 * Strict role-based authorization check. Throws UNAUTHORIZED or FORBIDDEN.
 */
export async function requireRole(
  allowedRoles: ("player" | "organizer" | "super_admin")[]
): Promise<TokenPayload> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export function handleAuthError(error: unknown) {
  const message = (error as Error).message;
  if (message === "UNAUTHORIZED") {
    return { status: 401, error: "Access denied: Authentication required." };
  }
  if (message === "FORBIDDEN") {
    return { status: 403, error: "Access denied: Insufficient permissions for this resource." };
  }
  return { status: 500, error: message || "Internal server error." };
}
