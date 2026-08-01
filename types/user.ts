export interface IUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "provider" | "user";
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface IDecodedToken {
  id: string;
  email: string;
  role: "admin" | "provider" | "user";
  iat: number;
  exp: number;
}
