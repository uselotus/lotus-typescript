import { v4 as uuidv4 } from "uuid";
import axios, {AxiosResponse} from "axios";
import axiosRetry from "axios-retry";
import ms from "ms";
import { eventValidation } from "./event-validation";
import { stringify } from "qs";
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
  CancelSubscriptionParams,
  GetInvoicesParams, PlanDetailsParams,
} from "./data-types";
import {
  ChangeSubscription,
  CreateCustomer,
  CreateCustomersBatch,
  CreateSubscription,
  Customer,
  CustomerDetails, CustomerMetricAccess, Invoices, Subscription
} from "./responses";
import * as url from "url";

const noop = () => {};

const setImmediate = (functionToExecute, args?: any) => {
  return functionToExecute(args);
};

const callReq = async (req) => {
  try {
    return await axios(req)
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
};

async function getFirstAlbumTitle() {
  const response = await axios.get("https://jsonplaceholder.typicode.com/albums");
  return response.data[0].title;
}


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
    data?: any,
    params?: any
  ) => {
    if (data) {
      Object.keys(data).forEach((k) => data[k] == null && delete data[k]);
    }

    // if(params) {
    //    Object.keys(params).forEach((p) => params[p] == null && delete data[p]);
    // }

    if (!data && params) {
      return {
        method: method,
        url: this.getRequestUrl(url),
        headers: this.headers,
        params: params,
      };
    }

    if (!params && data) {
      return {
        method: method,
        url: this.getRequestUrl(url),
        headers: this.headers,
        data: data,
      };
    }

    return {
      method: method,
      url: this.getRequestUrl(url),
      params: params,
      body: data,
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
    // axiosRetry(axios, {
    //   retries: options.retryCount || 3,
    //   retryCondition: this._isErrorRetryable,
    //   retryDelay: axiosRetry.exponentialDelay,
    // });
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
      // @ts-ignore
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
  track_event(message, callback) {
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
  async get_customers(): Promise<AxiosResponse<Customer[]>> {
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
   * @return {Object} (customers Details)
   * @param message
   */
  async get_customer_details(message: CustomerDetailsParams) : Promise<AxiosResponse<CustomerDetails>> {
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
  async create_customer(params: CreateCustomerParams): Promise<AxiosResponse<CreateCustomer>> {
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
  async create_customer_batch(params: CreateBatchCustomerParams): Promise<AxiosResponse<CreateCustomersBatch>> {
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
  async create_subscription(params: CreateSubscriptionParams) : Promise<AxiosResponse<CreateSubscription>> {
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

    if (params.subscriptionFilters?.length) {
      data["subscription_filters"] = params.subscriptionFilters?.map((v) => {
        return {
          property_name: v.propertyName,
          value: v.value,
        };
      });
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
   * Delete a Subscription.
   *  @return {Object}
   *  @param params
   *
   */
  async cancel_subscription(params: CancelSubscriptionParams) {
    eventValidation(params, ValidateEventType.cancelSubscription);
    const data = {
      bill_usage: params.billUsage,
      flat_fee_behavior: params.flatFeeBehavior,
      plan_id: params.planId,
      customer_id: params.customerId,
    };

    if (params.subscriptionFilters?.length) {
      data["subscription_filters"] = stringify(
        params.subscriptionFilters?.map((v) => {
          return {
            property_name: v.propertyName,
            value: v.value,
          };
        })
      );
    }
    const req = this.getRequestObject(
      REQUEST_TYPES.DELETE,
      REQUEST_URLS.CANCEL_SUBSCRIPTION,
      null,
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
  async change_subscription(params: ChangeSubscriptionParams): Promise<AxiosResponse<ChangeSubscription>> {
    eventValidation(params, ValidateEventType.changeSubscription);
    const data = {
      plan_id: params.planId || null,
      customer_id: params.customerId || false,
    };

    if (params.subscriptionFilters?.length) {
      data["subscription_filters"] = stringify(
        params.subscriptionFilters?.map((v) => {
          return {
            property_name: v.propertyName,
            value: v.value,
          };
        })
      );
    }

    const newbody = {
      replace_plan_id: params.replacePlanId || null,
      turn_off_auto_renew: params.turnOffAutoRenew || null,
      replace_plan_invoicing_behavior:
        params.replacePlanInvoicingBehavior || null,
      end_date: params.endDate || null,
    };

    const req = this.getRequestObject(
      REQUEST_TYPES.PATCH,
      REQUEST_URLS.CHANGE_SUBSCRIPTION,
      newbody,
      data
    );

    this.setRequestTimeout(req);
    return callReq(req);
  }

  /**
   * Get all subscriptions.
   *
   */
  async get_all_subscriptions(params: ListAllSubscriptionsParams): Promise<AxiosResponse<Subscription[]>> {
    let data;
    if (!!Object.keys(params).length) {
      data = {
        customer_id: params.customerId || null,
        status: params.status || null,
      };
    }

    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_ALL_SUBSCRIPTIONS,
      null,
      data
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
  async get_subscription_details(params: SubscriptionDetailsParams) {
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
  async get_all_plans() {
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_ALL_PLANS
    );
    this.setRequestTimeout(req);
    return callReq(req);
  }


  /**
   * Get plan details. planId
   *
   * @param params
   *
   */
  async get_plan_details(params: PlanDetailsParams) {
    eventValidation(params, ValidateEventType.planDetails);
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_PLAN_DETAILS(params.planId)
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
  async get_customer_feature_access(params: CustomerFeatureAccess) : Promise<AxiosResponse<CustomerFeatureAccess[]>> {
    eventValidation(params, ValidateEventType.customerFeatureAccess);
    const data = {
      customer_id: params.customerId,
      feature_name: params.featureName,
    };
    if (params.subscriptionFilters?.length) {
      data["subscription_filters"] = params.subscriptionFilters?.map((v) => {
        return {
          property_name: v.propertyName,
          value: v.value,
        };
      });
    }
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_CUSTOMER_FEATURE_ACCESS,
      null,
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
  async get_customer_metric_access(params: CustomerMetricAccessParams) : Promise<AxiosResponse<CustomerMetricAccess[]>>{
    eventValidation(params, ValidateEventType.customerMetricAccess);
    const data = {
      customer_id: params.customerId,
      event_name: params.eventName,
    };

    if (params.subscriptionFilters?.length) {
      data["subscription_filters"] = params.subscriptionFilters?.map((v) => {
        return {
          property_name: v.propertyName,
          value: v.value,
        };
      });
    }
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_CUSTOMER_METRIC_ACCESS,
      null,
      data
    );
    this.setRequestTimeout(req);
    return callReq(req);
  }

  /**
   * Get invoices.
   *
   * @param params
   *
   */
  async get_invoices(params: GetInvoicesParams) : Promise<AxiosResponse<Invoices[]>>{
    const data = {
      customer_id: params.customerId || null,
      payment_status: params.paymentStatus || null,
    };
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_INVOICES,
      null,
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
