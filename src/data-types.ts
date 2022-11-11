export enum REQUEST_TYPES  {
    GET = "GET",
    POST = "POST",
    PATCH = "PATCH",
}

export const REQUEST_URLS = {
    GET_CUSTOMERS : "/api/customers/",
    CREATE_CUSTOMERS : "/api/customers/",
    GET_CUSTOMER_DETAIL :(customerId) =>  `/api/customers/${customerId}/`,
    CREATE_SUBSCRIPTION : "/api/subscriptions/",
    CANCEL_SUBSCRIPTION :(subscriptionId) => `/api/subscriptions/${subscriptionId}/`,
    CHANGE_SUBSCRIPTION :(subscriptionId) => `/api/subscriptions/${subscriptionId}/`,
    GET_ALL_SUBSCRIPTIONS : "/api/subscriptions/",
    GET_SUBSCRIPTION_DETAILS :(subscriptionId) => `/api/subscriptions/${subscriptionId}/`,
    GET_ALL_PLANS : "/api/plans/",
    GET_CUSTOMER_ACCESS : "/api/customer_access/",
    TRACK_EVENT : "/api/track/",
}

export enum ValidateEventType  {
    createCustomer = "createCustomer",
    trackEvent = "trackEvent",
    customerDetails = "customerDetails",
    createSubscription = "createSubscription",
    cancelSubscription = "cancelSubscription",
    changeSubscription = "changeSubscription",
    subscriptionDetails = "subscriptionDetails",
    customerAccess = "customerAccess",
}

export interface CreateCustomerParams {
    customerId:string
    email:string
    paymentProvider?:string;
    paymentProviderId?:string;
    customerName?:string;
}

export interface CustomerDetailsParams {
    customerId:string;
}

export interface CreateSubscriptionParams {
    customerId:string;
    planId:string;
    startDate:string;
    endDate?:string;
    status?:string;
    autoRenew?:boolean;
    isNew?:boolean;
    subscriptionId?:string;
}

export interface CancelSubscriptionParams {
    subscriptionId:string;
    turnOffAutoRenew?:boolean;
    replaceImmediatelyType?:string;
}

export interface ChangeSubscriptionParams {
    subscriptionId:string;
    planId:string;
    turnOffAutoRenew?:boolean;
    replaceImmediatelyType?:string;
}

export interface SubscriptionDetailsParams {
    subscriptionId:string;
}

export interface CustomerAccessParams {
    customerId:string;
    eventLimitType:string;
    eventName?:string;
    featureName?:string;
}

export interface TrackEvent {
    eventName:string;
    customerId:string;
    idempotencyId:string;
    timeCreated: Date;
}
