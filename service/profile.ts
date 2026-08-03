"use server";

import { cookies } from "next/headers";
import { revalidateTag, revalidatePath } from "next/cache";

const API_BASE_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://gearupshop.vercel.app";

export interface UpdateProfilePayload {
  name?: string;
  profileImage?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export const updateProfile = async (payload: UpdateProfilePayload) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { success: false, message: "You must be logged in." };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Cookie: `accessToken=${accessToken}`,
    Authorization: accessToken,
    authorization: `Bearer ${accessToken}`,
  };

  const endpoints = [
    { method: "PATCH", url: `${API_BASE_URL}/api/auth/me` },
    { method: "PATCH", url: `${API_BASE_URL}/api/users/me` },
    { method: "PATCH", url: `${API_BASE_URL}/api/profile` },
    { method: "PUT",   url: `${API_BASE_URL}/api/auth/me` },
    { method: "PUT",   url: `${API_BASE_URL}/api/users/me` },
    { method: "PUT",   url: `${API_BASE_URL}/api/profile` },
  ];

  // Build payload with all common profile image field aliases so whichever field
  // the backend API / Prisma schema uses (profileImage, profilePicture, image, avatar, profile.profilePicture) gets updated.
  const bodyPayload = {
    name: payload.name,
    profileImage: payload.profileImage,
    profilePicture: payload.profileImage,
    image: payload.profileImage,
    avatar: payload.profileImage,
    profile: {
      name: payload.name,
      profileImage: payload.profileImage,
      profilePicture: payload.profileImage,
      image: payload.profileImage,
    },
  };

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers,
        body: JSON.stringify(bodyPayload),
        cache: "no-store",
      });

      const text = await res.text();

      if (res.ok) {
        try { revalidateTag("my-profile", "max"); } catch {}
        try { revalidatePath("/profile"); } catch {}

        let data: Record<string, any> = {};
        try { data = JSON.parse(text); } catch {}

        return {
          success: true,
          message: data?.message || "Profile updated successfully.",
          data: data?.data,
        };
      }
    } catch {
      // Try next endpoint
    }
  }

  return { success: false, message: "Failed to update profile. Please try again." };
};

export const changePassword = async (payload: ChangePasswordPayload) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { success: false, message: "You must be logged in." };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Cookie: `accessToken=${accessToken}`,
    Authorization: accessToken,
    authorization: `Bearer ${accessToken}`,
  };

  const endpoints = [
    { url: `${API_BASE_URL}/api/auth/change-password`, body: payload },
    { url: `${API_BASE_URL}/api/auth/changePassword`,  body: payload },
    {
      url: `${API_BASE_URL}/api/auth/change-password`,
      body: { currentPassword: payload.oldPassword, newPassword: payload.newPassword },
    },
    { url: `${API_BASE_URL}/api/users/change-password`, body: payload },
    {
      url: `${API_BASE_URL}/api/users/change-password`,
      body: { currentPassword: payload.oldPassword, newPassword: payload.newPassword },
    },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: "POST",
        headers,
        body: JSON.stringify(ep.body),
        cache: "no-store",
      });

      const text = await res.text();
      let data: Record<string, any> = {};
      try { data = JSON.parse(text); } catch {}

      if (res.ok && data?.success !== false) {
        return {
          success: true,
          message: data?.message || "Password changed successfully.",
        };
      }

      // If we got a clear error message back, return it immediately
      if (data?.message && !res.ok) {
        return { success: false, message: data.message };
      }
    } catch {
      // Try next endpoint
    }
  }

  return {
    success: false,
    message: "Failed to change password. Please verify your current password and try again.",
  };
};
