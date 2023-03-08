import { AxiosError, AxiosResponse } from "axios";
import { components, operations } from "./types";

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
  VOID_CREDIT: (creditId: string) => `/api/credits/${creditId}/void/`,
  UPDATE_CREDIT: (creditId: string) => `/api/credits/${creditId}/update`,
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

export type CreateCustomerParams =
  components["schemas"]["CustomerCreateRequest"];

export interface CustomerDetailsParams {
  customer_id: string;
}

export type CreateSubscriptionParams =
  components["schemas"]["SubscriptionRecordCreateRequest"];

export type PlanDetailsParams =
  operations["api_plans_retrieve"]["parameters"]["path"];

export type CustomerMetricAccessParams =
  operations["api_customer_metric_access_list"]["parameters"]["query"];

export type CustomerFeatureAccess =
  operations["api_customer_feature_access_list"]["parameters"]["query"];

export type TrackEventEntity = components["schemas"]["Event"];

export type TrackEvent = components["schemas"]["BatchEventRequest"];

export type ListAllSubscriptionsParams =
  operations["api_subscriptions_list"]["parameters"]["query"];

export type CancelSubscriptionParams =
  | components["schemas"]["SubscriptionRecordCancelRequest"] &
      operations["api_subscriptions_cancel_create"]["parameters"]["query"];

export type ChangeSubscriptionParams =
  | components["schemas"]["SubscriptionRecordUpdateRequest"] &
      operations["api_subscriptions_update_create"]["parameters"]["query"];

export type GetPlanParams =
  operations["api_plans_retrieve"]["parameters"]["path"];

export type ListCreditsParams =
  operations["api_credits_list"]["parameters"]["query"];

export type CreateCreditParams =
  components["schemas"]["CustomerBalanceAdjustmentCreateRequest"];

export type GetInvoicesParams =
  operations["api_invoices_list"]["parameters"]["query"];

export type UpdateCreditParams =
  components["schemas"]["CustomerBalanceAdjustmentUpdateRequest"] &
    operations["api_credits_update_create"]["parameters"]["path"];

export type VoidCreditParams =
  operations["api_credits_void_create"]["parameters"]["path"];
