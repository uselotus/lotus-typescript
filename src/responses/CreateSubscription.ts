export interface SubscriptionFilter {
  value: string;
  property_name: string;
}

export interface LightPlan {
  plan_name: string;
  plan_id: string;
  version: string;
}

export interface LightCustomer {
  customer_name: string;
  email: string;
  customer_id: string;
}

export interface CreateSubscription {
  customer: LightCustomer;
  subscription_filters: SubscriptionFilter[];
  start_date?: string;
  end_date?: string;
  fully_billed?: boolean;
  is_new?: boolean;
  auto_renew?: boolean;
  billing_plan: LightPlan;
}
