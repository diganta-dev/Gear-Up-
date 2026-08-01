export interface IUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "PROVIDER" | "CUSTOMER";
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
  role: "ADMIN" | "PROVIDER" | "CUSTOMER";
  iat: number;
  exp: number;
}
