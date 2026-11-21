import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { verifyPassword, signJWT, TokenPayload } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Try MongoDB first
    let userPayload: TokenPayload | null = null;
    try {
      await connectToDatabase();
      const user = await User.findOne({
        $or: [{ email: normalizedEmail }, { username: normalizedEmail }],
      });

      if (user) {
        const isValid = await verifyPassword(password, user.passwordHash);
        if (isValid) {
          userPayload = {
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
            role: user.role,
            name: user.name,
            avatarUrl: user.avatarUrl,
          };
        }
      }
    } catch {
      // Database query error
    }

    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await signJWT(userPayload);

    const response = NextResponse.json({
      success: true,
      user: userPayload,
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Authentication failed" },
      { status: 500 }
    );
  }
}
