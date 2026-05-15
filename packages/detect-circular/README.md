# Detect Circular Dependencies Plugin
## @esbuild-toolbox/detect-circular

A small plugin that detects circular dependencies in your project.

## Installation

#### npm
```bash
npm install @esbuild-toolbox/detect-circular
```

#### yarn
```bash
yarn add @esbuild-toolbox/detect-circular
```

#### pnpm
```bash
pnpm add @esbuild-toolbox/detect-circular
```

## Usage

```js
import { detectCircular } from '@esbuild-toolbox/detect-circular';

esbuild.build({
  plugins: [detectCircular()],
});
```

## Options

- `logLevel`: The log level of the detected circular dependencies. Defaults to `'error'`.
  - `'error'`: Only log error messages.
  - `'warn'`: Log warning messages.

- `exclude`: A regular expression pattern to exclude files from the circular dependency detection. Defaults to `undefined`.

## Acknowledgements

- [dpdm](https://github.com/depd/dpdm)
