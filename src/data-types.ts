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
  CREATE_SUBSCRIPTION: "/api/subscriptions/",
  CANCEL_SUBSCRIPTION: (subscription_id) =>
    `/api/subscriptions/${subscription_id}/cancel/`,
  UPDATE_SUBSCRIPTION: (subscription_id) =>
    `/api/subscriptions/${subscription_id}/update/`,
  CHANGE_PREPAID_UNITS: (subscription_id, metric_id) =>
    `/api/subscriptions/${subscription_id}/components/${metric_id}/change_prepaid_units/`,
  SWITCH_SUBSCRIPTION: (subscription_id) =>
    `/api/subscriptions/${subscription_id}/switch_plan/`,
  GET_ALL_SUBSCRIPTIONS: "/api/subscriptions/",
  GET_SUBSCRIPTION_DETAILS: (subscriptionId) =>
    `/api/subscriptions/${subscriptionId}/`,
  ATTATCH_ADDON: (subscriptionId) =>
    `/api/subscriptions/${subscriptionId}/addons/attach/`,
  CANCEL_ADDON: (subscriptionId, addonId) =>
    `/api/subscriptions/${subscriptionId}/addons/${addonId}/cancel/`,
  GET_ALL_PLANS: "/api/plans/",
  GET_PLAN_DETAILS: (planId) => `/api/plans/${planId}/`,
  GET_FEATURE_ACCESS: "/api/feature_access/",
  GET_METRIC_ACCESS: "/api/metric_access/",
  TRACK_EVENT: "/api/track/",
  GET_INVOICES: "/api/invoices/",
  GET_INVOICE: (invoiceId: string) => `/api/invoices/${invoiceId}/`,
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
  updateSubscription = "updateSubscription",
  switchSubscription = "switchSubscription",
  attachAddon = "attachAddon",
  cancelAddon = "cancelAddon",
  subscriptionDetails = "subscriptionDetails",
  planDetails = "planDetails",
  listPlans = "listPlans",
  customerMetricAccess = "customerMetricAccess",
  customerFeatureAccess = "customerFeatureAccess",
  createCustomersBatch = "createCustomersBatch",
  getInvoices = "getInvoices",
  listCredits = "listCredits",
  createCredit = "createCredit",
  voidCredit = "voidCredit",
  updateCredit = "updateCredit",
  listSubscriptions = "listSubscriptions",
  changePrepaidUnits = "changePrepaidUnits",
  getInvoice = "getInvoice",
}

export type CreateCustomerParams =
  components["schemas"]["CustomerCreateRequest"];

export interface CustomerDetailsParams {
  customer_id: string;
}

export type ListAllPlansParams = operations["api_plans_list"]["parameters"];

export type CreateSubscriptionParams =
  components["schemas"]["SubscriptionRecordCreateRequest"];

export type PlanDetailsParams =
  operations["api_plans_retrieve"]["parameters"]["path"];

export type CustomerMetricAccessParams =
  operations["api_metric_access_retrieve"]["parameters"]["query"];

export type CustomerFeatureAccess =
  operations["api_feature_access_retrieve"]["parameters"]["query"];

export type TrackEventEntity = components["schemas"]["EventRequest"];

export type TrackEvent = components["schemas"]["BatchEventRequest"];

export type ListAllSubscriptionsParams =
  operations["api_subscriptions_list"]["parameters"]["query"];

export type CancelSubscriptionParams =
  | components["schemas"]["SubscriptionRecordCancelRequest"] &
      operations["api_subscriptions_cancel_create_2"]["parameters"]["path"];

export type AttachAddonParams =
  | components["schemas"]["AddOnSubscriptionRecordCreateRequest"] &
      operations["api_subscriptions_addons_attach_create"]["parameters"]["path"];

export type CancelAddonParams =
  operations["api_subscriptions_addons_cancel_create"]["parameters"]["path"];

export type UpdateSubscriptionParams =
  | components["schemas"]["SubscriptionRecordUpdateRequest"] &
      operations["api_subscriptions_update_create_2"]["parameters"]["path"];

export type SwitchSubscriptionParams =
  | components["schemas"]["SubscriptionRecordSwitchPlanRequest"] &
      operations["api_subscriptions_switch_plan_create"]["parameters"]["path"];

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

export type ChangePrepaidUnitsParams =
  operations["api_subscriptions_components_change_prepaid_units_create"]["parameters"]["path"] &
    components["schemas"]["ChangePrepaidUnitsRequest"];

export type GetInvoiceParams =
  operations["api_invoices_retrieve"]["parameters"]["path"];
