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
  CREATE_SUBSCRIPTION: "/api/subscriptions/add",
  CANCEL_SUBSCRIPTION: `/api/subscriptions/plans/cancel/`,
  CHANGE_SUBSCRIPTION: `/api/subscriptions/plans/update/`,
  GET_ALL_SUBSCRIPTIONS: "/api/subscriptions/",
  GET_SUBSCRIPTION_DETAILS: (subscriptionId) =>
    `/api/subscriptions/${subscriptionId}/`,
  GET_ALL_PLANS: "/api/plans/",
  GET_PLAN_DETAILS: (planId) =>
    `/api/plans/${planId}/`,
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
}

export interface CreateCustomerParams {
  customerId: string;
  email: string;
  paymentProvider?: string;
  paymentProviderId?: string;
  customerName?: string;
  properties?: string;
  integrations?: string;
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
  status?: string;
  autoRenew?: boolean;
  isNew?: boolean;
  subscriptionId?: string;
  subscriptionFilters?: subscriptionFilters[];
}

export interface ChangeSubscriptionParams {
  customerId: string;
  planId?: string;
  subscriptionFilters?: subscriptionFilters[];
  replacePlanId?: string;
  replacePlanInvoicingBehavior?: "add_to_next_invoice" | "invoice_now";
  turnOffAutoRenew?: boolean;
  endDate?: string;
}

export interface SubscriptionDetailsParams {
  subscriptionId: string;
}

export interface PlanDetailsParams {
  planId: string;
}

export interface CustomerMetricAccessParams {
  customerId: string;
  eventName: string;
  subscriptionFilters?: subscriptionFilters[];
}

export interface CustomerFeatureAccess {
  customerId: string;
  featureName: string;
  subscriptionFilters?: subscriptionFilters[];
}

export interface CustomerFeatureAccessResponse {
  feature: string;
  subscription_id: string;
  subscription_filters: subscriptionFilters[];
  access: boolean;
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
  customerId?: string;
  status?: "active" | "ended" | "not_started";
}

export interface CancelSubscriptionParams {
  planId: string;
  billUsage?: boolean;
  customerId: string;
  invoicingBehaviorOnCancel?: "add_to_next_invoice" | "invoice_now";
  flatFeeBehavior?: "refund" | "prorate" | "charge_full";
  subscriptionFilters?: subscriptionFilters[];
}

export interface GetInvoicesParams {
  customerId?: string;
  paymentStatus?: "paid" | "unpaid";
}
