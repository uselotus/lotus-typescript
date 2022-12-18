import {Lotus} from "./index";
import {CreateCustomerParams} from "./data-types";

// @todo have to add test for subscriptions and check the keys onlocalhost for mapping

const API_KEY = "5oA3iZtJ.EXWflNUfL69oLlIWrVZyYeH4CWaN3QHq"
const lotus = new Lotus(API_KEY, {
    host: 'https://api.uselotus.io/',
    flushAT: 1,
})
const date = '2022-11-10T22:57:14.089675Z';

function getId(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getEmail(length) {
    return `${getId(length)}@gmail.com`;
}


describe("Testing Customers Endpoints", () => {
  it("Test Get Customers", async () => {
    const result = await lotus.get_customers();
    expect(result.status).toEqual(200);
    const customer = result.data?.length ? result.data[0] : null
    console.log(customer)
  });

   it("Test Get Customer Details", async () => {
    const result = await lotus.get_customer_details({ customerId:'1212'});
    expect(result.status).toEqual(200);
    const customer = result.data ? result.data : null
    console.log(customer)
  });

   it("Test Create Customer", async () => {
    const result = await lotus.create_customer({ customerId:getId(5), email:getEmail(5)});
    expect(result.status).toEqual(201);
    const customer = result.data ? result.data : null
    console.log(customer)
  });

   it("Test Create Customers Batch", async () => {
    const customers: CreateCustomerParams[] =   [
        {
            customerId:getId(5),
            email:getEmail(5),
        },
        {
            customerId:getId(5),
            email:getEmail(5),
        }
    ]
    const result = await lotus.create_customer_batch({ customers:customers, behaviorOnExisting:"merge"});
    expect(result.status).toEqual(201);
    const customer = result.data ? result.data : null
    console.log(customer)
  });
});


describe("Testing Plans Endpoints", () => {
  it("Test Get Plans", async () => {
    const result = await lotus.get_all_plans();
    expect(result.status).toEqual(200);
    const plan = result.data?.length ? result.data[0] : null
    const expectedKeys =    [
      'plan_name',
      'plan_duration',
      'product_id',
      'plan_id',
      'status',
      'external_links',
      'parent_plan',
      'target_customer',
      'created_on',
      'created_by',
      'display_version',
      'num_versions',
      'active_subscriptions'
    ]
    const hasAllKeys = expectedKeys.every(item => plan.hasOwnProperty(item));
    expect(hasAllKeys).toEqual(true);
  });

    it("Test Get Plan Details", async () => {
    const result = await lotus.get_plan_details({planId: "plan_c1e072c447d042d6b02d7431d8f8b485" });
    expect(result.status).toEqual(200);
    const plan = result.data ? result.data[0] : null;
    console.log(plan)
  });
});

describe("Testing Customer Feature Access", () => {
  it("Test Customer feature Access", async () => {
    const result = await lotus.get_customer_feature_access({
        featureName: "feature 1",
        customerId:"1212",
    });
    expect(result.status).toEqual(200);
    const data = result.data ? result.data[0] : null
    console.log(data)
  });

    it("Test Customer Metric Access", async () => {
    const result = await lotus.get_customer_metric_access({
        eventName: "generate_text",
        customerId:"1212",
    });
    expect(result.status).toEqual(200);
    const data = result.data ? result.data[0] : null
    console.log(data)
  });
});


describe("Testing Invoices", () => {
  it("Test Invoices list", async () => {
    const result = await lotus.get_invoices({
        customerId:"1212",
        paymentStatus:"unpaid"
    });
    expect(result.status).toEqual(200);
    const data = result.data ? result.data[0] : null
    console.log(data)
  });
});