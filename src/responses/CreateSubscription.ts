export interface SubscriptionFilter {
    value: string;
    property_name: string;
}

export interface CreateSubscription {
    customer_id: string;
    plan_id: string;
    subscription_filters: SubscriptionFilter[];
}


