import { Lotus } from "./index";
import { CreateCustomerParams } from "./data-types";

// @todo check the keys on localhost for mapping and add env file

const API_KEY = "5oA3iZtJ.EXWflNUfL69oLlIWrVZyYeH4CWaN3QHq";
const lotus = new Lotus(API_KEY, {
  host: "http://localhost:8000/",
  flushAT: 1,
});
const date = "2022-11-10T22:57:14.089675Z";

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
    console.log(customer);
  });

  it("Test Get Customer Details", async () => {
    const result = await lotus.getCustomer({ customerId: "1212" });
    expect(result.status).toEqual(200);
    const customer = result.data ? result.data : null;
    console.log(customer);
  });

  it("Test Create Customer", async () => {
    const result = await lotus.createCustomer({
      customerId: getId(5),
      email: getEmail(5),
    });
    expect(result.status).toEqual(201);
    const customer = result.data ? result.data : null;
    console.log(customer);
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
    const customer = result.data ? result.data : null;
    console.log(customer);
  });
});

describe("Testing Plans Endpoints", () => {
  it("Test Get Plans", async () => {
    const result = await lotus.listPlans();
    expect(result.status).toEqual(200);
    const plan = result.data?.length ? result.data[0] : null;
    const expectedKeys = [
      "plan_name",
      "plan_duration",
      "product_id",
      "plan_id",
      "status",
      "external_links",
      "parent_plan",
      "target_customer",
      "created_on",
      "created_by",
      "display_version",
      "num_versions",
      "active_subscriptions",
    ];
    const hasAllKeys = expectedKeys.every((item) => plan.hasOwnProperty(item));
    expect(hasAllKeys).toEqual(true);
  });

  it("Test Get Plan Details", async () => {
    const result = await lotus.getPlan({
      planId: "plan_c1e072c447d042d6b02d7431d8f8b485",
    });
    expect(result.status).toEqual(200);
    const plan = result.data ? result.data[0] : null;
    console.log(plan);
  });
});

describe("Testing Customer Feature and Metric Access", () => {
  it("Test Customer feature Access", async () => {
    const result = await lotus.getCustomerFeatureAccess({
      featureName: "feature 1",
      customerId: "1212",
    });
    expect(result.status).toEqual(200);
    const data = result.data ? result.data[0] : null;
    console.log(data);
  });

  it("Test Customer Metric Access", async () => {
    const result = await lotus.getCustomerMetricAccess({
      eventName: "generate_text",
      customerId: "1212",
    });
    expect(result.status).toEqual(200);
    const data = result.data ? result.data[0] : null;
    console.log(data);
  });
});

describe("Testing Invoices", () => {
  it("Test Invoices list", async () => {
    const result = await lotus.listInvoices({
      customerId: "1212",
      paymentStatus: "unpaid",
    });
    expect(result.status).toEqual(200);
    const data = result.data ? result.data[0] : null;
    console.log(data);
  });
});

describe("Testing Subscriptions Endpoints", () => {
  it("Test Get All Subscriptions", async () => {
    const result = await lotus.listSubscriptions({});
    expect(result.status).toEqual(200);
    const subscriptions = result.data?.length ? result.data[0] : null;
    console.log(subscriptions, result);
  });


  it("Test Create/Add Subscription", async () => {
    const result = await lotus.createSubscription({
      customerId: "1212",
      planId:"plan_c1e072c447d042d6b02d7431d8f8b485",
      startDate:date,
    });
    expect(result.status).toEqual(200);
    const subscription = result.data ? result.data : null;
    console.log(subscription);
  });

  it("Test Cancel Subscription", async () => {
    const result = await lotus.cancelSubscription({
      customerId: "1212",
      planId:"plan_c1e072c447d042d6b02d7431d8f8b485",
    });
    expect(result.status).toEqual(200);
    const subscription = result.data ? result.data : null;
    console.log(subscription);
  });

  it("Test Update Subscription", async () => {
    const result = await lotus.updateSubscription({
      customerId: "1212",
      planId:"plan_c1e072c447d042d6b02d7431d8f8b485",
      turnOffAutoRenew:true,
    });
    expect(result.status).toEqual(200);
    const subscription = result.data ? result.data : null;
    console.log(subscription);
  });
});
