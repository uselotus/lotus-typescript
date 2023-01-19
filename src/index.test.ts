import { Lotus } from "./index";
import { CreateCustomerParams } from "./data-types";
import { format } from "date-fns";
import * as dotenv from "dotenv";
dotenv.config();

/// import API_KEY from env
const API_KEY = process.env.API_KEY;
const lotus = new Lotus(API_KEY, {
  host: "https://api.uselotus.io/",
  flushAT: 1,
});
let date = new Date();
const customer_id = "1212";
const plan_id = "plan_e959828592e44439a2a68981a8b3e0b7";

const expectedCustomerKeys = [
  "customer_id",
  "email",
  "customer_name",
  "invoices",
  "total_amount_due",
  "subscriptions",
  "integrations",
  "default_currency",

];

function getId(length) {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function getEmail(length) {
  return `${getId(length)}@gmail.com`;
}

describe("Testing Customers Endpoints", () => {
  it("Test Get Customers", async () => {
    const result = await lotus.listCustomers();
    expect(result.status).toEqual(200);
    const customer = result.data?.length ? result.data[0] : null;
    if (customer) {
      const hasAllKeys = expectedCustomerKeys.every((item) =>
        customer.hasOwnProperty(item)
      );
      expect(hasAllKeys).toEqual(true);
    }
  });

  it("Test Get Customer Details for customer which is invalid", async () => {
    try {
      await lotus.getCustomer({ customerId: "adsfasdfas" });
      fail("It should not have come here!");
    } catch (error) {
      console.log("It never came here!");
    }
  });

  it("Test Get Customer Details", async () => {
    const result = await lotus.listCustomers();
    expect(result.status).toEqual(200);
    const customer = result.data?.length ? result.data[0] : null;
    if (customer) {
      const customerDetails = await lotus.getCustomer({
        customerId: customer.customer_id,
      });
      expect(customerDetails.status).toEqual(200);
      const hasAllKeys = expectedCustomerKeys.every((item) =>
        customerDetails.data.hasOwnProperty(item)
      );
      expect(hasAllKeys).toEqual(true);
    }
  });

  it("Test Create Customer", async () => {
    const result = await lotus.createCustomer({
      customerId: getId(5),
      email: getEmail(5),
    });
    expect(result.status).toEqual(201);
    const customer = result.data ? result.data : null;
    if (customer) {
      const keys = [
        "customer_name",
        "customer_id",
        "email",
        "payment_provider",
        "properties",
      ];
      const hasAllKeys = keys.every((item) => customer.hasOwnProperty(item));
      expect(hasAllKeys).toEqual(true);
    }
  });

  it("Test Create Customers Batch", async () => {
    const customers: CreateCustomerParams[] = [
      {
        customerId: getId(5),
        email: getEmail(5),
      },
      {
        customerId: getId(5),
        email: getEmail(5),
      },
    ];
    const result = await lotus.createBatchCustomer({
      customers: customers,
      behaviorOnExisting: "merge",
    });
    expect(result.status).toEqual(201);
  });
});

describe("Testing Plans Endpoints", () => {
  it("Test Get Plans", async () => {
    const result = await lotus.listPlans();
    expect(result.status).toEqual(200);
    const plan = result.data?.length ? result.data[0] : null;
    if (plan) {
      const expectedKeys = [
        "plan_name",
        "plan_duration",
        "plan_id",
        "status",
        "external_links",
        "parent_plan",
        "target_customer",
        "display_version",
        "num_versions",
        "active_subscriptions",
      ];
      const hasAllKeys = expectedKeys.every((item) =>
        plan.hasOwnProperty(item)
      );
      expect(hasAllKeys).toEqual(true);
    }
  });

  it("Test Get Plan Details for plan which is invalid", async () => {
    try {
      await lotus.getPlan({ planId: "adsfasdfas" });
      fail("It should not have come here!");
    } catch (error) {
      console.log("It never came here!");
    }
  });

  it("Test Get Plan Details", async () => {
    const result = await lotus.listPlans();
    expect(result.status).toEqual(200);
    const plan = result.data?.length ? result.data[0] : null;
    if (plan) {
      const plan_details_result = await lotus.getPlan({ planId: plan.plan_id });
      expect(plan_details_result.status).toEqual(200);
      const expectedKeys = [
        "plan_name",
        "plan_duration",
        "plan_id",
        "status",
        "external_links",
        "parent_plan",
        "target_customer",
        "display_version",
        "num_versions",
        "active_subscriptions",
      ];
      const hasAllKeys = expectedKeys.every((item) =>
        plan_details_result.data.hasOwnProperty(item)
      );
      expect(hasAllKeys).toEqual(true);
    }
  });
});

describe("Testing Customer Feature and Metric Access", () => {
  it("Test Customer feature Access", async () => {
    const result = await lotus.getCustomerFeatureAccess({
      featureName: "feature 1",
      customerId: customer_id,
    });
    expect(result.status).toEqual(200);
    const data = result.data ? result.data[0] : null;
    const keys = ["feature_name", "subscription_filters", "plan_id", "access"];
    if (data) {
      const hasAllKeys = keys.every((item) => data.hasOwnProperty(item));
      expect(hasAllKeys).toEqual(true);
    }
  });

  it("Test Customer Metric Access", async () => {
    const result = await lotus.getCustomerMetricAccess({
      eventName: "generate_text",
      customerId: customer_id,
    });
    expect(result.status).toEqual(200);
    const data = result.data ? result.data[0] : null;
    const keys = ["plan_id", "subscription_filters", "usage_per_component"];
    if (data) {
      const hasAllKeys = keys.every((item) => data.hasOwnProperty(item));
      expect(hasAllKeys).toEqual(true);
    }
  });
});

describe("Testing Invoices", () => {
  it("Test Invoices list", async () => {
    const result = await lotus.listInvoices({
      customerId: customer_id,
      paymentStatus: "unpaid",
    });
    expect(result.status).toEqual(200);
    const data = result.data ? result.data[0] : null;
    if (data) {
      const keys = [
        "invoice_number",
        "cost_due",
        "currency",
        "issue_date",
        "payment_status",
        "external_payment_obj_id",
        "external_payment_obj_type",
        "line_items",
        "customer",
        "due_date",
        "invoice_pdf",
        "start_date",
        "end_date",
        "seller",
      ];
      const hasAllKeys = keys.every((item) => data.hasOwnProperty(item));
      expect(hasAllKeys).toEqual(true);
    }
  });
});

describe("Testing Subscriptions Endpoints", () => {
  it("Test Get All Subscriptions", async () => {
    const result = await lotus.listSubscriptions({ customerId: customer_id });
    expect(result.status).toEqual(200);
    const subscription = result.data?.length ? result.data[0] : null;
    if (subscription) {
      const keys = [
        "start_date",
        "end_date",
        "auto_renew",
        "is_new",
        "subscription_filters",
        "customer",
        "billing_plan",
        "fully_billed",
      ];
      const hasAllKeys = keys.every((item) =>
        subscription.hasOwnProperty(item)
      );
      expect(hasAllKeys).toEqual(true);
    }
  });

  it("Test Create/Add Subscription", async () => {
    const result = await lotus.createSubscription({
      customerId: customer_id,
      planId: plan_id,
      startDate: format(date, "yyyy-MM-dd"),
      subscriptionFilters: [
        {
          value: "5",
          propertyName: "test1",
        },
      ],
    });
    expect(result.status).toEqual(201);
    const subscription = result.data ? result.data : null;
    if (subscription) {
      const keys = [
        "start_date",
        "end_date",
        "auto_renew",
        "is_new",
        "customer",
        "billing_plan",
      ];
      const hasAllKeys = keys.every((item) =>
        subscription.hasOwnProperty(item)
      );
      expect(hasAllKeys).toEqual(true);
    }
  });

  it("Test Cancel Subscription", async () => {
    const result = await lotus.cancelSubscription({
      customerId: customer_id,
      planId: plan_id,
      subscriptionFilters: [
        {
          value: "4",
          propertyName: "test",
        },
      ],
    });
    expect(result.status).toEqual(200);
  });

  it("Test Update Subscription", async () => {
    const result = await lotus.updateSubscription({
      customerId: customer_id,
      planId: plan_id,
      turnOffAutoRenew: true,
    });
    expect(result.status).toEqual(200);
    const subscription = result.data ? result.data[0] : null;
    if (subscription) {
      console.log(subscription);
      const keys = [
        "start_date",
        "end_date",
        "auto_renew",
        "is_new",
        "customer",
        "billing_plan",
      ];
      const hasAllKeys = keys.every((item) =>
        subscription.hasOwnProperty(item)
      );
      expect(hasAllKeys).toEqual(true);
    }
  });
});
