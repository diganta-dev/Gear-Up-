export interface IGearCategory {
  id: string;
  name: string;
  description: string;
}

export interface IGearProvider {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
}

export interface IGear {
  id: string;
  providerId: string;
  categoryId: string;
  name: string;
  brand: string;
  description: string;
  dailyRentalPrice: number;
  stock: number;
  availableStock: number;
  availability: string;
  images: string[];
  specifications: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  category: IGearCategory;
  provider: IGearProvider;
}

export interface IGearResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IGear[];
  meta: any | null;
}

export interface ICategoryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IGearCategory[];
  meta: any | null;
}
