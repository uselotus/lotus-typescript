import {
    CancelSubscriptionParams,
    ChangeSubscriptionParams,
    CreateCustomerParams,
    CreateSubscriptionParams,
    CustomerAccessParams,
    CustomerDetailsParams,
    SubscriptionDetailsParams,
    ValidateEventType,
    TrackEvent,
} from "./data-types";

/**
 * Validate an event.
 */

export function eventValidation(event, type) {
    switch (type) {
        case ValidateEventType.createCustomer:
            return validateCreateCustomerEvent(event)
        case ValidateEventType.customerDetails:
            return validateCustomerDetailsEvent(event)
        case ValidateEventType.createSubscription:
            return validateCreateSubscriptionEvent(event)
        case ValidateEventType.cancelSubscription:
            return validateCancelSubscriptionEvent(event)
        case ValidateEventType.changeSubscription:
            return validateChangeSubscriptionEvent(event)
        case ValidateEventType.subscriptionDetails:
            return validateSubscriptionDetailsEvent(event)
        case ValidateEventType.customerAccess:
            return validateCustomerAccessEvent(event)
        case ValidateEventType.trackEvent:
            return validateTrackEventEvent(event)
        default:
            throw new Error("Invalid Event Type")
    }
}

/**
 * Validate a "CreateCustomer" event.
 */
function validateCreateCustomerEvent(event:CreateCustomerParams) {
    if (!event.customerName) {
        throw new Error("Customer Name is a required key")
    }

    if (typeof event.customerName !== "string") {
        throw new Error("Customer Name Should be a string")
    }
}

/**
 * Validate a "CustomerDetails" event.
 */
function validateCustomerDetailsEvent(event:CustomerDetailsParams) {
    if (!event.customerId) {
        throw new Error("customerId is a required key")
    }
}

/**
 * Validate a "CreateSubscription" event.
 */
function validateCreateSubscriptionEvent(event:CreateSubscriptionParams) {
    if (!event.customerId) {
        throw new Error("customerId is a required key")
    }

    if (!event.planId) {
        throw new Error("planId is a required key")
    }

    if (!event.startDate) {
        throw new Error("startDate is a required key")
    }
}

/**
 * Validate a "CancelSubscription" event.
 */
function validateCancelSubscriptionEvent(event:CancelSubscriptionParams) {
    const subscriptionId = event.subscriptionId;
    const turnOffAutoRenew = event.turnOffAutoRenew;
    const replaceImmediatelyType = event.replaceImmediatelyType;

    if (!subscriptionId) {
        throw new Error("subscription_id is a required key")
    }

    if (turnOffAutoRenew &&  replaceImmediatelyType) {
        throw new Error("Must provide either turnOffAutoRenew or replaceImmediatelyType")
    }

    if(!turnOffAutoRenew) {
        const types = [
            "end_current_subscription_and_bill",
            "end_current_subscription_dont_bill",
        ]
        if(!types.includes(replaceImmediatelyType)) {
            throw new Error("replaceImmediatelyType must be one of 'end_current_subscription_and_bill', 'end_current_subscription_dont_bill'")
        }
    }
}

/**
 * Validate a "ChangeSubscription" event.
 */
function validateChangeSubscriptionEvent(event:ChangeSubscriptionParams) {
    if (!event.subscriptionId) {
        throw new Error("subscriptionId is a required key")
    }

    if (!event.planId) {
        throw new Error("planId is a required key")
    }

    const replace_immediately_type = event.replaceImmediatelyType

    const types = [
        "end_current_subscription_and_bill",
        "end_current_subscription_dont_bill",
        "change_subscription_plan"
    ]

    if(!replace_immediately_type) {
        throw new Error("replaceImmediatelyType is a required key")
    }

    if(!types.includes(replace_immediately_type)) {
        throw new Error("Invalid replace_immediately_type")
    }
}

/**
 * Validate a "SubscriptionDetails" event.
 */
function validateSubscriptionDetailsEvent(event:SubscriptionDetailsParams) {
    if (!event.subscriptionId) {
        throw new Error("subscription_id is a required key")
    }
}

/**
 * Validate a "Customer Access" event.
 */
function validateCustomerAccessEvent(event:CustomerAccessParams) {
    if (!event.customerId) {
        throw new Error("customerId is a required key")
    }

    if (!event.eventLimitType) {
        throw new Error("eventLimitType is a required key")
    }

    if (event.eventName && event.featureName) {
        throw new Error("Can't provide both featureName and eventName")
    }

    if (!event.eventName && !event.featureName) {
        throw new Error("Must provide featureName or eventName")
    }
}


/**
 * Validate a "trackEvent" event.
 */
function validateTrackEventEvent(event:TrackEvent) {
    if (!event.customerId) {
        throw new Error("customerId is a required key")
    }

    if (!event.eventName) {
        throw new Error("eventName is a required key")
    }
}
