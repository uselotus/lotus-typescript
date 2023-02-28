import { AxiosError, AxiosResponse } from "axios";

export interface ValidationError {
  code: string;
  detail: string;
  attr: string;
}
export interface ErrorResponse {
  type: URL;
  title: string;
  detail: string;
  validation_errors?: ValidationError[];
}

export interface response extends AxiosResponse {
  data: ErrorResponse;
}
export interface resp extends AxiosError {
  response: response;
}
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
  LIST_CREDITS: "/api/credits/",
  CREATE_CREDIT: "/api/credits/",
  VOID_CREDIT: (creditId) => `/api/credits/${creditId}/void/`,
  UPDATE_CREDIT: (creditId) => `/api/credits/${creditId}/update`,
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
  listCredits = "listCredits",
  createCredit = "createCredit",
  voidCredit = "voidCredit",
  updateCredit = "updateCredit",
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
  startDate: Date;
  endDate?: Date;
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

export interface ListCreditsParams {
  customerId: string;
  status?: "active" | "inactive";
  issuedBefore?: Date;
  issuedAfter?: Date;
  expiresBefore?: Date;
  expiresAfter?: Date;
  effectiveBefore?: Date;
  effectiveAfter?: Date;
  currencyCode?: string;
}

export interface CreateCreditParams {
  customerId: string;
  amount: number;
  currencyCode: string;
  description?: string;
  expiresAt?: Date;
  effectiveAt?: Date;
  amountPaid?: number;
  amountPaidCurrencyCode?: string;
}

export interface VoidCreditParams {
  creditId: string;
}
export interface UpdateCreditParams {
  description?: string;
  expiresAt?: Date;
  creditId: string;
}
