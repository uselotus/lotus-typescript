export interface ExternalLink {
  source: string;
  external_plan_id: string;
}

export interface ParentPlan {
  plan_name: string;
  plan_id: string;
}

export interface TargetCustomer {
  customer_name: string;
  email: string;
  customer_id: string;
}

export interface NumericFilter {
  property_name: string;
  operator: string;
  comparison_value: number;
}

export interface CategoricalFilter {
  property_name: string;
  operator: string;
  comparison_value: string[];
}

export interface BillableMetric {
  metric_id: string;
  event_name: string;
  property_name: string;
  aggregation_type: string;
  granularity: string;
  event_type: string;
  metric_type: string;
  metric_name: string;
  numeric_filters: NumericFilter[];
  categorical_filters: CategoricalFilter[];
  is_cost_metric: boolean;
}

export interface Tier {
  type: string;
  range_start: number;
  range_end: number;
  cost_per_batch: number;
  metric_units_per_batch: number;
  batch_rounding_type: string;
}

export interface PricingUnit {
  code: string;
  name: string;
  symbol: string;
}

export interface Component {
  billable_metric: BillableMetric;
  tiers: Tier[];
  proration_granularity: string;
  pricing_unit: PricingUnit;
}

export interface Feature {
  feature_name: string;
  feature_description: string;
}

export interface PriceAdjustment {
  price_adjustment_name: string;
  price_adjustment_description: string;
  price_adjustment_type: string;
  price_adjustment_amount: number;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface DisplayVersion {
  description: string;
  flat_fee_billing_type: string;
  flat_rate: number;
  components: Component[];
  features: Feature[];
  price_adjustment: PriceAdjustment;
  usage_billing_frequency: string;
  version: number;
  status: string;
  plan_name: string;
  currency: Currency;
}

export interface Tag {
  tag_name: string;
  tag_hex?: string;
  tag_color?: string;
}

export interface ListPlan {
  tags: Tag[];
  plan_name: string;
  plan_duration: string;
  status: string;
  external_links: ExternalLink[];
  plan_id: string;
  parent_plan: ParentPlan;
  target_customer: TargetCustomer;
  display_version: DisplayVersion;
  num_versions: number;
  active_subscriptions: number;
}
