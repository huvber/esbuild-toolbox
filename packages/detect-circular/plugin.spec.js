import fs from "node:fs/promises";
import { test, after, describe } from "node:test";
import { dirname } from "node:path";
import assert from "node:assert";

import { build } from "esbuild";

import { detectCircularPlugin } from "./plugin.js";

describe("detectCircularPlugin", async () => {
  after(async () => {
    await fs.rm("./dist", { recursive: true, force: true });
  });

  test("should detect circular dependencies", async () => {
    const result = await build({
      entryPoints: ["./_test-folder_/index.js"],
      bundle: true,
      plugins: [detectCircularPlugin()],
      outdir: "./dist",
    });

    assert.equal(result.errors.length, 1);
    assert.equal(result.warnings.length, 0);
  });

  test("should only warn about circular dependencies", async () => {
    const result = await build({
      entryPoints: ["./_test-folder_/index.js"],
      bundle: true,
      plugins: [
        detectCircularPlugin({
          logLevel: "warn",
        }),
      ],
      outdir: "./dist",
    });

    assert.equal(result.errors.length, 0);
    assert.equal(result.warnings.length, 1);
  });
});
