import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.BACKEND_API_URL || "https://gearupshop.vercel.app";

// Diagnostic endpoint — REMOVE after debugging
// Visit: http://localhost:5000/api/debug/provider-orders while logged in as a provider
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const diagnostics: Record<string, any> = {
    hasAccessToken: !!accessToken,
    accessTokenLength: accessToken?.length ?? 0,
    backendUrl: API_BASE_URL,
    endpoints: [],
  };

  if (!accessToken) {
    return NextResponse.json({ ...diagnostics, error: "No accessToken cookie found" });
  }

  const authHeaders = {
    "Content-Type": "application/json",
    Cookie: `accessToken=${accessToken}`,
    Authorization: accessToken,
    "x-access-token": accessToken,
  };

  const endpointsToTest = [
    `${API_BASE_URL}/api/provider/orders`,
    `${API_BASE_URL}/api/rentals`,
    `${API_BASE_URL}/api/auth/me`,
  ];

  for (const endpoint of endpointsToTest) {
    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: authHeaders,
        cache: "no-store",
      });

      let body: any = null;
      const text = await res.text();
      try { body = JSON.parse(text); } catch { body = text; }

      const entry: Record<string, any> = {
        endpoint,
        status: res.status,
        ok: res.ok,
        responseKeys: body && typeof body === "object" ? Object.keys(body) : null,
        dataIsArray: Array.isArray(body?.data),
        dataLength: Array.isArray(body?.data) ? body.data.length : null,
        firstItemKeys: Array.isArray(body?.data) && body.data.length > 0 ? Object.keys(body.data[0]) : null,
        rawPreview: text.substring(0, 500),
      };

      diagnostics.endpoints.push(entry);
    } catch (err: any) {
      diagnostics.endpoints.push({ endpoint, error: err?.message });
    }
  }

  return NextResponse.json(diagnostics, {
    headers: { "Cache-Control": "no-store" },
  });
}
