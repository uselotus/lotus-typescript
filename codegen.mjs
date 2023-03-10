import path from "path";
import fsp from "fs/promises";
import { fileURLToPath } from "url";
import { execa } from "execa";
import chalk from "chalk";
import inquirer from "inquirer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TYPES_FILE = path.resolve(path.join(__dirname, "src", "types.ts"));

const runOpenApiGenerator = async (branchName) => {
  try {
    await execa("npx", [
      "openapi-typescript",
      `https://raw.githubusercontent.com/uselotus/lotus/${branchName}/docs/openapi.yaml`,
      "--output",
      TYPES_FILE,
    ]);

    console.log(chalk.green("Generated typescript types"));
  } catch (err) {
    console.error("[runOpenApiGenerator]: ", err);
    process.exit(1);
  }
};

const bumpVersion = async (bump) => {
  try {
    await execa("npx", ["npm-bump", bump]);
  } catch (err) {
    console.error("[bumpVersion]: ", err);
    process.exit(1);
  }
};

inquirer
  .prompt([
    {
      type: "input",
      name: "branchName",
      message: "Specify the branch name:",
    },
    {
      type: "list",
      name: "bump",
      message: "Specify the type of version bump:",
      choices: ["patch", "minor", "major"],
    },
  ])
  .then(async (answers) => {
    const { branchName, bump } = answers;

    await runOpenApiGenerator(branchName);

    await bumpVersion(bump);

    console.log(chalk.green("Done!"));
  });
