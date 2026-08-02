import { IGear, IGearProvider } from "./gear";

export type RentalStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PAID"
  | "PICKED_UP"
  | "RETURNED"
  | "CANCELLED";

export interface IRental {
  id: string;
  customerId: string;
  gearItemId: string;
  startDate: string;
  endDate: string;
  status: RentalStatus;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  gearItem: IGear;
  payment?: {
    id: string;
    status: string;
    transactionId?: string;
    amount?: number;
    [key: string]: any;
  } | null;
  items?: any[];
  customer?: any;
}

export interface IRentalResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IRental[];
  meta: any | null;
}

export interface ISingleRentalResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IRental;
  meta: any | null;
}

// Shape returned by GET /api/provider/orders
export interface IProviderOrder {
  id: string;
  status: RentalStatus;
  totalAmount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  // Backend may return the customer as `user` or `customer`
  user?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string | null;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string | null;
  };
  // Backend may return the gear as `gear` or `gearItem`
  gear?: {
    id: string;
    name: string;
    images?: string[];
  };
  gearItem?: {
    id: string;
    name: string;
    images?: string[];
  };
}

export interface IProviderOrdersResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  data: IProviderOrder[];
}

// Generic API action result returned by server actions
export interface IActionResult {
  success: boolean;
  message?: string;
}

