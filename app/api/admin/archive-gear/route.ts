import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://gearupshop.vercel.app";

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { gearId } = body;

    if (!gearId) {
      return NextResponse.json({ success: false, message: "gearId is required" }, { status: 400 });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Cookie: `accessToken=${accessToken}`,
      Authorization: accessToken,
      authorization: `Bearer ${accessToken}`,
    };

    const archiveBody = JSON.stringify({
      availability: "UNAVAILABLE",
      stock: 0,
      availableStock: 0,
    });

    // Try endpoints in order
    const endpoints = [
      { method: "PATCH", url: `${API_BASE_URL}/api/admin/gear/${gearId}` },
      { method: "PATCH", url: `${API_BASE_URL}/api/gear/${gearId}` },
      { method: "PUT", url: `${API_BASE_URL}/api/admin/gear/${gearId}` },
      { method: "PUT", url: `${API_BASE_URL}/api/gear/${gearId}` },
    ];

    const results: any[] = [];
    for (const ep of endpoints) {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers,
        body: archiveBody,
        cache: "no-store",
      });
      const text = await res.text();
      results.push({ endpoint: `${ep.method} ${ep.url}`, status: res.status, body: text.slice(0, 300) });
      if (res.ok) {
        let data: any = {};
        try { data = JSON.parse(text); } catch { }
        return NextResponse.json({ success: true, data, results });
      }
    }

    return NextResponse.json({ success: false, message: "All archive endpoints failed", results }, { status: 500 });
  } catch (error: any) {
    console.error("[archiveGear API] Error:", error);
    return NextResponse.json({ success: false, message: error?.message || "Internal error" }, { status: 500 });
  }
}
