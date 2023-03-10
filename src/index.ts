import { v4 as uuidv4 } from "uuid";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import axiosRetry from "axios-retry";
import ms from "ms";
import { noop } from "lodash";
import { eventValidation } from "./event-validation";
import { components, components as componentsCamel } from "./types";
import {
  ValidateEventType,
  REQUEST_TYPES,
  CancelSubscriptionParams,
  CustomerDetailsParams,
  REQUEST_URLS,
  TrackEvent,
  resp,
  TrackEventEntity,
  ListAllSubscriptionsParams,
  GetPlanParams,
  ListCreditsParams,
  GetInvoicesParams,
  CreateCreditParams,
  UpdateCreditParams,
  VoidCreditParams,
  CustomerMetricAccessParams,
  CustomerFeatureAccess,
  SwitchSubscriptionParams,
  AttachAddonParams,
  ListAllPlansParams,
  CancelAddonParams,
  UpdateSubscriptionParams,
} from "./data-types";
import { ListCustomerResponse } from "./responses/ListCustomerResponse";
import { CreateSubscription } from "./responses/CreateSubscription";

const setImmediate = (
  functionToExecute: (...args: any[]) => void,
  ...args: any[]
) => {
  return functionToExecute(...args);
};

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

const callReq = async <T = any, C = any>(req: AxiosRequestConfig<C>) => {
  try {
    return axios<T>(req);
  } catch (error) {
    isApiError(error);
  }
};

interface Options {
  flushAt?: number;
  flushInterval?: number;
  host?: string;
  enable?: boolean;
  timeout?: boolean;
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
  constructor(apiKey: string, options: Options = {}) {
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
  }

  private enqueue(
    params: TrackEvent,
    callback: (...args: any[]) => void = noop
  ) {
    if (!this.enable) {
      return setImmediate(callback);
    }

    params.batch.forEach((message) => {
      const data = {
        time_created: new Date(),
        idempotency_id: uuidv4(),
        ...message,
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

  flush(callback: (...args: any[]) => void = noop) {
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

  trackEvent(
    message: TrackEventEntity,
    callback: (...args: any[]) => void = noop
  ) {
    eventValidation(message, ValidateEventType.trackEvent);

    const apiMessage = {
      ...message,
      properties: {
        ...message.properties,
        $lib: "lotus-node",
      },
    };

    this.enqueue(
      {
        batch: [apiMessage],
      },
      callback
    );

    return this;
  }

  async listCustomers() {
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_CUSTOMERS
    );

    this.setRequestTimeout(req);
    return callReq<components["schemas"]["Customer"][]>(req);
  }

  async getCustomer(message: CustomerDetailsParams) {
    eventValidation(message, ValidateEventType.customerDetails);
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_CUSTOMER_DETAIL(message.customer_id)
    );
    this.setRequestTimeout(req);
    return callReq<ListCustomerResponse>(req);
  }

  async createCustomer(
    params: components["schemas"]["CustomerCreateRequest"]
  ): Promise<AxiosResponse<components["schemas"]["Customer"]>> {
    eventValidation(params, ValidateEventType.createCustomer);

    const req = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.CREATE_CUSTOMERS,
      params
    );
    this.setRequestTimeout(req);
    return callReq<components["schemas"]["Customer"]>(req);
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

    const req = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.CREATE_SUBSCRIPTION,
      params
    );
    this.setRequestTimeout(req);
    return callReq<components["schemas"]["SubscriptionRecord"]>(req);
  }

  async cancelSubscription(params: CancelSubscriptionParams) {
    eventValidation(params, ValidateEventType.cancelSubscription);

    const body = {
      flat_fee_behavior: params.flat_fee_behavior || null,
      usage_behavior: params.usage_behavior || null,
      invoicing_behavior: params.invoicing_behavior || null,
    };
    const req = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.CANCEL_SUBSCRIPTION(params.subscription_id),
      body
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
    params: UpdateSubscriptionParams
  ): Promise<AxiosResponse<CreateSubscription>> {
    eventValidation(params, ValidateEventType.updateSubscription);

    const body = {
      turn_off_auto_renew: params.turn_off_auto_renew || null,
      end_date: params.end_date || null,
    };

    const req = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.UPDATE_SUBSCRIPTION(params.subscription_id),
      body
    );

    this.setRequestTimeout(req);
    return callReq(req);
  }

  /**
   * Switch a Subscription Plan.
   */
  async switchSubscription(
    params: SwitchSubscriptionParams
  ): Promise<AxiosResponse<CreateSubscription>> {
    eventValidation(params, ValidateEventType.switchSubscription);

    const body = {
      switch_plan_id: params.switch_plan_id,
      invoicing_behavior: params.invoicing_behavior || null,
      usage_behavior: params.usage_behavior || null,
      component_fixed_charges_initial_units: params,
    };

    const req = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.SWITCH_SUBSCRIPTION(params.subscription_id),
      body
    );

