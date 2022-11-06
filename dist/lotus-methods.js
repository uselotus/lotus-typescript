"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const axios_retry_1 = require("axios-retry");
const ms_1 = require("ms");
const event_validation_1 = require("./event-validation");
const data_types_1 = require("./data-types");
const makeReq = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, axios_1.default)(req);
        return response.data;
    }
    catch (error) {
        throw new Error(error);
    }
});
class Lotus {
    /**
     * Initialize a new `Lotus` with your Lotus organization's `apiKey` and an
     * optional dictionary of `options`.
     *
     * @param {String} apiKey
     * @param {Object} [options] (optional)
     *   @property {Number} flushAt (default: 20)
     *   @property {Number} flushInterval (default: 10000)
     *   @property {String} host (default: 'https://www.uselotus.app/')
     *   @property {Boolean} enable (default: true)
     */
    constructor(apiKey, options) {
        options = options || {};
        if (!apiKey) {
            throw new Error("Api Key is required");
        }
        this.queue = [];
        this.apiKey = apiKey;
        const host_url = options.host || "https://api.uselotus.io/";
        this.host = host_url.replace(/\/$/, "");
        this.timeout = options.timeout || false;
        this.flushAt = Math.max(options.flushAt, 1) || 20;
        this.flushInterval = typeof options.flushInterval === 'number' ? options.flushInterval : 10000;
        Object.defineProperty(this, 'enable', {
            configurable: false,
            writable: false,
            enumerable: true,
            value: typeof options.enable === 'boolean' ? options.enable : true,
        });
        this.headers = {
            'X-API-KEY': this.apiKey,
        };
        (0, axios_retry_1.default)(axios_1.default, {
            retries: options.retryCount || 3,
            retryCondition: this._isErrorRetryable,
            retryDelay: axios_retry_1.default.exponentialDelay,
        });
    }
    /**
      * Create a new Customer.
      * @param {CreateCustomerParams} params
      *
     */
    createCustomer(params) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, event_validation_1.eventValidation)(params, data_types_1.ValidateEventType.createCustomer);
            const data = {
                customer_id: params.customerId,
                customer_name: params.customerName,
                balance: params.balance,
                currency: params.currency,
            };
            const req = {
                method: data_types_1.REQUEST_TYPES.POST,
                url: `${this.host}/api/customers/`,
                data: data,
                headers: this.headers,
            };
            if (this.timeout) {
                req["timeout"] = typeof this.timeout === 'string' ? (0, ms_1.default)(this.timeout) : this.timeout;
            }
            return makeReq(req);
        });
    }
    //
    //     /**
    //      * Send a trackEvent `message`.
    //      *
    //      * @param {Object} message (Should contain event name and customer id)
    //      * @param {Function} [callback] (optional)
    //      * @return {Lotus}
    //      */
    //     trackEvent(message, callback) {
    //         eventValidation(message, ValidateEventType.trackEvent)
    //
    //         const properties = Object.assign({}, message.properties, {
    //             $lib: 'lotus-node',
    //         })
    //
    //         const apiMessage = Object.assign({}, message, { properties })
    //
    //         this.enqueue('trackEvent', apiMessage, callback)
    //
    //         return this
    //     }
    //
    //     /**
    //      * Get All Customers.
    //      *
    //      * @return {Object} (Array of customers)
    //      */
    //     async getCustomers() {
    //         const headers = {
    //             'X-API-KEY': this.apiKey,
    //         }
    //         const req = {
    //             method: 'GET',
    //             url: `${this.host}/api/customers/`,
    //             headers,
    //         }
    //
    //         if (this.timeout) {
    //             req.timeout = typeof this.timeout === 'string' ? ms(this.timeout) : this.timeout
    //         }
    //
    //         return axiosTest(req)
    //     }
    //
    //     /**
    //      * Get Customer Detail.
    //      *
    //      * @param {Object} message
    //      * @return {Object}
    //      */
    //     async getCustomerDetail(message) {
    //         eventValidation(message, ValidateEventType.customerDetails)
    //
    //         message.customer_id = message.customerId || message.customer_id
    //         delete message.customerId;
    //
    //         const headers = {
    //             'X-API-KEY': this.apiKey,
    //         }
    //         const req = {
    //             method: 'GET',
    //             url: `${this.host}/api/customer_detail/?customer_id=${message.customer_id}`,
    //             headers,
    //         }
    //
    //         if (this.timeout) {
    //             req.timeout = typeof this.timeout === 'string' ? ms(this.timeout) : this.timeout
    //         }
    //
    //         return axiosTest(req)
    //     }
    //
    //     /**
    //      * Create a new Subscription.
    //      *
    //      * @param {Object} message
    //      *
    //      */
    //     createSubscription(message) {
    //         eventValidation(message, ValidateEventType.createSubscription)
    //         message = Object.assign({}, message)
    //         message.library = 'lotus-node'
    //         const headers = {
    //             'X-API-KEY': this.apiKey,
    //         }
    //
    //         const data = {
    //             customer_id: message.customer_id || message.customerId,
    //             plan_id: message.plan_id || message.planId,
    //             start_date: message.start_date || message.startDate,
    //         }
    //
    //         if (message.end_date) {
    //             data.end_date = message.end_date
    //         }
    //         if (message.status) {
    //             data.status = message.status
    //         }
    //         if (message.auto_renew) {
    //             data.auto_renew = message.auto_renew
    //         }
    //         if (message.is_new) {
    //             data.is_new = message.is_new
    //         }
    //         if (message.subscription_id) {
    //             data.subscription_id = message.subscription_id
    //         }
    //
    //         const req = {
    //             method: 'POST',
    //             url: `${this.host}/api/subscriptions/`,
    //             data,
    //             headers,
    //         }
    //         if (this.timeout) {
    //             req.timeout = typeof this.timeout === 'string' ? ms(this.timeout) : this.timeout
    //         }
    //         return axiosTest(req)
    //     }
    //
    //     /**
    //      * Cancel a Subscription.
    //      *
    //      * @param {Object} message
    //      *
    //      */
    //     cancelSubscription(message) {
    //         eventValidation(message, ValidateEventType.cancelSubscription)
    //         message = Object.assign({}, message)
    //         message.library = 'lotus-node'
    //         const headers = {
    //             'X-API-KEY': this.apiKey,
    //         }
    //
    //         const data = {}
    //         const turn_off_auto_renew = message["turn_off_auto_renew"]
    //         const replace_immediately_type = message["replace_immediately_type"]
    //
    //         if (turn_off_auto_renew) {
    //             data["auto_renew"] = false
    //         }else {
    //             data["status"] = "ended"
    //             data["replace_immediately_type"] = replace_immediately_type
    //         }
    //
    //         const req = {
    //             method: 'PATCH',
    //             url: `${this.host}/api/subscriptions/${message.subscription_id}/`,
    //             data,
    //             headers,
    //         }
    //         if (this.timeout) {
    //             req.timeout = typeof this.timeout === 'string' ? ms(this.timeout) : this.timeout
    //         }
    //         return axiosTest(req)
    //     }
    //
    //     /**
    //      * Change a Subscription.
    //      *
    //      * @param {Object} message
    //      *
    //      */
    //     changeSubscription(message) {
    //         eventValidation(message, ValidateEventType.changeSubscription)
    //         message = Object.assign({}, message)
    //         message.library = 'lotus-node'
    //         const headers = {
    //             'X-API-KEY': this.apiKey,
    //         }
    //
    //         const turn_off_auto_renew = message["turn_off_auto_renew"]
    //         const replace_immediately_type = message["replace_immediately_type"]
    //
    //         const data = {
    //             "plan_id": message.plan_id,
    //             "replace_immediately_type": replace_immediately_type,
    //             "turn_off_auto_renew": turn_off_auto_renew,
    //         }
    //         const req = {
    //             method: 'PATCH',
    //             url: `${this.host}/api/subscriptions/${message.subscription_id}/`,
    //             data,
    //             headers,
    //         }
    //         if (this.timeout) {
    //             req.timeout = typeof this.timeout === 'string' ? ms(this.timeout) : this.timeout
    //         }
    //         return axiosTest(req)
    //     }
    //
    //     /**
    //      * Get all subscriptions.
    //      *
    //      * @param {Object} message
    //      *
    //      */
    //     async getAllSubscriptions(message) {
    //         message = Object.assign({}, message)
    //         message.library = 'lotus-node'
    //         const headers = {
    //             'X-API-KEY': this.apiKey,
    //         }
    //         const req = {
    //             method: 'GET',
    //             url: `${this.host}/api/subscriptions/`,
    //             headers,
    //         }
    //         if (this.timeout) {
    //             req.timeout = typeof this.timeout === 'string' ? ms(this.timeout) : this.timeout
    //         }
    //         return axiosTest(req)
    //     }
    //
    //     /**
    //      * Get subscription details. subscription_id
    //      *
    //      * @param {Object} message
    //      *
    //      */
    //     async getSubscriptionDetails(message) {
    //         eventValidation(message, ValidateEventType.subscriptionDetails)
    //         message = Object.assign({}, message)
    //         message.library = 'lotus-node'
    //         const headers = {
    //             'X-API-KEY': this.apiKey,
    //         }
    //
    //         message.subscription_id = message.subscriptionId || message.subscription_id
    //         delete message.subscriptionId;
    //         const req = {
    //             method: 'GET',
    //             url: `${this.host}/api/subscriptions/${message.subscription_id}`,
    //             headers,
    //         }
    //         if (this.timeout) {
    //             req.timeout = typeof this.timeout === 'string' ? ms(this.timeout) : this.timeout
    //         }
    //         return axiosTest(req)
    //     }
    //
    //     /**
    //      * Get All plans.
    //      *
    //      * @param {Object} message
    //      *
    //      */
    //     async getAllPlans(message) {
    //         message = Object.assign({}, message)
    //         message.library = 'lotus-node'
    //         const headers = {
    //             'X-API-KEY': this.apiKey,
    //         }
    //
    //         const req = {
    //             method: 'GET',
    //             url: `${this.host}/api/plans/`,
    //             headers,
    //         }
    //         if (this.timeout) {
    //             req.timeout = typeof this.timeout === 'string' ? ms(this.timeout) : this.timeout
    //         }
    //
    //         return axiosTest(req)
    //     }
    //
    //     /**
    //      * Get customer access.
    //      *
    //      * @param {Object} message
    //      *
    //      */
    //     async getCustomerAccess(message) {
    //         eventValidation(message, ValidateEventType.customerAccess)
    //         message = Object.assign({}, message)
    //         message.library = 'lotus-node'
    //
    //         const headers = {
    //             'X-API-KEY': this.apiKey,
    //         }
    //
    //         const params = {
    //             customer_id: message.customer_id,
    //             event_limit_type: message.event_limit_type,
    //         }
    //         if (message.event_name) {
    //             params.event_name = message.event_name
    //         } else if (message.feature_name) {
    //             params.feature_name = message.feature_name
    //         }
    //         const req = {
    //             method: 'GET',
    //             url: `${this.host}/api/customer_access/`,
    //             params,
    //             headers,
    //         }
    //         if (this.timeout) {
    //             req.timeout = typeof this.timeout === 'string' ? ms(this.timeout) : this.timeout
    //         }
    //         return axiosTest(req)
    //     }
    //
    //     /**
    //      * Add a `message` of type `type` to the queue and
    //      * check whether it should be flushed.
    //      *
    //      * @param {String} type
    //      * @param {Object} message
    //      * @param {Function} [callback] (optional)
    //      * @api private
    //      */
    //     enqueue(type, message, callback) {
    //         callback = callback || noop
    //
    //         if (!this.enable) {
    //             return setImmediate(callback)
    //         }
    //
    //         message = Object.assign({}, message)
    //         message.type = type
    //         message.library = 'lotus-node'
    //
    //         message.time_created = message.timeCreated || message.time_created || new Date() ;
    //         message.idempotency_id =  message.idempotencyId || message.idempotency_id || uuidv4();
    //         message.customer_id = message.customerId || message.customer_id
    //         message.event_name = message.eventName || message.event_name
    //
    //         delete message.timeCreated;
    //         delete message.idempotencyId;
    //         delete message.customerId;
    //         delete message.eventName;
    //
    //         this.queue.push({ message, callback })
    //
    //         if (this.queue.length >= this.flushAt) {
    //             this.flush()
    //         }
    //
    //         if (this.flushInterval && !this.timer) {
    //             this.timer = setTimeout(() => this.flush(), this.flushInterval)
    //         }
    //     }
    //
    //     /**
    //      * Flush the current queue
    //      *
    //      * @param {Function} [callback] (optional)
    //      * @return {Lotus}
    //      */
    //     flush(callback) {
    //         callback = callback || noop
    //
    //         if (!this.enable) {
    //             return setImmediate(callback)
    //         }
    //
    //         if (this.timer) {
    //             clearTimeout(this.timer)
    //             this.timer = null
    //         }
    //
    //         if (!this.queue.length) {
    //             return setImmediate(callback)
    //         }
    //
    //         const items = this.queue.splice(0, this.flushAt)
    //         const callbacks = items.map((item) => item.callback)
    //         const messages = items.map((item) => item.message)
    //
    //         const data = {
    //             batch: messages,
    //         }
    //
    //         const done = (err) => {
    //             callbacks.forEach((callback) => callback(err))
    //             callback(err, data)
    //         }
    //
    //         const headers = {
    //             'X-API-KEY': this.apiKey,
    //         }
    //         if (typeof window === 'undefined') {
    //             headers['user-agent'] = `lotus-node`
    //         }
    //
    //         const req = {
    //             method: 'POST',
    //             url: `${this.host}/api/track/`,
    //             data,
    //             headers,
    //         }
    //
    //         if (this.timeout) {
    //             req.timeout = typeof this.timeout === 'string' ? ms(this.timeout) : this.timeout
    //         }
    //
    //         axios(req)
    //             .then((res) => {
    //                 done()
    //             })
    //             .catch((err) => {
    //                 if (err.response) {
    //                     const error = new Error(err.response.statusText)
    //                     return done(err.response.data)
    //                 }
    //                 done(err)
    //             })
    //     }
    //
    //     shutdown() {
    //         this.flush()
    //     }
    //
    _isErrorRetryable(error) {
        // Retry Network Errors.
        if (axios_retry_1.default.isNetworkError(error)) {
            return true;
        }
        if (!error.response) {
            // Cannot determine if the request can be retried
            return false;
        }
        // Retry Server Errors (5xx).
        if (error.response.status >= 500 && error.response.status <= 599) {
            return true;
        }
        // Retry if rate limited.
        return error.response.status === 429;
    }
}
