import { Lotus } from "./index";
import { CreateCustomerParams } from "./data-types";
import { ListCustomerResponse } from "./responses/ListCustomerResponse";

// @todo check the keys on localhost for mapping and add env file

const API_KEY = "YuFQhG9A.mbypJqPhLabVLqkmfmEsWchTojZYW2Mh";
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

// describe("Testing Customers Endpoints", () => {
//   it("Test Get Customers", async () => {
//     const result = await lotus.listCustomers();
//     expect(result.status).toEqual(200);
//     const customer = result.data?.length ? result.data[0] : null;
//     console.log(customer);
//   });
//   it("Test Get Customer Details", async () => {
//     const result = await lotus.getCustomer({ customerId: "adsfasdfas" });
//     expect(result.status).toEqual(404);
//     // const customer = result.data ? result.data : null;
//   });
//   it("Test Create Customer", async () => {
//     const result = await lotus.createCustomer({
//       customerId: getId(5),
//       email: getEmail(5),
//     });
//     expect(result.status).toEqual(201);
//     const customer = result.data ? result.data : null;
//   });
//   it("Test Create Customers Batch", async () => {
//     const customers: CreateCustomerParams[] = [
//       {
//         customerId: getId(5),
//         email: getEmail(5),
//       },
//       {
//         customerId: getId(5),
//         email: getEmail(5),
//       },
//     ];
//     const result = await lotus.createBatchCustomer({
//       customers: customers,
//       behaviorOnExisting: "merge",
//     });
//     expect(result.status).toEqual(201);
//     const customer = result.data ? result.data : null;
//   });
// });

// describe("Testing Plans Endpoints", () => {
//   it("Test Get Plans", async () => {
//     const result = await lotus.listPlans();
//     expect(result.status).toEqual(200);
//     const plan = result.data?.length ? result.data[0] : null;
//     console.log(plan);
//     if (plan) {
//       const expectedKeys = [
//         "plan_name",
//         "plan_duration",
//         "plan_id",
//         "status",
//         "external_links",
//         "parent_plan",
//         "target_customer",
//         "display_version",
//         "num_versions",
//         "active_subscriptions",
//       ];
//       const hasAllKeys = expectedKeys.every((item) =>
//         plan.hasOwnProperty(item)
//       );
//       expect(hasAllKeys).toEqual(true);
//     }
//   });
//   it("Test Get Plan Details", async () => {
//     const result = await lotus.getPlan({
//       planId: "plan_d09c559a014b438dad32f2c7a6fc5ae3",
//     });
//     expect(result.status).toEqual(200);
//     const plan = result.data ? result.data : null;
//   });
// });

// describe("Testing Customer Feature and Metric Access", () => {
//   it("Test Customer feature Access", async () => {
//     const result = await lotus.getCustomerFeatureAccess({
//       featureName: "feature 1",
//       customerId: "1212",
//     });
//     expect(result.status).toEqual(200);
//     const data = result.data ? result.data[0] : null;
//   });

//   it("Test Customer Metric Access", async () => {
//     const result = await lotus.getCustomerMetricAccess({
//       eventName: "generate_text",
//       customerId: "1212",
//     });
//     expect(result.status).toEqual(200);
//     const data = result.data ? result.data[0] : null;
//   });
// });

// describe("Testing Invoices", () => {
//   it("Test Invoices list", async () => {
//     const result = await lotus.listInvoices({
//       customerId: "1212",
//       paymentStatus: "unpaid",
//     });
//     expect(result.status).toEqual(200);
//     const data = result.data ? result.data[0] : null;
//   });
// });

describe("Testing Subscriptions Endpoints", () => {
  it("Test Get All Subscriptions", async () => {
    const result = await lotus.listSubscriptions({ customerId: "Bvxmv" });
    expect(result.status).toEqual(200);
    const subscriptions = result.data?.length ? result.data[0] : null;
    console.log(subscriptions);
  });
  //   it("Test Create/Add Subscription", async () => {
  //     const result = await lotus.createSubscription({
  //       customerId: "Bvxmv",
  //       planId: "plan_d09c559a014b438dad32f2c7a6fc5ae3",
  //       startDate: "2022-12-12",
  //       subscriptionFilters: [
  //         {
  //           value: "3",
  //           propertyName: "test",
  //         },
  //       ],
  //     });
  //     expect(result.status).toEqual(201);
  //     const subscription = result.data ? result.data : null;
  //   });
  //   it("Test Cancel Subscription", async () => {
  //     const result = await lotus.cancelSubscription({
  //       customerId: "Bvxmv",
  //       planId: "plan_d09c559a014b438dad32f2c7a6fc5ae3",
  //       subscriptionFilters: [
  //         {
  //           value: "3",
  //           propertyName: "test",
  //         },
  //       ],
  //     });
  //     expect(result.status).toEqual(200);
  //     const subscription = result.data ? result.data : null;
  //   });
  it("Test Update Subscription", async () => {
    const result = await lotus.updateSubscription({
      customerId: "Bvxmv",
      planId: "plan_d09c559a014b438dad32f2c7a6fc5ae3",
      turnOffAutoRenew: true,
      subscriptionFilters: [
        {
          value: "3",
          propertyName: "test",
        },
      ],
    });
    expect(result.status).toEqual(200);
    const subscription = result.data ? result.data : null;
  });
});
