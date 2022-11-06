"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventValidation = void 0;
const data_types_1 = require("./data-types");
// Lotus messages can be a maximum of 32 kB.
const MAX_SIZE = 32 << 10;
/**
 * Validate an event.
 */
function eventValidation(event, type) {
    switch (type) {
        case data_types_1.ValidateEventType.createCustomer:
            return validateCreateCustomerEvent(event);
        //
        // case ValidateEventType.trackEvent:
        //     // validateGenericEvent(event)
        //     type = type || event.type
        //     // assert(type, 'You must pass an event type.')
        //     return validateTrackEventEvent(event)
        // case ValidateEventType.customerDetails:
        //     return validateCustomerDetailsEvent(event)
        // case ValidateEventType.createSubscription:
        //     return validateCreateSubscriptionEvent(event)
        // case ValidateEventType.cancelSubscription:
        //     return validateCancelSubscriptionEvent(event)
        // case ValidateEventType.changeSubscription:
        //     return validateChangeSubscriptionEvent(event)
        // case ValidateEventType.subscriptionDetails:
        //     return validateSubscriptionDetailsEvent(event)
        // case ValidateEventType.customerAccess:
        //     return validateCustomerAccessEvent(event)
        default:
            throw new Error("Invalid Event Type");
    }
}
exports.eventValidation = eventValidation;
/**
 * Validate a "CreateCustomer" event.
 */
function validateCreateCustomerEvent(event) {
    if (!event.customerName) {
        throw new Error("Customer Name is a required key");
    }
    if (typeof event.customerName !== "string") {
        throw new Error("Customer Name Should be a string");
    }
}
/**
 * Validate a "trackEvent" event.
 */
function validateTrackEventEvent(event) {
    if (!("event_name" in event || "eventName" in event)) {
        throw new Error("event_name is a required key");
    }
    if (!("customer_id" in event || "customerId" in event)) {
        throw new Error("customer_id is a required key");
    }
}
/**
 * Validate a "CustomerDetails" event.
 */
function validateCustomerDetailsEvent(event) {
    if (!("customer_id" in event || "customerId" in event)) {
        throw new Error("customer_id is a required key");
    }
}
/**
 * Validate a "CreateSubscription" event.
 */
function validateCreateSubscriptionEvent(event) {
    if (!("customer_id" in event || "customerId" in event)) {
        throw new Error("customer_id is a required key");
    }
    if (!("plan_id" in event || "planId" in event)) {
        throw new Error("plan_id is a required key");
    }
    if (!("start_date" in event || "startDate" in event)) {
        throw new Error("start_date is a required key");
    }
}
/**
 * Validate a "CancelSubscription" event.
 */
function validateCancelSubscriptionEvent(event) {
    if (!("subscription_id" in event || "subscriptionId" in event)) {
        throw new Error("subscription_id is a required key");
    }
    const turn_off_auto_renew = event["turn_off_auto_renew"];
    const replace_immediately_type = event["replace_immediately_type"];
    if (turn_off_auto_renew && replace_immediately_type) {
        throw new Error("Must provide either turn_off_auto_renew or replace_immediately_type");
    }
    if (!turn_off_auto_renew) {
        const types = [
            "end_current_subscription_and_bill",
            "end_current_subscription_dont_bill",
        ];
        if (!types.includes(replace_immediately_type)) {
            throw new Error("replace_immediately_type must be one of 'end_current_subscription_and_bill', 'end_current_subscription_dont_bill'");
        }
    }
}
/**
 * Validate a "SubscriptionDetails" event.
 */
function validateSubscriptionDetailsEvent(event) {
    if (!("subscription_id" in event || "subscriptionId" in event)) {
        throw new Error("subscription_id is a required key");
    }
}
/**
 * Validate a "Customer Access" event.
 */
function validateCustomerAccessEvent(event) {
    if (!("customer_id" in event || "customerId" in event)) {
        throw new Error("customer_id is a required key");
    }
    if (!("event_limit_type" in event)) {
        throw new Error("event_limit_type is a required key");
    }
    if (("event_name" in event) && ("feature_name" in event)) {
        throw new Error("Can't provide both event_name and feature_name");
    }
    if (!("event_name" in event) && !("feature_name" in event)) {
        throw new Error("Must provide event_name or feature_name");
    }
}
/**
 * Validate a "ChangeSubscription" event.
 */
function validateChangeSubscriptionEvent(event) {
    if (!("subscription_id" in event || "subscriptionId" in event)) {
        throw new Error("subscription_id is a required key");
    }
    if (!("plan_id" in event)) {
        throw new Error("plan_id is a required key");
    }
    const replace_immediately_type = event["replace_immediately_type"];
    const types = [
        "end_current_subscription_and_bill",
        "end_current_subscription_dont_bill",
        "change_subscription_plan"
    ];
    if (!replace_immediately_type) {
        throw new Error("replace_immediately_type is a required key");
    }
    if (!types.includes(replace_immediately_type)) {
        throw new Error("Invalid replace_immediately_type");
    }
}
/**
 * Validation rules.
 */
// function validateGenericEvent(event) {
//     // assert(type(event) === 'object', 'You must pass a message object.')
//     const json = JSON.stringify(event)
//     // Strings are variable byte encoded, so json.length is not sufficient.
//     // assert(Buffer.byteLength(json, 'utf8') < MAX_SIZE, 'Your message must be < 32 kB.')
//
//     for (var key in genericValidationRules) {
//         var val = event[key]
//         if (!val) continue
//         var rule = genericValidationRules[key]
//         if (type(rule) !== 'array') {
//             rule = [rule]
//         }
//         var a = rule[0] === 'object' ? 'an' : 'a'
//         assert(
//             rule.some(function (e) {
//                 return type(val) === e
//             }),
//             '"' + key + '" must be ' + a + ' ' + join(rule, 'or') + '.'
//         )
//     }
// }
