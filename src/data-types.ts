export enum REQUEST_TYPES {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export const REQUEST_URLS = {
  GET_CUSTOMERS: "/api/customers/",
  CREATE_CUSTOMERS: "/api/customers/",
  CREATE_BATCH_CUSTOMERS: "/api/batch_create_customers/",
  GET_CUSTOMER_DETAIL: (customerId) => `/api/customers/${customerId}/`,
  CREATE_SUBSCRIPTION: "/api/subscriptions/add/",
  CANCEL_SUBSCRIPTION: `/api/subscriptions/cancel/`,
  CHANGE_SUBSCRIPTION: `/api/subscriptions/update/`,
  GET_ALL_SUBSCRIPTIONS: "/api/subscriptions/",
  GET_SUBSCRIPTION_DETAILS: (subscriptionId) =>
    `/api/subscriptions/${subscriptionId}/`,
  GET_ALL_PLANS: "/api/plans/",
  GET_PLAN_DETAILS: (planId) => `/api/plans/${planId}/`,
  GET_CUSTOMER_FEATURE_ACCESS: "/api/customer_feature_access/",
  GET_CUSTOMER_METRIC_ACCESS: "/api/customer_metric_access/",
  TRACK_EVENT: "/api/track/",
  GET_INVOICES: "/api/invoices/",
};

export enum ValidateEventType {
  createCustomer = "createCustomer",
  trackEvent = "trackEvent",
  customerDetails = "customerDetails",
  createSubscription = "createSubscription",
  cancelSubscription = "cancelSubscription",
  changeSubscription = "changeSubscription",
  subscriptionDetails = "subscriptionDetails",
  planDetails = "planDetails",
  customerMetricAccess = "customerMetricAccess",
  customerFeatureAccess = "customerFeatureAccess",
  createCustomersBatch = "createCustomersBatch",
  getInvoices = "getInvoices",
  listSubscriptions = "listSubscriptions",
}

export interface CreateCustomerParams {
  customerId: string;
  email: string;
  paymentProvider?: string;
  paymentProviderId?: string;
  customerName?: string;
  properties?: string;
  default_currency_code?: string;
}

export interface CreateBatchCustomerParams {
  customers: CreateCustomerParams[];
  behaviorOnExisting: "merge" | "ignore" | "overwrite";
}

export interface CustomerDetailsParams {
  customerId: string;
}

export interface CustomerDetailsParams {
  customerId: string;
}

export interface subscriptionFilters {
  propertyName: string;
  value: string;
}

export interface CreateSubscriptionParams {
  customerId: string;
  planId: string;
  startDate: string;
  endDate?: string;
  autoRenew?: boolean;
  isNew?: boolean;
  subscriptionFilters?: subscriptionFilters[];
}

export interface SubscriptionDetailsParams {
  subscriptionId: string;
}

export interface PlanDetailsParams {
  planId: string;
}

export interface CustomerMetricAccessParams {
  customerId: string;
  metricId?: string;
  eventName?: string;
  subscriptionFilters?: subscriptionFilters[];
}

export interface CustomerFeatureAccess {
  customerId: string;
  featureName: string;
  subscriptionFilters?: subscriptionFilters[];
}

export interface TrackEventEntity {
  eventName: string;
  customerId: string;
  idempotencyId: string;
  timeCreated: Date;
  properties?: any;
}

export interface TrackEvent {
  batch: TrackEventEntity[];
}

export interface ListAllSubscriptionsParams {
  customerId: string;
  planId?: string;
  rangeEnd?: string;
  rangeStart?: string;
  status?: string[];
}

export interface CancelSubscriptionParams {
  planId: string;
  customerId: string;
  subscriptionFilters?: subscriptionFilters[];
  invoicingBehavior?: "add_to_next_invoice" | "invoice_now";
  flatFeeBehavior?: "refund" | "prorate" | "charge_full";
  usageBehavior?: "bill_full" | "bill_none";
}

export interface ChangeSubscriptionParams {
  customerId: string;
  planId?: string;
  subscriptionFilters?: subscriptionFilters[];
  replacePlanId?: string;
  invoicingBehavior?: "add_to_next_invoice" | "invoice_now";
  usageBehavior?: "transfer_to_new_subscription" | "keep_separate";
  turnOffAutoRenew?: boolean;
  endDate?: string;
}

export interface GetInvoicesParams {
  customerId?: string;
  paymentStatus?: "paid" | "unpaid";
}
