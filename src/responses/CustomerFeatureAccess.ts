export interface SubscriptionFilters {
    property1: string;
    property2: string;
}

export interface CustomerFeatureAccessResponse {
    feature_name: string;
    plan_id: string;
    subscription_filters: SubscriptionFilters;
    access: boolean;
}

export interface UsagePerComponent {
    event_name: string;
    metric_name: string;
    metric_id: string;
    metric_usage: number;
    metric_free_limit: number;
    metric_total_limit: number;
}

export interface CustomerMetricAccessResponse {
    plan_id: string;
    subscription_filters: SubscriptionFilters[];
    usage_per_component: UsagePerComponent[];
}



