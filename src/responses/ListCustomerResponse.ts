import { CreateSubscription } from "./CreateSubscription";
export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface Invoice {
  external_payment_obj_type: string;
  invoice_number: string;
  currency: Currency;
  external_payment_obj_id: string;
  due_date: Date;
  payment_status: string;
  issue_date: Date;
  cost_due: number;
}

// interface SubscriptionFilter {
//   value: string;
//   property_name: string;
// }

// interface Subscription {
//   customer_id: string;
//   plan_id: string;
//   subscription_filters: SubscriptionFilter[];
// }

interface Integrations {
  property1?: any;
  property2?: any;
}

interface DefaultCurrency {
  code: string;
  name: string;
  symbol: string;
}

export interface ListCustomerResponse {
  customer_id: string;
  email: string;
  customer_name: string;
  invoices: Invoice[];
  total_amount_due: number;
  subscriptions: CreateSubscription[];
  integrations: Integrations;
  default_currency: DefaultCurrency;
  has_payment_method: boolean;
  address?: any;
  tax_rate: number;
}
