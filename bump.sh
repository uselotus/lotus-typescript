#!/bin/bash

# Generate TypeScript code using openapi-typescript
npx openapi-typescript https://raw.githubusercontent.com/uselotus/lotus/main/docs/openapi.yaml --output ./src/types.ts

# Convert the generated code to use camel case naming
node << EOF
const fs = require('fs');

fs.readFile('src/types.ts', 'utf-8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  let result = data;
  result = result.replace(/([a-z0-9])(_[a-z0-9])/g, (match, p1, p2) => {
    return p1 + p2.toUpperCase().substr(1);
  });

  fs.writeFile('src/types-camel.ts', result, 'utf-8', err => {
    if (err) {
      console.error(err);
      return;
    }

    console.log('Converted to camel case naming');
  });
});
EOF

echo "Code generation and post-processing complete"

if [ "$1" == "--patch" ]; then
  npx npm-bump patch
elif [ "$1" == "--minor" ]; then
  npx npm-bump minor
elif [ "$1" == "--major" ]; then
  npx npm-bump major
else
  echo "Invalid argument. Use --patch, --minor, or --major."
fi