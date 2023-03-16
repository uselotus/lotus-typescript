import {
  CreateCustomerParams,
  CreateSubscriptionParams,
  CustomerDetailsParams,
  ValidateEventType,
  TrackEvent,
  CustomerFeatureAccess,
  CustomerMetricAccessParams,
  CancelSubscriptionParams,
  PlanDetailsParams,
  ListAllSubscriptionsParams,
  ListCreditsParams,
  CreateCreditParams,
  VoidCreditParams,
  UpdateCreditParams,
  UpdateSubscriptionParams,
  ChangePrepaidUnitsParams,
  GetInvoiceParams,
} from "./data-types";

export function eventValidation(event: any, type: ValidateEventType) {
  switch (type) {
    case ValidateEventType.createCustomer:
      return validateCreateCustomerEvent(event);
    case ValidateEventType.customerDetails:
      return validateCustomerDetailsEvent(event);
    case ValidateEventType.createSubscription:
      return validateCreateSubscriptionEvent(event);
    case ValidateEventType.updateSubscription:
      return validateChangeSubscriptionEvent(event);
    case ValidateEventType.planDetails:
      return validatePlanDetailsEvent(event);
    case ValidateEventType.customerMetricAccess:
      return validateCustomerMetricAccessEvent(event);
    case ValidateEventType.customerFeatureAccess:
      return validateCustomerFeatureAccessEvent(event);
    case ValidateEventType.trackEvent:
      return validateTrackEventEvent(event);
    case ValidateEventType.cancelSubscription:
      return validateDeleteSubscriptionEvent(event);
    case ValidateEventType.listSubscriptions:
      return validateListSubscriptionEvent(event);
    case ValidateEventType.listCredits:
      return validateListCreditsEvent(event);
    case ValidateEventType.createCredit:
      return validateCreateCreditEvent(event);
    case ValidateEventType.voidCredit:
      return validateVoidCreditEvent(event);
    case ValidateEventType.updateCredit:
      return validateUpdateCreditEvent(event);
    case ValidateEventType.changePrepaidUnits:
      return validateChangePrepaidUnitsEvent(event);
    case ValidateEventType.getInvoice:
      return validateGetInvoiceEvent(event);
    default:
      throw new Error("Invalid Event Type");
  }
}

/**
 * Validate a "CreateCustomer" event.
 */
function validateCreateCustomerEvent(event: CreateCustomerParams) {
  if (!event.customer_id) {
    throw new Error("customer_id is a required key");
  }

  if (!event.email) {
    throw new Error("Email is a required key");
  }
}

/**
 * Validate a "CustomerDetails" event.
 */
function validateCustomerDetailsEvent(event: CustomerDetailsParams) {
  if (!event.customer_id) {
    throw new Error("customerId is a required key");
  }
}

/**
 * Validate a "CreateSubscription" event.
 */
function validateCreateSubscriptionEvent(event: CreateSubscriptionParams) {
  if (!event.customer_id) {
    throw new Error("customer_id is a required key");
  }

  if (!event.plan_id) {
    throw new Error("plan_id is a required key");
  }

  if (!event.start_date) {
    throw new Error("start_date is a required key");
  }

  if (
    event.subscription_filters &&
    !Array.isArray(event.subscription_filters)
  ) {
    throw new Error("subscription_filters must be an array");
  }

  const filters = event.subscription_filters || [];

  if (!!filters.length) {
    filters.forEach((item) => {
      if (!("value" in item)) {
        throw new Error("value of Subscription Filter cant be null");
      }
      if (!("property_name" in item)) {
        throw new Error("property_name of Subscription Filter cant be null");
      }
    });
  }
}

/**
 * Validate a "ChangeSubscription" event.
 */
function validateChangeSubscriptionEvent(event: UpdateSubscriptionParams) {
  if (!event.subscription_id) {
    throw new Error("subscription_id is a required key");
  }
}

/**
 * Validate a "Customer Access" event.
 */
function validateCustomerFeatureAccessEvent(event: CustomerFeatureAccess) {
  if (!event.customer_id) {
    throw new Error("customer_id is a required key");
  }

  if (!event.feature_id) {
    throw new Error("feature_name is a required key");
  }

  if (
    event.subscription_filters &&
    !Array.isArray(event.subscription_filters)
  ) {
    throw new Error("subscription_filters must be an array");
  }
}

