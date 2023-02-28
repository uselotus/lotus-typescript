import { v4 as uuidv4 } from "uuid";
import axios, { AxiosResponse } from "axios";
import axiosRetry from "axios-retry";
import ms from "ms";
import { eventValidation } from "./event-validation";
import { components, operations } from "./types-camel";
import { components as componentsCamel } from "./types";
import {
  ValidateEventType,
  REQUEST_TYPES,
  ChangeSubscriptionParams,
  SubscriptionDetailsParams,
  CustomerDetailsParams,
  REQUEST_URLS,
  TrackEvent,
  resp,
} from "./data-types";
import { ListCustomerResponse } from "./responses/ListCustomerResponse";
import { BatchCustomers } from "./responses/BatchCustomers";
import { CreateSubscription } from "./responses/CreateSubscription";

const noop = () => {};

const setImmediate = (functionToExecute, args?: any) => {
  return functionToExecute(args);
};

async function wrapResponse<T>(
  response: AxiosResponse<T>
): Promise<AxiosResponse<T>> {
  const data = response.data;
  const camelData = convertKeysToCamelCase(data);
  return { ...response, data: camelData };
}

function convertKeysToCamelCase<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map((item) => convertKeysToCamelCase(item)) as T;
  }

  if (typeof data === "object" && data !== null) {
    const newData = {};
    for (const key of Object.keys(data)) {
      const camelKey = key.replace(/_([a-z])/g, (match, p1) =>
        p1.toUpperCase()
      );
      newData[camelKey] = convertKeysToCamelCase(data[key]);
    }
    return newData as T;
  }

  return data;
}
function isApiError(x: any): x is resp {
  console.log(x.response.data);
  if (x && typeof x === "object" && "response" in x) {
    if ("data" in x.response) {
      let error = x as resp;
      throw new Error(error.response.data.detail);
    }
  }
  throw new Error(x as string);
}
async function callReq<T>(req) {
  try {
    const response = await axios(req);
    return wrapResponse<T>(response);
  } catch (error) {
    isApiError(error);
  }
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

  private getRequestObject<T = any | undefined>(
    method: REQUEST_TYPES,
    url: string,
    data?: T,
    params?: any
  ) {
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
      data: data,
      headers: this.headers,
    };
  }

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
  trackEvent(message, callback) {
    eventValidation(message, ValidateEventType.trackEvent);

    const properties = Object.assign({}, message.properties, {
      $lib: "lotus-node",
    });

    const apiMessage = Object.assign({}, message, { properties });

    this.enqueue(apiMessage, callback);

    return this;
  }

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
  async listCustomers(): Promise<
    AxiosResponse<components["schemas"]["Customer"][]>
  > {
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_CUSTOMERS
    );

    this.setRequestTimeout(req);
    return callReq<components["schemas"]["Customer"][]>(req);
  }

  /**
   * Get Customer Detail.
   *
   * @return {Object} (customers Details)
   * @param message
   */
  async getCustomer(
    message: CustomerDetailsParams
  ): Promise<AxiosResponse<ListCustomerResponse>> {
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
  async createCustomer(
    params: components["schemas"]["CustomerCreateRequest"]
  ): Promise<AxiosResponse<components["schemas"]["Customer"]>> {
    eventValidation(params, ValidateEventType.createCustomer);
    const data: componentsCamel["schemas"]["CustomerCreateRequest"] = {
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
    return callReq<components["schemas"]["Customer"]>(req);
  }

  /**
   * Create customer batch.
   * @return {Object}
   * @param params
   *
   */
  async createBatchCustomer(params: {
    customers: components["schemas"]["CustomerCreateRequest"][];
    behaviorOnExisting: boolean;
  }): Promise<AxiosResponse<BatchCustomers>> {
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
    return callReq<BatchCustomers>(req);
  }

  /**
   * Create a new Subscription.
   *  @return {Object}
   *  @param params
   *
   */
  async createSubscription(
    params: components["schemas"]["SubscriptionRecordCreateRequest"]
  ): Promise<AxiosResponse<components["schemas"]["SubscriptionRecord"]>> {
    eventValidation(params, ValidateEventType.createSubscription);
    const data = {
      customer_id: params.customerId,
      plan_id: params.planId,
      start_date: params.startDate,
    };
    if (params.endDate) {
      data["end_date"] = params.endDate;
    }
    if (params.autoRenew) {
      data["auto_renew"] = params.autoRenew;
    }
    if (params.isNew) {
      data["is_new"] = params.isNew;
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
    return callReq<components["schemas"]["SubscriptionRecord"]>(req);
  }

  /**
   * Delete a Subscription.
   *  @return {Object}
   *  @param params
   *
   */
  async cancelSubscription(
    params: operations["apiSubscriptionsCancelCreate"]["parameters"]["query"] &
      components["schemas"]["SubscriptionRecordCancelRequest"]
  ) {
    eventValidation(params, ValidateEventType.cancelSubscription);
    const data = {
      plan_id: params.planId,
      customer_id: params.customerId,
    };

    if (params.subscriptionFilters?.length) {
      data["subscription_filters"] = [];
      params.subscriptionFilters.forEach((v) => {
        data["subscription_filters"].push(
          JSON.stringify({
            property_name: v.propertyName,
            value: v.value,
          })
        );
      });
    }

    const body: componentsCamel["schemas"]["SubscriptionRecordCancelRequest"] =
      {
        flat_fee_behavior: params.flatFeeBehavior as
          | "refund"
          | "charge_prorated"
          | ""
          | "charge_full",
        usage_behavior: params.usageBehavior as "bill_full" | "bill_none",
        invoicing_behavior: params.invoicingBehavior as
          | "add_to_next_invoice"
          | "invoice_now",
      };
    const req = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.CANCEL_SUBSCRIPTION,
      body,
      data
    );

    this.setRequestTimeout(req);
    return callReq<components["schemas"]["SubscriptionRecord"]>(req);
  }

  /**
   * Change a Subscription.
   *
   * @param params
   *
   */
  async updateSubscription(
    params: ChangeSubscriptionParams
  ): Promise<AxiosResponse<CreateSubscription>> {
    eventValidation(params, ValidateEventType.changeSubscription);
    const data = {
      plan_id: params.planId || null,
      customer_id: params.customerId || false,
    };

    if (params.subscriptionFilters?.length) {
      data["subscription_filters"] = [];
      params.subscriptionFilters.forEach((v) => {
        data["subscription_filters"].push(
          JSON.stringify({
            property_name: v.propertyName,
            value: v.value,
          })
        );
      });
    }

    const body = {
      replace_plan_id: params.replacePlanId || null,
      invoicing_behavior: params.invoicingBehavior || null,
      usage_behavior: params.usageBehavior || null,
      turn_off_auto_renew: params.turnOffAutoRenew || null,
      end_date: params.endDate || null,
    };

    const req = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.CHANGE_SUBSCRIPTION,
      body,
      data
    );

    this.setRequestTimeout(req);
    return callReq(req);
  }

  /**
   * Get all subscriptions.
   *
   */
  async listSubscriptions(
    params: operations["apiSubscriptionsList"]["parameters"]["query"]
  ): Promise<AxiosResponse<components["schemas"]["SubscriptionRecord"][]>> {
    eventValidation(params, ValidateEventType.listSubscriptions);
    let data;
    if (!!Object.keys(params).length) {
      data = {
        customer_id: params.customerId,
        status: params.status || [],
        range_start: params.rangeStart || null,
        range_end: params.rangeEnd || null,
        plan_id: params.planId || null,
      };
    }

    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_ALL_SUBSCRIPTIONS,
      null,
      data
    );
    this.setRequestTimeout(req);
    return callReq<components["schemas"]["SubscriptionRecord"][]>(req);
  }

  /**
   * Get subscription details. subscription_id
   *
   * @param params
   *
   */
  async getSubscription(params: SubscriptionDetailsParams) {
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
  async listPlans(): Promise<AxiosResponse<components["schemas"]["Plan"][]>> {
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_ALL_PLANS
    );
    this.setRequestTimeout(req);
    return callReq<components["schemas"]["Plan"][]>(req);
  }

  /**
   * Get plan details. planId
   *
   * @param params
   *
   */
  async getPlan(
    params: operations["apiPlansRetrieve"]["parameters"]["path"]
  ): Promise<AxiosResponse<components["schemas"]["Plan"]>> {
    eventValidation(params, ValidateEventType.planDetails);
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_PLAN_DETAILS(params.planId)
    );
    this.setRequestTimeout(req);
    return callReq<components["schemas"]["Plan"]>(req);
  }

  /**
   * Get customer feature access.
   *
   * @param params
   *
   */
  async getCustomerFeatureAccess(
    params: operations["apiCustomerFeatureAccessList"]["parameters"]["query"]
  ): Promise<AxiosResponse<components["schemas"]["GetFeatureAccess"][]>> {
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
    return callReq<components["schemas"]["GetFeatureAccess"][]>(req);
  }

  /**
   * Get customer access.
   *
   * @param params
   *
   */
  async getCustomerMetricAccess(
    params: operations["apiCustomerMetricAccessList"]["parameters"]["query"]
  ): Promise<AxiosResponse<components["schemas"]["GetEventAccess"][]>> {
    eventValidation(params, ValidateEventType.customerMetricAccess);
    const data = {
      customer_id: params.customerId,
      event_name: params.eventName || null,
      metric_id: params.metricId || null,
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
    return callReq<components["schemas"]["GetEventAccess"][]>(req);
  }

  /** Void Credit
   * @param req
   */
  async voidCredit(
    req: operations["apiCreditsVoidCreate"]["parameters"]["path"]
  ): Promise<
    AxiosResponse<components["schemas"]["CustomerBalanceAdjustment"]>
  > {
    eventValidation(req, ValidateEventType.voidCredit);

    const request = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.VOID_CREDIT(req.creditId)
    );
    this.setRequestTimeout(request);
    return callReq<components["schemas"]["CustomerBalanceAdjustment"]>(request);
  }

  /**
   * Update Credit
   * @param req
   */
  async updateCredit(
    req: components["schemas"]["CustomerBalanceAdjustmentUpdateRequest"] &
      operations["apiCreditsUpdateCreate"]["parameters"]["path"]
  ): Promise<
    AxiosResponse<components["schemas"]["CustomerBalanceAdjustment"]>
  > {
    eventValidation(req, ValidateEventType.updateCredit);
    const data = {
      description: req.description || null,
      expires_at: req.expiresAt || null,
    };
    const request = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.UPDATE_CREDIT(req.creditId),
      data
    );
    this.setRequestTimeout(request);
    return callReq<components["schemas"]["CustomerBalanceAdjustment"]>(request);
  }

  /**
   * Create credit
   * @param req
   */
  async createCredit(
    req: components["schemas"]["CustomerBalanceAdjustmentCreateRequest"]
  ): Promise<
    AxiosResponse<components["schemas"]["CustomerBalanceAdjustment"]>
  > {
    eventValidation(req, ValidateEventType.createCredit);
    const data = {
      customer_id: req.customerId,
      currency_code: req.currencyCode,
      amount: req.amount,
      description: req.description || null,
      expires_at: req.expiresAt || null,
      effective_at: req.effectiveAt || null,
      amount_paid: req.amountPaid || null,
      amount_paid_currency_code: req.amountPaidCurrencyCode || null,
    };
    const request = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.CREATE_CREDIT,
      data
    );
    this.setRequestTimeout(request);
    return callReq<components["schemas"]["CustomerBalanceAdjustment"]>(request);
  }

  /**
   * Get invoices.
   *
   * @param params
   *
   */
  async listInvoices(
    params: operations["apiInvoicesList"]["parameters"]["query"]
  ): Promise<AxiosResponse<components["schemas"]["Invoice"][]>> {
    const data = {
      customer_id: params.customerId || null,
      payment_status: params.paymentStatus || null,
    };
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_INVOICES,
      data
    );
    this.setRequestTimeout(req);
    return callReq<components["schemas"]["Invoice"][]>(req);
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

  /**
   * List credits
   *
   * @param req
   */
  async listCredits(
    req: operations["apiCreditsList"]["parameters"]["query"]
  ): Promise<
    AxiosResponse<components["schemas"]["CustomerBalanceAdjustment"][]>
  > {
    eventValidation(req, ValidateEventType.listCredits);
    const data = {
      customer_id: req.customerId,
      currency_code: req.currencyCode || null,
      effective_after: req.effectiveAfter || null,
      effective_before: req.effectiveBefore || null,
      status: req.status || null,
      expires_after: req.expiresAfter || null,
      expires_before: req.expiresBefore || null,
      issed_after: req.issuedAfter || null,
      issued_before: req.issuedBefore || null,
    };
    const request = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.LIST_CREDITS,
      null,
      data
    );
    this.setRequestTimeout(request);
    return callReq<components["schemas"]["CustomerBalanceAdjustment"][]>(
      request
    );
  }

  private setRequestTimeout = (req) => {
    if (this.timeout) {
      req["timeout"] =
        typeof this.timeout === "string" ? ms(this.timeout) : this.timeout;
    }
  };
}

export { Lotus };
