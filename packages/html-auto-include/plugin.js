import { Window } from 'happy-dom';
import fs from 'node:fs/promises'
import path from 'path';
import { fileURLToPath } from 'url';

import pkg from "./package.json" with {type: 'json'};
import { dynamicImportsFromMeta } from './dynamic-imports-from-meta.js';


/**
 * Setup __dirname
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize happy-dom
 */
const window = new Window();
const document = window.document;

/**
 * Setup constants
 */
const CSS_EXTENSION = '.css';
const JS_EXTENSION = '.js';
const CHUNK_FILE_PREFIX = 'chunk-';

const defaultOptions = {
  html: 'index.html',
  outfile: undefined,
  pathPrefix: './',
  scriptTagAttribute: {},
  base: undefined
}

/**
 * This plugin include automatically entrypoints reference to HTML passed.
 * By default, it will try to include index.html in the current folder.
 * THe plugin will scan the final build and add `<script>` tags to the HTML
 * with the reference to the generated files.
 * It also support `<link>` tags for stylesheets.
 *
 * @param {*}      options
 * @param {string} [options.html='index.html'] - The HTML file to include references to. Defaults to `'index.html'`.
 * @param {string} [options.outfile] - The output file to write the modified HTML to. Defaults is equal to html filename`.
 * @param {string} [options.pathPrefix='./'] - The path prefix to use for the generated files. Defaults to `'./'`.
 * @param {object} [options.scriptTagAttribute={}] - The attributes to add to the `<script>` tags. Defaults to `{}`.
 * @param {string} [options.base] - The base URL to use for the generated files.
 *
 * @returns
 */
export function htmlAutoIncludePlugin(options = {}) {
  const currentOptions = { ...defaultOptions, ...options }

  return {
    name: pkg.name,
    async setup(build) {
      // activate metafile
      build.initialOptions.metafile = true;

      // extract the template
      const template = await fs.readFile(path.join(__dirname, currentOptions.html), 'utf8');

      if (!template) throw new Error(`Could not read HTML template: ${currentOptions.html}`);

      document.documentElement.innerHTML = template;

      const documentBody = document.body;
      const documentHead = document.head;

      build.onEnd(async (result) => {
        const dynamicImports = dynamicImportsFromMeta(result?.metafile)
        const outputFiles = Object.keys(result?.metafile?.outputs ?? {});

        for (const file of outputFiles) {
          const isDynamicImport = dynamicImports.includes(file);
          const isChunkFile = file.includes(CHUNK_FILE_PREFIX);

          /**
           * Dynamic import and chunk files are imported by javascript
           */
          if (isDynamicImport || isChunkFile) continue;

          /**
           * Setup the correct filename
           */
          const fileName = file.split('/').pop();
          const prefixedFilename = `${currentOptions.pathPrefix}/${fileName}`.replaceAll('//', '/');

          /**
           * Add a script element for each JS file
           */
          if (fileName.endsWith(JS_EXTENSION)) {
            const element = document.createElement('script')
            element.src = prefixedFilename;

            for (const [attribute, value] of Object.entries(currentOptions.scriptAttributes ?? {})) {
              element.setAttribute(attribute, value);
            }

            documentBody.appendChild(element);
            continue;
          }

          /**
           * Add a link element for each CSS file
           */
          if (fileName.endsWith(CSS_EXTENSION)) {
            const element = document.createElement('link')
            element.rel = 'stylesheet';
            element.href = prefixedFilename;
            documentHead.appendChild(element);
            continue;
          }
        }

        /**
         * Add a base element if a base URL is provided
         */
        if(currentOptions.base) {
          const baseElement = document.createElement('base')
          baseElement.setAttribute('href', currentOptions.base)

          document.documentElement.setAttribute('base', currentOptions.base);
          documentHead.prepend(baseElement)

        }

        /**
         * Add the resulting HTML to the output file
         */
        const resultedHtml = document.documentElement.outerHTML;
        const outputFile = currentOptions.outfile || currentOptions.html.split('/').pop();

        await fs.writeFile(path.join(build.initialOptions.outdir, outputFile), resultedHtml)
      });
    },
  }
}

export default htmlAutoIncludePlugin;