/**
 * Validate a "Customer Access" event.
 */
function validateCustomerMetricAccessEvent(event: CustomerMetricAccessParams) {
  if (!event.customer_id) {
    throw new Error("customer_id is a required key");
  }

  if (
    event.subscription_filters &&
    !Array.isArray(event.subscription_filters)
  ) {
    throw new Error("subscription_filters must be an array");
  }
}

/**
 * Validate a "trackEvent" event.
 */
function validateTrackEventEvent(event: TrackEvent) {
  if (!event.batch || !event.batch.length) {
    throw new Error("Messages batch can't be empty");
  }

  event.batch.forEach((message) => {
    if (!message.customer_id) {
      throw new Error("customer_id is a required key");
    }

    if (!message.event_name) {
      throw new Error("event_name is a required key");
    }
  });
}

/**
 * Validate a "DeleteSubscription" event.
 */

function validateDeleteSubscriptionEvent(event: CancelSubscriptionParams) {
  if (!event.subscription_id) {
    throw new Error("subscription_id is a required key");
  }

  const allowed_types = ["refund", "prorate", "charge_full"];

  if (
    event.flat_fee_behavior &&
    !allowed_types.includes(event.flat_fee_behavior)
  ) {
    throw new Error(
      `flat_fee_behavior Must be one the these "refund","prorate", "charge_full"`
    );
  }
}

/**
 * Validate a "PlanDetails" event.
 */
function validatePlanDetailsEvent(event: PlanDetailsParams) {
  if (!event.plan_id) {
    throw new Error("plan_id is a required key");
  }
}

/**
 * Validate a "ListCredits" event.
 *
 */

function validateListCreditsEvent(event: ListCreditsParams) {
  if (!event.customer_id) {
    throw new Error("customer_id is a required key");
  }
}

/**
 * Validate a CreateCredit event.
 */
function validateCreateCreditEvent(event: CreateCreditParams) {
  if (!event.customer_id) {
    throw new Error("customer_id is a required key");
  }
  if (!event.amount) {
    throw new Error("amount is a required key");
  }
  if (!event.currency_code) {
    throw new Error("currency_code is a required key");
  }

  if (event.amount < 0) {
    throw new Error("amount must be greater than 0");
  }

  if (event.amount_paid < 0) {
    throw new Error("amount_paid must be greater than 0");
  }
}

/**
 * Validate a voidCredit event.
 * @param event
 */

function validateVoidCreditEvent(event: VoidCreditParams) {
  if (!event.credit_id) {
    throw new Error("credit_id is a required key");
  }
}

/**
 * Validate a updateCredit event.
 * @param event
 */
function validateUpdateCreditEvent(event: UpdateCreditParams) {
  if (!event.credit_id) {
    throw new Error("credit_id is a required key");
  }
}

/**
 * Validate a "changePrepaidUnits" event.
 */
function validateChangePrepaidUnitsEvent(event: ChangePrepaidUnitsParams) {
  if (!event.subscription_id) {
    throw new Error("subscription_id is a required key");
  }

  if (!event.units) {
    throw new Error("units is a required key");
  }

  if (event.units < 0) {
    throw new Error("units must be greater than 0");
  }

  if (!event.metric_id) {
    throw new Error("metric_id is a required key");
  }
}

/**
 * Validate a "ListSubscription" event.
 */

function validateListSubscriptionEvent(event: ListAllSubscriptionsParams) {
  if (!event.customer_id) {
    throw new Error("customer_id is a required key");
  }

  const allowed_status = ["active", "not_started", "ended"];

  if (event.status && !Array.isArray(event.status)) {
    throw new Error("subscription_filters must be an array");
  }

  if (event.status?.length) {
    event.status.forEach((status) => {
      if (!allowed_status.includes(status)) {
        throw new Error(
          `status Must be one the these "active","prorate", "charge_full"`
        );
      }
    });
  }
}

/**
 * Validate a "GetInvoice" event.
 *
 * @param event
 */

function validateGetInvoiceEvent(event: GetInvoiceParams) {
  if (!event.invoice_id) {
    throw new Error("invoice_id is a required key");
  }
}
