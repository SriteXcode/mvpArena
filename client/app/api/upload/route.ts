import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";

// Initialize Cloudinary if credentials are provided in environment
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Ensure local uploads directory exists
async function ensureUploadsDir(): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch {
    // Already exists
  }
  return uploadsDir;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let fileBuffer: Buffer | null = null;
    let originalName = "upload.png";
    let mimeType = "image/png";

    // A. Handle multipart/form-data
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No image file provided in form data." },
          { status: 400 }
        );
      }

      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, error: "Only image files (PNG, JPEG, WebP, GIF) are accepted." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      fileBuffer = Buffer.from(bytes);
      originalName = file.name || "image.png";
      mimeType = file.type || "image/png";
    }
    // B. Handle JSON base64 data
    else if (contentType.includes("application/json")) {
      const body = await req.json();
      const base64Data = body.file || body.image || body.data;

      if (!base64Data || typeof base64Data !== "string") {
        return NextResponse.json(
          { success: false, error: "Base64 image string is required." },
          { status: 400 }
        );
      }

      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        fileBuffer = Buffer.from(matches[2], "base64");
      } else {
        fileBuffer = Buffer.from(base64Data, "base64");
      }

      if (body.filename) {
        originalName = body.filename;
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported Content-Type. Send multipart/form-data or JSON." },
        { status: 400 }
      );
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json(
        { success: false, error: "Empty image payload received." },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (fileBuffer.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File exceeds maximum permitted size of 10MB." },
        { status: 400 }
      );
    }

    // 1. Cloudinary upload if configured
    if (hasCloudinary) {
      const base64Uri = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
      const uploadResult = await cloudinary.uploader.upload(base64Uri, {
        folder: "mvparena_uploads",
        resource_type: "image",
      });

      return NextResponse.json({
        success: true,
        url: uploadResult.secure_url,
        provider: "cloudinary",
      });
    }

    // 2. Local disk fallback (localhost / production volume)
    const uploadsDir = await ensureUploadsDir();
    const ext = path.extname(originalName) || `.${mimeType.split("/")[1] || "png"}`;
    const safeExt = [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext.toLowerCase()) ? ext : ".png";
    const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${safeExt}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, fileBuffer);
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      provider: "local_storage",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to process image upload." },
      { status: 500 }
    );
  }
}
