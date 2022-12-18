import {Lotus} from "./index";

const API_KEY = "5oA3iZtJ.EXWflNUfL69oLlIWrVZyYeH4CWaN3QHq"
const lotus = new Lotus(API_KEY, {
    host: 'https://api.uselotus.io/',
    flushAT: 1,
})
describe("Testing Typescript SDK", () => {
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

  // it("Test Get Customers", async () => {
  //   const result = await lotus.get_customers();
  //   console.log(result)
  // });
});
