const { AxiosError } = require('axios');
const dotenv = require('dotenv');
const { Lotus } = require('./index');

dotenv.config();
jest.setTimeout(20000);

/// import API_KEY from env
const API_KEY = process.env.API_KEY;

const LOTUS_HOST = process.env.LOTUS_HOST || "https://api.uselotus.io/";
const lotus = new Lotus(API_KEY, {
  host: LOTUS_HOST,
  flushAt: 1,
});

let date = new Date();
const customer_id = process.env.CUSTOMER_ID || "1212";
const plan_id = process.env.PLAN_ID || "plan_e959828592e44439a2a68981a8b3e0b7";
const feature_id = process.env.FEATURE_ID || "feature_1";
let subscription_id;

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

const getId = (length: number) => {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const getEmail = (length: number) => {
  return `${getId(length)}@gmail.com`;
};

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
      await lotus.getCustomer({ customer_id: "adsfasdfas" });
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
        customer_id: customer.customer_id,
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
      customer_id: getId(5),
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
        "has_payment_method",
        "default_currency",
        "integrations",
        "subscriptions",
        "invoices",
        "total_amount_due",
      ];

      const hasAllKeys = keys.every((item) => customer.hasOwnProperty(item));

      expect(hasAllKeys).toEqual(true);
    }
  });

  it("Test Create Customer does not let you submit same details twice", async () => {
    try {
      const result = await lotus.createCustomer({
        customer_id: getId(5),
        email: "Johndoe@se.org",
      });

      expect(result.status).toEqual(201);

      const secondResult = await lotus.createCustomer({
        customer_id: getId(5),
        email: "Johndoe@se.org",
      });

      expect(secondResult.status).toEqual(400);
    } catch (error) {
      expect(error).toBeTruthy();
    }
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
      await lotus.getPlan({ plan_id: "adsfasdfas" });

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
      const plan_details_result = await lotus.getPlan({
        plan_id: plan.plan_id,
      });
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
      feature_id: feature_id,
      customer_id,
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
    const result = await lotus.getMetricAccess({
      metric_id: "23421",
      customer_id,
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
      customer_id: customer_id,
      payment_status: ["unpaid"],
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
    const result = await lotus.listSubscriptions({ customer_id });

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

      subscription_id = subscription.subscription_id;

      const hasAllKeys = keys.every((item) =>
        subscription.hasOwnProperty(item)
      );

      expect(hasAllKeys).toEqual(true);
    }
  });

  it("Test Create/Add Subscription", async () => {
    try {
      const result = await lotus.createSubscription({
        customer_id,
        plan_id,
        start_date: date.toISOString(),
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
          "fully_billed",
        ];
  
        const hasAllKeys = keys.every((item) =>
          subscription.hasOwnProperty(item)
        );
  
        expect(hasAllKeys).toEqual(true);
      }
    } catch (err) {
      console.log(err)
    }
  });

  it("Test Update Subscription", async () => {
    const subscriptionId = await lotus.listSubscriptions({ customer_id }).then(res => {
      expect(res.status).toEqual(200);
      return res.data?.[0].subscription_id ?? null;
    });

    const result = await lotus.updateSubscription({
      subscription_id: subscriptionId,
      turn_off_auto_renew: true,
    });

    expect(result.status).toEqual(200);

    const subscription = result.data ? result.data[0] : null;

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

  it("Test Cancel Subscription That Doesn't Exist", async () => {
    try {
      const result = await lotus.cancelSubscription({
        subscription_id: "123",
      });
    } catch (err) {
      expect(err).toBeInstanceOf(AxiosError)
      expect(err.response.status).toEqual(400)
    }
  });

  it("Test Cancel Subscription That Does Exist", async () => {
    const subscriptionId = await lotus.listSubscriptions({ customer_id }).then(res => {
      expect(res.status).toEqual(200);
      return res.data?.[0].subscription_id ?? null;
    });

    if (!subscriptionId) {
      return;
    }

    const result = await lotus.cancelSubscription({
      subscription_id: subscriptionId,
    });
    expect(result.status).toEqual(200);
  });
});
