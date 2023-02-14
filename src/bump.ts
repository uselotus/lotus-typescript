import { execSync, exec } from "child_process";
import { readFile, writeFile } from "fs/promises";
import util from "util";
const execAsync = util.promisify(exec);

type TVersionBumpType = "patch" | "major" | "minor";
(async () => {
  const versionBumpType = process.argv[2] as TVersionBumpType;

  const pathToReadFrom = "./src/types.ts";
  const pathToWriteTo = "./src/types-camel.ts";
  await execAsync(
    "npx openapi-typescript https://raw.githubusercontent.com/uselotus/lotus/main/docs/openapi.yaml --output ./src/types.ts"
  );

  //   execSync(
  //     "npx openapi-typescript https://raw.githubusercontent.com/uselotus/lotus/main/docs/openapi.yaml --output types.ts"
  //   );
  let result: string = "";
  try {
    // Convert the generated code to use camel case naming
    const res = await readFile(pathToReadFrom, { encoding: "utf-8" });
    result = res.replace(/([a-z0-9])(_[a-z0-9])/g, (_, p1, p2) => {
      return p1 + p2.toUpperCase().substr(1);
    });
  } catch (error) {
    console.error(
      `An error occurred reading from ${pathToReadFrom} & converting to camel case`,
      error
    );
  }
  try {
    await writeFile(pathToWriteTo, result, { encoding: "utf-8" });
  } catch (error) {
    console.error(`Something went wrong writing to ${pathToWriteTo}`, error);
  }
  // commit what we already have to git because npm-bump creates a new commit too
  execSync("git add .");
  execSync("git commit -m 'update the types' ");
  //   if (versionBumpType === "patch") {
  //     execSync("npx npm-bump patch");
  //   } else if (versionBumpType === "minor") {
  //     execSync("npx npm-bump minor");
  //   } else {
  //     execSync("npx npm-bump major");
  //   }
})();
