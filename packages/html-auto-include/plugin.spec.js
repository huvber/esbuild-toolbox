import fs from "node:fs/promises";
import { test, describe, afterEach } from "node:test";
import assert from "node:assert";

import { build } from "esbuild";
import { htmlAutoIncludePlugin } from "./plugin.js";

describe("htmlAutoIncludePlugin", async () => {
  afterEach(async () => {
    await fs.rm("./dist", { recursive: true, force: true });
  });

  test("should include the index.js and index.css", async () => {
    await build({
      entryPoints: ["./_test-folder_/index.js"],
      bundle: true,
      plugins: [
        htmlAutoIncludePlugin({
          html: "_test-folder_/index.html",
        }),
      ],
      outdir: "./dist",
    });

    const generatedHtml = await fs.readFile("./dist/index.html", "utf-8");
    console.log(generatedHtml);
    assert.match(generatedHtml, /<script src=".\/index.js"><\/script>/);
    assert.match(generatedHtml, /<link rel="stylesheet" href=".\/index.css">/);
  });

  test("should generate in another file", async () => {
    await build({
      entryPoints: ["./_test-folder_/index.js"],
      bundle: true,
      plugins: [
        htmlAutoIncludePlugin({
          html: "_test-folder_/index.html",
          outfile: "foo.html",
        }),
      ],
      outdir: "./dist",
    });

    const generatedHtml = await fs.readFile("./dist/foo.html", "utf-8");

    assert.match(generatedHtml, /<script src=".\/index.js"><\/script>/);
    assert.match(generatedHtml, /<link rel="stylesheet" href=".\/index.css">/);
  });

  test("should add the defined attributes to the script tag", async () => {
    await build({
      entryPoints: ["./_test-folder_/index.js"],
      bundle: true,
      plugins: [
        htmlAutoIncludePlugin({
          html: "_test-folder_/index.html",
          scriptAttributes: {
            module: true,
          },
        }),
      ],
      outdir: "./dist",
    });

    const generatedHtml = await fs.readFile("./dist/index.html", "utf-8");

    assert.match(
      generatedHtml,
      /<script src=".\/index.js" module="true"><\/script>/
    );
  });

  test("should add the correct prefix", async () => {
    await build({
      entryPoints: ["./_test-folder_/index.js"],
      bundle: true,
      plugins: [
        htmlAutoIncludePlugin({
          html: "_test-folder_/index.html",
          pathPrefix: "./foo",
        }),
      ],
      outdir: "./dist",
    });

    const generatedHtml = await fs.readFile("./dist/index.html", "utf-8");

    assert.match(generatedHtml, /<script src=".\/foo\/index.js"><\/script>/);
    assert.match(
      generatedHtml,
      /<link rel="stylesheet" href=".\/foo\/index.css">/
    );
  });

  test("should add the correct base", async () => {
    await build({
      entryPoints: ["./_test-folder_/index.js"],
      bundle: true,
      plugins: [
        htmlAutoIncludePlugin({
          html: "_test-folder_/index.html",
          base: "/foo",
        }),
      ],
      outdir: "./dist",
    });

    const generatedHtml = await fs.readFile("./dist/index.html", "utf-8");

    assert.match(generatedHtml, /<base href="\/foo">/);
  });
});
