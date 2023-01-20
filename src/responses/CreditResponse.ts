import { Currency } from "./ListCustomerResponse";

export interface CreditResponse {
  credit_id: string;
  customer: {
    customer_name: string;
    email: string;
    customer_id: string;
  };
  amount: number;
  amount_remaining: number;
  currency: Currency;
  description: string | null;
  effective_at: Date;
  expires_at: Date | null;
  status: "active" | "inactive";
  amount_paid: number;
  amount_paid_currency: Currency;
  drawdowns: {
    credit_id: string;
    amount: number;
    description: string | null;
    applied_at: Date;
  }[];
}
