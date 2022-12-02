export enum REQUEST_TYPES {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
}

export const REQUEST_URLS = {
  GET_CUSTOMERS: "/api/customers/",
  CREATE_CUSTOMERS: "/api/customers/",
  CREATE_BATCH_CUSTOMERS: "/api/batch_create_customers/",
  GET_CUSTOMER_DETAIL: (customerId) => `/api/customers/${customerId}/`,
  CREATE_SUBSCRIPTION: "/api/subscriptions/",
  CANCEL_SUBSCRIPTION: (subscriptionId) =>
    `/api/subscriptions/${subscriptionId}/`,
  CHANGE_SUBSCRIPTION: (subscriptionId) =>
    `/api/subscriptions/${subscriptionId}/`,
  GET_ALL_SUBSCRIPTIONS: "/api/subscriptions/",
  GET_SUBSCRIPTION_DETAILS: (subscriptionId) =>
    `/api/subscriptions/${subscriptionId}/`,
  GET_ALL_PLANS: "/api/plans/",
  GET_CUSTOMER_FEATURE_ACCESS: "/api/customer_feature_access/",
  GET_CUSTOMER_METRIC_ACCESS: "/api/customer_metric_access/",
  TRACK_EVENT: "/api/track/",
};

export enum ValidateEventType {
  createCustomer = "createCustomer",
  trackEvent = "trackEvent",
  customerDetails = "customerDetails",
  createSubscription = "createSubscription",
  cancelSubscription = "cancelSubscription",
  changeSubscription = "changeSubscription",
  subscriptionDetails = "subscriptionDetails",
  customerMetricAccess = "customerMetricAccess",
  customerFeatureAccess = "customerFeatureAccess",
  createCustomersBatch = "createCustomersBatch",
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

export interface CreateSubscriptionParams {
  customerId: string;
  planId: string;
  startDate: string;
  endDate?: string;
  status?: string;
  autoRenew?: boolean;
  isNew?: boolean;
  subscriptionId?: string;
  subscriptionFilters?: {
    propertyName: string;
    value: string;
  }[];
}

export interface CancelSubscriptionParams {
  subscriptionId: string;
  turnOffAutoRenew?: boolean;
  replaceImmediatelyType?: string;
}

export interface ChangeSubscriptionParams {
  subscriptionId: string;
  planId: string;
  turnOffAutoRenew?: boolean;
  replaceImmediatelyType?:
    | "end_current_subscription_and_bill"
    | "end_current_subscription_dont_bill"
    | "change_subscription_plan";
}

export interface SubscriptionDetailsParams {
  subscriptionId: string;
}

export interface CustomerMetricAccessParams {
  customerId: string;
  eventName?: string;
  subscription_filters?: object;
}

export interface CustomerMetricAccessResponse {
  event_name: string;
  subscription_id: string;
  subscription_filters: object;
  subscription_has_event: boolean;
  usage_per_metric: {
    metric_name: string;
    metric_id: string;
    metric_usage: number;
    metric_free_limit: number;
    metric_total_limit: number;
  }[];
}

export interface CustomerFeatureAccess {
  customerId: string;
  featureName?: string;
  subscription_filters?: object;
}

export interface CustomerFeatureAccessResponse {
  feature: string;
  subscription_id: string;
  subscription_filters: object;
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
