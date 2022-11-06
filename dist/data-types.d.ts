export declare enum REQUEST_TYPES {
    GET = "GET",
    POST = "POST",
    PATCH = "PATCH"
}
export declare enum ValidateEventType {
    createCustomer = "createCustomer",
    trackEvent = "trackEvent",
    customerDetails = "customerDetails",
    createSubscription = "createSubscription",
    cancelSubscription = "cancelSubscription",
    changeSubscription = "changeSubscription",
    subscriptionDetails = "subscriptionDetails",
    customerAccess = "customerAccess"
}
export interface CreateCustomerParams {
    customerName: string;
    customerId?: string;
    currency?: string;
    balance?: string;
}
