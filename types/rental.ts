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
