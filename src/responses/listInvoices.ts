export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface Metadata {
  property1?: any;
  property2?: any;
}

export interface Plan {
  plan_name: string;
  plan_id: string;
  version: number;
}

export interface SubscriptionFilter {
  value: string;
  property_name: string;
}

export interface LineItem {
  name: string;
  start_date: Date;
  end_date: Date;
  quantity: number;
  subtotal: number;
  billing_type: string;
  metadata: Metadata;
  plan: Plan;
  subscription_filters: SubscriptionFilter[];
}

export interface Customer {
  customer_name: string;
  email: string;
  customer_id: string;
}

export interface InvoiceResponse {
  invoice_number: string;
  invoice_id: string;
  cost_due: number;
  currency: Currency;
  issue_date: Date;
  payment_status: string;
  external_payment_obj_id: string;
  external_payment_obj_type: string;
  line_items: LineItem[];
  customer: Customer;
  due_date: Date;
  invoice_pdf: string;
  seller: string;
  end_date: string;
  start_date: string;
}
