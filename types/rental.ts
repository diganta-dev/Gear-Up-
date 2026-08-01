import { IGear, IGearProvider } from "./gear";

export type RentalStatus = 
  | 'PLACED'
  | 'CONFIRMED'
  | 'PAID'
  | 'PICKED_UP'
  | 'RETURNED'
  | 'CANCELLED';

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
