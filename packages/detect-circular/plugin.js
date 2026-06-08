import { parseDependencyTree, parseCircular, prettyCircular } from "dpdm";
import pkg from "./package.json" with { type: 'json' };

const defaultOptions = {
  logLevel: "error",
};

/**
 * Circular dependencies plugin
 *
 * This plugins use [dpdm](https://github.com/acrazing/dpdm) in order to detect
 * circular dependencies on build.
 * It return a warning or error message if circular dependencies are detected.
 *
 * @param {Object}              [options]  - Options for the plugin.
 * @param {'warn' | 'error'}    [options.logLevel="errors"] - The log level to use when circular dependencies are detected.
 * @param {RegExp}              [options.exclude] - A regular expression uses to exclude module names from circular dependency detection.
 */
export function detectCircularPlugin(options) {
  const { logLevel, exclude } = { ...defaultOptions, ...options };

  return {
    name: pkg.name,
    setup(build) {
      const { entryPoints, tsconfig, absWorkingDir } = build.initialOptions;

      if (
        !entryPoints ||
        !Array.isArray(entryPoints) ||
        entryPoints.length === 0
      ) {
        throw new Error(
          "[circular-dependencies] entryPoints must be a non-empty array of string or { in: string, out: string }"
        );
      }

      /**
       * Ww assume the entryPoints is a non-empty array
       * of string or { in: string, out: string }
       */
      const entries = entryPoints.map((entry) => {
        if (typeof entry === "object") {
          return entry.in;
        }

        return entry;
      });

      build.onEnd(async (result) => {
        const dependencyTree = await parseDependencyTree(entries, {
          ...(tsconfig ? { tsconfig } : {}),
          ...(exclude ? { exclude } : {}),
        });

        const circularDependencies = parseCircular(dependencyTree);

        if (circularDependencies.length > 0) {
          const messagesType = logLevel === "error" ? "errors" : "warnings";

          /**
           * generate messages in the esbuild format
           */
          const message = prettyCircular(circularDependencies);

          const esbuildMessage = {
            text: `[circular-dependencies] found circular dependencies\n${message}`,
          };

          /**
           * Save them in the esbuild report
           */
          result[messagesType] = [
            ...(result[messagesType] ?? []),
            esbuildMessage,
          ];

          /**
           * Format and log the messages
           */
          const formattedMessages = await build.esbuild.formatMessages(
            [esbuildMessage],
            {
              kind: logLevel === "error" ? "error" : "warning",
              color: true,
              terminalWidth: process.stdout.columns,
            }
          );

          /**
           * Log the formatted messages
           */
          formattedMessages.forEach((msg) => console[logLevel](msg));

          return;
        }

        /**
         * Log in green a success message if there are no circular dependencies
         */
        console.info(
          "\x1b[32m%s\x1b[0m",
          "\n[circular-dependencies] free of circular dependencies\n"
        );
      });
    },
  };
}

export default detectCircularPlugin;