    this.setRequestTimeout(req);
    return callReq(req);
  }

  /**
   * Attach an Addon to a Subscription.
   */
  async attachAddon(
    params: AttachAddonParams
  ): Promise<AxiosResponse<components["schemas"]["AddOnSubscriptionRecord"]>> {
    eventValidation(params, ValidateEventType.attachAddon);

    const body = {
      addon_id: params.addon_id,
      quantity: params.quantity,
    };

    const req = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.ATTATCH_ADDON(params.subscription_id),
      body
    );

    this.setRequestTimeout(req);
    return callReq(req);
  }

  //Add TODO

  /**
   * Attach an Addon to a Subscription.
   */
  async cancelAddon(
    params: CancelAddonParams
  ): Promise<AxiosResponse<components["schemas"]["AddOnSubscriptionRecord"]>> {
    eventValidation(params, ValidateEventType.cancelAddon);

    const req = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.CANCEL_ADDON(params.subscription_id, params.addon_id),
      null
    );

    this.setRequestTimeout(req);
    return callReq(req);
  }

  /**
   * Get all subscriptions.
   *
   */
  async listSubscriptions(
    params: ListAllSubscriptionsParams
  ): Promise<AxiosResponse<components["schemas"]["SubscriptionRecord"][]>> {
    eventValidation(params, ValidateEventType.listSubscriptions);

    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_ALL_SUBSCRIPTIONS,
      null,
      params
    );

    this.setRequestTimeout(req);
    return callReq<components["schemas"]["SubscriptionRecord"][]>(req);
  }

  async listPlans(
    params?: ListAllPlansParams
  ): Promise<AxiosResponse<components["schemas"]["Plan"][]>> {
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_ALL_PLANS,
      null,
      params
    );
    this.setRequestTimeout(req);
    return callReq<components["schemas"]["Plan"][]>(req);
  }

  async getPlan(
    params: GetPlanParams
  ): Promise<AxiosResponse<components["schemas"]["Plan"]>> {
    eventValidation(params, ValidateEventType.planDetails);

    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_PLAN_DETAILS(params.plan_id),
      null,
      params
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
    params: CustomerFeatureAccess
  ): Promise<AxiosResponse<components["schemas"]["GetFeatureAccess"][]>> {
    eventValidation(params, ValidateEventType.customerFeatureAccess);

    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_FEATURE_ACCESS,
      null,
      params
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
  async getMetricAccess(
    params: CustomerMetricAccessParams
  ): Promise<AxiosResponse<components["schemas"]["GetEventAccess"][]>> {
    eventValidation(params, ValidateEventType.customerMetricAccess);

    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_METRIC_ACCESS,
      null,
      params
    );
    this.setRequestTimeout(req);
    return callReq<components["schemas"]["GetEventAccess"][]>(req);
  }

  async voidCredit(
    req: VoidCreditParams
  ): Promise<
    AxiosResponse<components["schemas"]["CustomerBalanceAdjustment"]>
  > {
    eventValidation(req, ValidateEventType.voidCredit);

    const request = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.VOID_CREDIT(req.credit_id)
    );
    this.setRequestTimeout(request);
    return callReq<components["schemas"]["CustomerBalanceAdjustment"]>(request);
  }

  async updateCredit(
    req: UpdateCreditParams
  ): Promise<
    AxiosResponse<components["schemas"]["CustomerBalanceAdjustment"]>
  > {
    eventValidation(req, ValidateEventType.updateCredit);

    const request = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.UPDATE_CREDIT(req.credit_id),
      req
    );
    this.setRequestTimeout(request);
    return callReq<components["schemas"]["CustomerBalanceAdjustment"]>(request);
  }

  async createCredit(
    req: CreateCreditParams
  ): Promise<
    AxiosResponse<components["schemas"]["CustomerBalanceAdjustment"]>
  > {
    eventValidation(req, ValidateEventType.createCredit);

    const request = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.CREATE_CREDIT,
      req
    );
    this.setRequestTimeout(request);
    return callReq<components["schemas"]["CustomerBalanceAdjustment"]>(request);
  }

  async listInvoices(
    params: GetInvoicesParams
  ): Promise<AxiosResponse<components["schemas"]["Invoice"][]>> {
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_INVOICES,
      params
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

  async listCredits(
    params: ListCreditsParams
  ): Promise<
    AxiosResponse<components["schemas"]["CustomerBalanceAdjustment"][]>
  > {
    eventValidation(params, ValidateEventType.listCredits);
    const request = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.LIST_CREDITS,
      null,
      params
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
