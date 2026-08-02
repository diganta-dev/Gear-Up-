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

    // Try OUT_OF_STOCK first (providers may have permission), then UNAVAILABLE (admins), then stock=0 only
    const archiveAttempts = [
      { availability: "OUT_OF_STOCK", stock: 0, availableStock: 0 },
      { availability: "UNAVAILABLE", stock: 0, availableStock: 0 },
    ];

    const endpoints = [
      `${API_BASE_URL}/api/gear/${gearId}`,
      `${API_BASE_URL}/api/admin/gear/${gearId}`,
      `${API_BASE_URL}/api/provider/gear/${gearId}`,
    ];

    const results: any[] = [];

    for (const archivePayload of archiveAttempts) {
      for (const url of endpoints) {
        for (const method of ["PATCH", "PUT"]) {
          try {
            const res = await fetch(url, {
              method,
              headers,
              body: JSON.stringify(archivePayload),
              cache: "no-store",
            });
            const text = await res.text();
            results.push({ method, url, status: res.status, body: text.slice(0, 300), payload: archivePayload });
            console.log(`[archiveGear provider] ${method} ${url} payload=${JSON.stringify(archivePayload)} → ${res.status}: ${text.slice(0, 200)}`);

            if (res.ok) {
              let data: any = {};
              try { data = JSON.parse(text); } catch { }
              return NextResponse.json({
                success: true,
                archivedAs: archivePayload.availability,
                data,
                results,
              });
            }
          } catch (e: any) {
            results.push({ method, url, error: e?.message });
          }
        }
      }
    }

    return NextResponse.json(
      { success: false, message: "All archive attempts failed", results },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("[archiveGear provider API] Error:", error);
    return NextResponse.json({ success: false, message: error?.message || "Internal error" }, { status: 500 });
  }
}
