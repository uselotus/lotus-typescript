import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import axiosRetry from "axios-retry";
import ms from "ms";
import { eventValidation } from "./event-validation";
import {
  ValidateEventType,
  CreateCustomerParams,
  CreateBatchCustomerParams,
  REQUEST_TYPES,
  CreateSubscriptionParams,
  ChangeSubscriptionParams,
  SubscriptionDetailsParams,
  CustomerDetailsParams,
  REQUEST_URLS,
  TrackEvent,
  CustomerFeatureAccess,
  CustomerMetricAccessParams,
  ListAllSubscriptionsParams,
  DeleteSubscriptionParams,
} from "./data-types";

const noop = () => {};

const setImmediate = (functionToExecute, args?: any) => {
  return functionToExecute(args);
};

const callReq = async (req) => {
  try {
    return axios(req);
  } catch (error) {
    throw new Error(error);
  }
};

class Lotus {
  private readonly host: any;
  private readonly apiKey: any;
  private readonly timeout: boolean;
  private readonly flushAt: number;
  private readonly flushInterval: any;
  private readonly headers: { "X-API-KEY": any };
  private queue: any[];
  private readonly enable: boolean;
  private timer: number;

  private getRequestObject = (
    method: REQUEST_TYPES,
    url: string,
    data?: any
  ) => {
    Object.keys(data).forEach((k) => data[k] == null && delete data[k])
    if (!data) {
      return {
        method: method,
        url: this.getRequestUrl(url),
        headers: this.headers,
      };
    }

    return {
      method: method,
      url: this.getRequestUrl(url),
      data,
      headers: this.headers,
    };
  };

