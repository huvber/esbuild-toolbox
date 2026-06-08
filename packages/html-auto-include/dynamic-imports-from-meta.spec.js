import { test, after, describe } from "node:test";
import assert from "node:assert";
import { dynamicImportsFromMeta } from "./dynamic-imports-from-meta.js";

const metafile = {
  outputs: {
    "dist/index.js": {
      imports: [
        { kind: "dynamic-import", path: "path/to/dynamic-import.js" },
        {
          kind: "other",
          path: "path/to/other.js",
        },
      ],
    },
  },
};

describe("dynamicImportsFromMeta", () => {
  test("should return dynamic imports from meta file", () => {
    const result = dynamicImportsFromMeta(metafile);
    assert.deepStrictEqual(result, ["path/to/dynamic-import.js"]);
  });

  test("should return empty array if no dynamic imports", () => {
    const result = dynamicImportsFromMeta({});
    assert.deepStrictEqual(result, []);
  });

  test("should return empty array if no output", () => {
    const result = dynamicImportsFromMeta({ outputs: {} });
    assert.deepStrictEqual(result, []);
  });
});
