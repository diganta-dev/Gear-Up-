export const API_BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://gearupshop.vercel.app";

/**
 * Helper to construct full API endpoints
 */
export const getApiUrl = (path: string) => {
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

/**
 * Standard API error structure based on the project's backend
 */
export class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public data: any;

  constructor(message: string, statusCode: number = 500, data: any = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.success = false;
    this.data = data;
  }
}