  private getRequestUrl = (url: string): string => `${this.host}${url}`;

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
    this.flushInterval =
      typeof options.flushInterval === "number" ? options.flushInterval : 10000;
    this.enable = typeof options.enable === "boolean" ? options.enable : true;
    this.headers = {
      "X-API-KEY": this.apiKey,
    };
    axiosRetry(axios, {
      retries: options.retryCount || 3,
      retryCondition: this._isErrorRetryable,
      retryDelay: axiosRetry.exponentialDelay,
    });
  }

  /**
   * Add a `message` of type `type` to the queue and
   * check whether it should be flushed.
   *
   * @param params
   * @param {Function} [callback] (optional)
   * @api private
   */
  private enqueue(params: TrackEvent, callback) {
    callback = callback || noop;

    if (!this.enable) {
      return setImmediate(callback);
    }

    params.batch.forEach((message) => {
      const data = {
        time_created: message.timeCreated || new Date(),
        idempotency_id: message.idempotencyId || uuidv4(),
        customer_id: message.customerId,
        event_name: message.eventName,
      };
      if (message.properties) {
        data["properties"] = message.properties;
      }
      this.queue.push({ data, callback });
    });

    if (this.queue.length >= this.flushAt) {
      this.flush();
    }

    if (this.flushInterval && !this.timer) {
      this.timer = setTimeout(() => this.flush(), this.flushInterval);
    }
  }

  /**
   * Flush the current queue
   *
   * @param {Function} [callback] (optional)
   * @return {Lotus}
   */
  flush(callback?: any) {
    callback = callback || noop;

    if (!this.enable) {
      return setImmediate(callback);
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (!this.queue.length) {
      return setImmediate(callback);
    }

    const items = this.queue.splice(0, this.flushAt);
    // const callbacks = items.map(item => item.callback)
    // const messages = items.map(item => item.message)

    const data = {
      batch: items.map((item) => item.data),
    };

    // const done = (err?:any) => {
    //     callbacks.forEach((callback) => callback(err))
    //     callback(err, data)
    // }

    const req = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.TRACK_EVENT,
      data
    );

    this.setRequestTimeout(req);
    return callReq(req);
  }

  /**
   * Send a trackEvent `message`.
   *
   * @param {Object} message (Should contain event name and customer id)
   * @param {Function} [callback] (optional)
   * @return {Lotus}
   */
  trackEvent(message, callback) {
    eventValidation(message, ValidateEventType.trackEvent);

    const properties = Object.assign({}, message.properties, {
      $lib: "lotus-node",
    });

    const apiMessage = Object.assign({}, message, { properties });

    this.enqueue(apiMessage, callback);

    return this;
  }

  /**
   * Get All Customers.
   *
   * @return {Object} (Array of customers)
   */
  async getCustomers() {
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_CUSTOMERS
    );
    this.setRequestTimeout(req);
    return callReq(req);
  }

  /**
   * Get Customer Detail.
   *
   * @return {Object}
   * @param message
   */
  async getCustomerDetail(message: CustomerDetailsParams) {
    eventValidation(message, ValidateEventType.customerDetails);
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_CUSTOMER_DETAIL(message.customerId)
    );
    this.setRequestTimeout(req);
    return callReq(req);
  }

  /**
   * Create a new Customer.
   *  @return {Object}
   * @param params
   *
   */
  async createCustomer(params: CreateCustomerParams) {
    eventValidation(params, ValidateEventType.createCustomer);
    const data = {
      customer_id: params.customerId,
      customer_name: params.customerName,
      email: params.email,
      payment_provider: params.paymentProvider,
      payment_provider_id: params.paymentProviderId,
      properties: params.properties,
    };
    const req = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.CREATE_CUSTOMERS,
      data
    );
    this.setRequestTimeout(req);
    return callReq(req);
  }

  /**
   * Create customer batch.
   * @return {Object}
   * @param params
   *
   */
  async createCustomersBatch(params: CreateBatchCustomerParams) {
    eventValidation(params, ValidateEventType.createCustomersBatch);

    const customers = params.customers.map((customer) => {
      return {
        customer_id: customer.customerId,
        customer_name: customer.customerName,
        email: customer.email,
        payment_provider: customer.paymentProvider,
        payment_provider_id: customer.paymentProviderId,
        properties: customer.properties,
      };
    });

    const data = {
      customers: customers,
      behavior_on_existing: params.behaviorOnExisting,
    };

    const req = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.CREATE_BATCH_CUSTOMERS,
      data
    );
    this.setRequestTimeout(req);
    return callReq(req);
  }

  /**
   * Create a new Subscription.
   *  @return {Object}
   *  @param params
   *
   */
  async createSubscription(params: CreateSubscriptionParams) {
    eventValidation(params, ValidateEventType.createSubscription);
    const data = {
      customer_id: params.customerId,
      plan_id: params.planId,
      start_date: params.startDate,
    };
    if (params.endDate) {
      data["end_date"] = params.endDate;
    }
    if (params.status) {
      data["status"] = params.status;
    }
    if (params.autoRenew) {
      data["auto_renew"] = params.autoRenew;
    }
    if (params.isNew) {
      data["is_new"] = params.isNew;
    }
    if (params.subscriptionId) {
      data["subscription_id"] = params.subscriptionId;
    }

    if( params.subscriptionFilters?.length) {
       data["subscription_filters"] = params.subscriptionFilters?.map(v => {
         return {
           property_name: v.propertyName,
           value: v.value,
         }
       })
    }

    const req = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.CREATE_SUBSCRIPTION,
      data
    );
    this.setRequestTimeout(req);
    return callReq(req);
  }

    /**
   * Delete a new Subscription.
   *  @return {Object}
   *  @param params
   *
   */
    async deleteSubscription(params: DeleteSubscriptionParams) {
      eventValidation(params, ValidateEventType.deleteSubscription);
      const data = {
        bill_usage: params.billUsage,
        flat_fee_behavior: params.flatFeeBehavior,
      };
      const req = this.getRequestObject(
          REQUEST_TYPES.DELETE,
          REQUEST_URLS.DELETE_SUBSCRIPTION(params.subscriptionId),
          data
      );
      this.setRequestTimeout(req);
      return callReq(req);
    }

  /**
   * Change a Subscription.
   *
   * @param params
   *
   */
  changeSubscription(params: ChangeSubscriptionParams) {
    eventValidation(params, ValidateEventType.changeSubscription);
    const data = {
      replace_plan_id: params.replacePlanId || null,
      turn_off_auto_renew: params.turnOffAutoRenew || false,
      end_date: params.endDate || null,
    };

    const req = this.getRequestObject(
      REQUEST_TYPES.PATCH,
      REQUEST_URLS.CHANGE_SUBSCRIPTION(params.subscriptionId),
      data
    );

    this.setRequestTimeout(req);
    return callReq(req);
  }

  /**
   * Get all subscriptions.
   *
   */
  async getAllSubscriptions(params:ListAllSubscriptionsParams) {
    let data;
    if(!!Object.keys(params).length) {
      data = {
        customer_id: params.customerId || null,
        plan_id: params.planId || null,
        status: params.status || null,
      }
    }

    const req = this.getRequestObject(
        REQUEST_TYPES.GET,
        REQUEST_URLS.GET_ALL_SUBSCRIPTIONS,
        data || null
    );
    this.setRequestTimeout(req);
    return callReq(req);
  }

  /**
   * Get subscription details. subscription_id
   *
   * @param params
   *
   */
  async getSubscriptionDetails(params: SubscriptionDetailsParams) {
    eventValidation(params, ValidateEventType.subscriptionDetails);
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_SUBSCRIPTION_DETAILS(params.subscriptionId)
    );
    this.setRequestTimeout(req);
    return callReq(req);
  }

  /**
   * Get All plans.
   *
   */
  async getAllPlans() {
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_ALL_PLANS
    );
    this.setRequestTimeout(req);
    return callReq(req);
  }

  /**
   * Get customer feature access.
   *
   * @param params
   *
   */
  async getCustomerFeatureAccess(params: CustomerFeatureAccess){
    eventValidation(params, ValidateEventType.customerFeatureAccess);
    const data = {
      customer_id: params.customerId,
      feature_name: params.featureName,
    };
    if (params.featureName) {
      data["feature_name"] = params.featureName;
    }
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_CUSTOMER_FEATURE_ACCESS,
      data
    );
    this.setRequestTimeout(req);
    return callReq(req);
  }

  /**
   * Get customer access.
   *
   * @param params
   *
   */
  async getCustomerMetricAccess(params: CustomerMetricAccessParams){
    eventValidation(params, ValidateEventType.customerMetricAccess);
    const data = {
      customer_id: params.customerId,
      event_name: params.eventName,
    };
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_CUSTOMER_METRIC_ACCESS,
      data
    );
    this.setRequestTimeout(req);
    return callReq(req);
  }

  _isErrorRetryable(error) {
    // Retry Network Errors.
    if (axiosRetry.isNetworkError(error)) {
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

  private setRequestTimeout = (req) => {
    if (this.timeout) {
      req["timeout"] =
        typeof this.timeout === "string" ? ms(this.timeout) : this.timeout;
    }
  };
}

export { Lotus };
