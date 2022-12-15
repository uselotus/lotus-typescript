import {subscriptionFilters} from "./data-types";

export interface Customer {
    customer_name: string,
    customer_id: string,
    email: string,
    payment_provider: string,
    properties: any,
    integrations: any,
}

export interface Currency {
    code: string,
    name: string,
    symbol: string
}


export interface LineItems {
    name: string,
    start_date: string,
    end_date: string,
    quantity: number,
    subtotal: number,
    billing_type: string,
    metadata: any,
    plan_version_id: string,
    plan_name: string,
    subscription_filters:subscriptionFilters[]
}

export interface Invoices {
    invoice_number: string,
    cost_due: number,
    currency: Currency,
    issue_date: string,
    payment_status: string,
    cust_connected_to_payment_provider: boolean,
    org_connected_to_cust_payment_provider: boolean,
    external_payment_obj_id: string,
    external_payment_obj_type: string,
    line_items: LineItems[],
    customer: Customer,
    subscription: Subscription,
    due_date: string
}

export interface Subscription {
    subscription_id: string,
    day_anchor: number,
    month_anchor: string,
    customer: {
        customer_name: string,
        "email": string,
        "customer_id": string
    },
    billing_cadence: string,
    start_date: string,
    end_date: string,
    status: string,
    plans: [
        {
            is_new: boolean,
            status: string,
            end_date: string,
            auto_renew: boolean,
            plan_detail: {
                description: string,
                plan_id: string,
                flat_fee_billing_type: string,
                flat_rate: number,
                components: Array<any>,
                features: {
                        feature_name: string,
                        feature_description: string
                    }[],
                price_adjustment: {
                    price_adjustment_name: string,
                    price_adjustment_description: string,
                    price_adjustment_type: string,
                    price_adjustment_amount: number
                },
                usage_billing_frequency: string,
                day_anchor: number,
                month_anchor: number,
                version: number,
                version_id: string,
                active_subscriptions: number,
                created_by: string,
                created_on: string,
                status: string,
                replace_with: number,
                transition_to: string,
                "plan_name": string
            },
            start_date: string,
            subscription_filters: subscriptionFilters[]
        }
    ]
}


export interface CustomerDetails {
    customer_id: string,
    email: string,
    customer_name: string,
    invoices: Invoices[],
    total_amount_due: number,
    next_amount_due: number,
    subscription: Subscription,
    integrations: any,
    default_currency: Currency
}

export interface CreateCustomer {
  customer_name: string,
  customer_id: string,
  email: string,
  payment_provider: string,
  payment_provider_id: string,
  properties: any,
  integrations: any,
  default_currency_code: string,
}

export interface CreateCustomersBatch {
    customers:CreateCustomer[]
}

export interface CreateSubscription {
  start_date: string,
  end_date: string,
  auto_renew: boolean,
  is_new: boolean,
  subscription_filters: subscriptionFilters[],
  status: string,
}

export interface ChangeSubscription {
  replace_plan_invoicing_behavior: string,
  replace_plan_usage_behavior: string,
  turn_off_auto_renew: boolean,
  end_date: string,
}

export interface CustomerFeatureAccess {
    feature: string,
    plan_id: string,
    subscription_filters: subscriptionFilters[],
    access: boolean
}

export interface CustomerMetricAccess {
    event_name: string,
    plan_id: string,
    subscription_filters: subscriptionFilters[]
    has_event: boolean,
    usage_per_metric: {
            metric_name: string,
            metric_id: string,
            metric_usage: number,
            metric_free_limit: number,
            metric_total_limit: number
    }[]

}


