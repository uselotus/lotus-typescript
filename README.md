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
1. TrackEvent
2. Get All Customers
3. Get Customer Details
4. Create Customer
5. Create Subscription
6. Cancel Subscription
7. Update Subscription
8. Get All Subscriptions
9. Get Subscription Details
10. Get All Plans
11. Get Feature Access
12. Get Metric Access

```

## Making calls

Please refer to the [Lotus documentation](https://docs.uselotus.io/api-reference/typescript-guide) for more information on how to use the library.

## Questions?

### [Join our Slack community.](https://lotus-community.slack.com)

## Thank you
