# HTML Auto include
## @esbuild-toolbox/html-auto-include

This package provides a utility that include automatically entrypoints reference to HTML passed. By default, it will try to include index.html in the current folder.
THe plugin will scan the final build and add `<script>` tags to the HTML with the reference to the generated files.
It also support `<link>` tags for stylesheets.

### Installation

#### npm
```bash
npm install @esbuild-toolbox/html-auto-include
```

#### yarn
```bash
yarn add @esbuild-toolbox/html-auto-include
```

#### pnpm
```bash
pnpm add @esbuild-toolbox/html-auto-include
```

### Usage

Basic usage it will search for index.html in the current folder and add the reference to the generated files.

```js
import { htmlAutoIncludePlugin } from '@esbuild-toolbox/html-auto-include';

esbuild.build({
  plugins: [htmlAutoIncludePlugin()],
});
```

You can also pass a custom HTML file to include references to.

```js
esbuild.build({
  plugins: [htmlAutoIncludePlugin({ html: 'path/to/index.html' })],
});
```

### Options

- `html`: The path to the HTML file to include references to. Defaults to `index.html` in the current folder.
- `outfile`: The name of the output HTML file. Defaults to the value of `html`.
- `pathPrefix`: The path prefix to use for the generated files. Defaults to `./`.
- `scriptTagAttribute`: Attributes to add to the generated `<script>` tags. Defaults to `{}`.
- `base`: The base URL to use for the generated files. Defaults undefined

## Acknowledgements

- [happy-dom](https://github.com/capricorn86/happy-dom)
