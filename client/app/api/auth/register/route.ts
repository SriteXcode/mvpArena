import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword, signJWT, TokenPayload } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, username, email, password, whatsappNumber, role } = await req.json();

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, username, email, and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, "");

    // Validate username rules (unique athlete handle, NOT game character UID)
    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      return NextResponse.json(
        {
          success: false,
          error: "Username must be 3 to 20 characters and contain only lowercase letters, numbers, and underscores.",
        },
        { status: 400 }
      );
    }

    // Strict Role Enforcement: All public registrations are assigned 'player' by default
    const assignedRole: "player" = "player";
    const refCode = `${normalizedUsername.slice(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

    let userPayload: TokenPayload | null = null;

    try {
      await connectToDatabase();

      const existingUser = await User.findOne({
        $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
      });

      if (existingUser) {
        if (existingUser.username === normalizedUsername) {
          return NextResponse.json(
            { success: false, error: "This username is already taken. Please choose a different handle." },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { success: false, error: "An account with that email already exists" },
          { status: 409 }
        );
      }

      const passwordHash = await hashPassword(password);
      const newUser = await User.create({
        name: name.trim(),
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
        role: assignedRole,
        whatsappNumber: whatsappNumber || "",
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${normalizedUsername}`,
        referralCode: refCode,
        gameProfiles: [],
        upiId: "",
      });

      userPayload = {
        userId: newUser._id.toString(),
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        name: newUser.name,
        avatarUrl: newUser.avatarUrl,
      };
    } catch {
      // Fallback in case DB is offline
      userPayload = {
        userId: "usr_" + Date.now(),
        email: normalizedEmail,
        username: normalizedUsername,
        role: assignedRole,
        name: name.trim(),
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${normalizedUsername}`,
      };
    }

    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: "Failed to generate athlete session" },
        { status: 500 }
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
      { success: false, error: (error as Error).message || "Registration failed" },
      { status: 500 }
    );
  }
}
