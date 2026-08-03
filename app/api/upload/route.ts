import { NextRequest, NextResponse } from "next/server";

// Server-side proxy for ImgBB uploads.
// Keeps the API key out of client-side code.
export async function POST(request: NextRequest) {
  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey || apiKey === "your_imgbb_api_key_here") {
    return NextResponse.json(
      { success: false, message: "ImgBB API key is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const body = await request.formData();
    const file = body.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No image file provided." },
        { status: 400 }
      );
    }

    // Read the file as an ArrayBuffer and convert to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Forward to ImgBB
    const formData = new FormData();
    formData.append("key", apiKey);
    formData.append("image", base64);

    const imgbbRes = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    const result = await imgbbRes.json();

    if (!imgbbRes.ok || !result.success) {
      return NextResponse.json(
        { success: false, message: result?.error?.message || "ImgBB upload failed." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.data.display_url as string,
      deleteUrl: result.data.delete_url as string,
    });
  } catch (err) {
    console.error("[ImgBB Upload] Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error during image upload." },
      { status: 500 }
    );
  }
}
