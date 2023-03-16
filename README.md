# Lotus Typescript Library

[![MIT License](https://img.shields.io/badge/License-MIT-red.svg?style=flat)](https://opensource.org/licenses/MIT)

Official Lotus Typescript library to capture and send events to any Lotus instance (self-hosted or cloud).

## Installing

Install the lotus-node package for use in your node.js based backend.

```bash
npm install lotus-typescript
```

## Initializing

First grab a new api key from the Settings tab. Then change the host to wherever you want to send data to and omit the line if you are using Lotus Cloud.

```jsx
const lotus = new Lotus(api_key, {
  host: "https://api.uselotus.io/", // You can omit this line if using Lotus Cloud
});
```

## Currently Supported Methods

```
1. trackEvent
2. listCustomers
3. getCustomer
4. createCustomer
5. createSubscription
6. cancelSubscription
7. updateSubscription
8. switchSubscriptionPlan
9. listSubscriptions
10. attachAddon
11. cancelAddon
12. changePrepaidUnits
13. listPlans
14. getPlan
15. checkFeatureAccess
16. checkMetricAccess
17. listInvoices
18. getInvoice
19. listCredits
20. createCredit
21. voidCredit
22. updateCredit
```

## Making calls

Please refer to the [Lotus documentation](https://docs.uselotus.io/api-reference/typescript-guide) for more information on how to use the library.

All parameters and return types are defined in snake_case. This is consistent across all Lotus SDKs. Method names are in camelCase.

## Questions?

### [Join our Slack community.](https://lotus-community.slack.com)

## Thank you
