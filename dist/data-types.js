"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateEventType = exports.REQUEST_TYPES = void 0;
var REQUEST_TYPES;
(function (REQUEST_TYPES) {
    REQUEST_TYPES["GET"] = "GET";
    REQUEST_TYPES["POST"] = "POST";
    REQUEST_TYPES["PATCH"] = "PATCH";
})(REQUEST_TYPES = exports.REQUEST_TYPES || (exports.REQUEST_TYPES = {}));
var ValidateEventType;
(function (ValidateEventType) {
    ValidateEventType["createCustomer"] = "createCustomer";
    ValidateEventType["trackEvent"] = "trackEvent";
    ValidateEventType["customerDetails"] = "customerDetails";
    ValidateEventType["createSubscription"] = "createSubscription";
    ValidateEventType["cancelSubscription"] = "cancelSubscription";
    ValidateEventType["changeSubscription"] = "changeSubscription";
    ValidateEventType["subscriptionDetails"] = "subscriptionDetails";
    ValidateEventType["customerAccess"] = "customerAccess";
})(ValidateEventType = exports.ValidateEventType || (exports.ValidateEventType = {}));
