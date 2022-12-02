import {
  ChangeSubscriptionParams,
  CreateCustomerParams,
  CreateSubscriptionParams,
  CustomerDetailsParams,
  SubscriptionDetailsParams,
  ValidateEventType,
  TrackEvent,
  CreateBatchCustomerParams,
  CustomerFeatureAccess,
  CustomerMetricAccessParams, DeleteSubscriptionParams,
} from "./data-types";

/**
 * Validate an event.
 */

export function eventValidation(event, type) {
  switch (type) {
    case ValidateEventType.createCustomer:
      return validateCreateCustomerEvent(event);
    case ValidateEventType.customerDetails:
      return validateCustomerDetailsEvent(event);
    case ValidateEventType.createSubscription:
      return validateCreateSubscriptionEvent(event);
    case ValidateEventType.changeSubscription:
      return validateChangeSubscriptionEvent(event);
    case ValidateEventType.subscriptionDetails:
      return validateSubscriptionDetailsEvent(event);
    case ValidateEventType.customerMetricAccess:
      return validateCustomerMetricAccessEvent(event);
    case ValidateEventType.customerFeatureAccess:
      return validateCustomerFeatureAccessEvent(event);
    case ValidateEventType.trackEvent:
      return validateTrackEventEvent(event);
    case ValidateEventType.createCustomersBatch:
      return validateCreateCustomersBatchEvent(event);
    case ValidateEventType.deleteSubscription:
      return validateDeleteSubscriptionEvent(event);
    default:
      throw new Error("Invalid Event Type");
  }
}

/**
 * Validate a "CreateCustomer" event.
 */
function validateCreateCustomerEvent(event: CreateCustomerParams) {
  if (!event.customerId) {
    throw new Error("customerId Name is a required key");
  }

  if (!event.email) {
    throw new Error("Email is a required key");
  }
}

/**
 * Validate a "CreateCustomersBatch" event.
 */

function validateCreateCustomersBatchEvent(event: CreateBatchCustomerParams) {
  const customers = event.customers || [];
  const behaviorOnExisting = event.behaviorOnExisting;

  if (!customers || !customers.length) {
    throw new Error("Customers is a required array");
  }

  customers.forEach((customer, index) => {
    if (!customer.customerId) {
      throw new Error(
        `customerId is a required key, Missing in ${index + 1} customer`
      );
    }

    if (!customer.email) {
      throw new Error(
        `email is a required key, Missing in ${index + 1} customer`
      );
    }
  });

  if (!behaviorOnExisting) {
    throw new Error(`behaviorOnExisting is a required key`);
  }

  const allowed_types = ["merge", "ignore", "overwrite"];

  if (!allowed_types.includes(behaviorOnExisting)) {
    throw new Error(
      `behaviorOnExisting Must be one the these "merge","ignore", "overwrite"`
    );
  }
}

/**
 * Validate a "CustomerDetails" event.
 */
function validateCustomerDetailsEvent(event: CustomerDetailsParams) {
  if (!event.customerId) {
    throw new Error("customerId is a required key");
  }
}

/**
 * Validate a "CreateSubscription" event.
 */
function validateCreateSubscriptionEvent(event: CreateSubscriptionParams) {
  if (!event.customerId) {
    throw new Error("customerId is a required key");
  }

  if (!event.planId) {
    throw new Error("planId is a required key");
  }

  if (!event.startDate) {
    throw new Error("startDate is a required key");
  }

  if (event.subscriptionFilters && !Array.isArray(event.subscriptionFilters)) {
    throw new Error("subscriptionFilters must be an array");
  }

  const filters = event.subscriptionFilters || []

  if (!!filters.length) {
    filters.forEach(item => {
      if (!("value" in item)) {
        throw new Error("value of Subscription Filter cant be null");
      }
      if (!("propertyName" in item)) {
        throw new Error("propertyName of Subscription Filter cant be null");
      }

    })
  }
}

/**
 * Validate a "ChangeSubscription" event.
 */
function validateChangeSubscriptionEvent(event: ChangeSubscriptionParams) {
  if (!event.subscriptionId) {
    throw new Error("subscriptionId is a required key");
  }
}

/**
 * Validate a "SubscriptionDetails" event.
 */
function validateSubscriptionDetailsEvent(event: SubscriptionDetailsParams) {
  if (!event.subscriptionId) {
    throw new Error("subscription_id is a required key");
  }
}

/**
 * Validate a "Customer Access" event.
 */
function validateCustomerFeatureAccessEvent(event: CustomerFeatureAccess) {
  if (!event.customerId) {
    throw new Error("customerId is a required key");
  }

  if (!event.featureName) {
    throw new Error("Can't provide both featureName and eventName");
  }
}

/**
 * Validate a "Customer Access" event.
 */
function validateCustomerMetricAccessEvent(event: CustomerMetricAccessParams) {
  if (!event.customerId) {
    throw new Error("customerId is a required key");
  }

  if (!event.eventName) {
    throw new Error("Can't provide both featureName and eventName");
  }
}

/**
 * Validate a "trackEvent" event.
 */
function validateTrackEventEvent(event: TrackEvent) {
  if (!event.batch || !event.batch.length) {
    throw new Error("Messages batch can't be empty");
  }

  event.batch.forEach((messaage) => {
    if (!messaage.customerId) {
      throw new Error("customerId is a required key");
    }

    if (!messaage.eventName) {
      throw new Error("eventName is a required key");
    }
  });
}

/**
 * Validate a "DeleteSubscription" event.
 */

function validateDeleteSubscriptionEvent(event: DeleteSubscriptionParams) {

  if (!event.subscriptionId) {
    throw new Error("subscriptionId is a required key");
  }


  const allowed_types = [ "refund" , "prorate" , "charge_full"];

  if (event.flatFeeBehavior && !allowed_types.includes(event.flatFeeBehavior)) {
    throw new Error(
      `flatFeeBehavior Must be one the these "refund","prorate", "charge_full"`
    );
  }
}
