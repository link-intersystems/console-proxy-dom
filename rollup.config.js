import nodeResolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import replace from "@rollup/plugin-replace";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

import pkg from "./package.json";

const extensions = [".ts"];
const noDeclarationFiles = { compilerOptions: { declaration: false } };

const makeExternalPredicate = (externalArr) => {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join("|")})($|/)`);
  return (id) => pattern.test(id);
};

const config = [
  // CommonJS
  {
    input: "src/index.ts",
    output: {
      file: "lib/console-redirection.js",
      format: "cjs",
      indent: false,
    },
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ]),
    plugins: [
      nodeResolve({
        extensions,
      }),
      typescript({ useTsconfigDeclarationDir: true }),
      babel({
        extensions,
        babelHelpers: "bundled",
      }),
    ],
  },

  // ES
  {
    input: "src/index.ts",
    output: { file: "es/console-redirection.js", format: "es", indent: false },
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ]),
    plugins: [
      nodeResolve({
        extensions,
      }),
      typescript({ tsconfigOverride: noDeclarationFiles }),
      babel({
        extensions,
        babelHelpers: "bundled",
      }),
    ],
  },

  // ES for Browsers
  {
    input: "src/index.ts",
    output: { file: "es/console-redirection.mjs", format: "es", indent: false },
    plugins: [
      nodeResolve({
        extensions,
      }),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      typescript({ tsconfigOverride: noDeclarationFiles }),
      babel({
        extensions,
        exclude: "node_modules/**",
        skipPreflightCheck: true,
        babelHelpers: "bundled",
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },

  // UMD Development
  {
    input: "src/index.ts",
    output: {
      file: "dist/console-redirection.js",
      format: "umd",
      name: "Console Redirection",
      indent: false,
    },
    plugins: [
      nodeResolve({
        extensions,
      }),
      typescript({ tsconfigOverride: noDeclarationFiles }),
      babel({
        extensions,
        exclude: "node_modules/**",
        babelHelpers: "bundled",
      }),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify("development"),
      }),
    ],
  },

  // UMD Production
  {
    input: "src/index.ts",
    output: {
      file: "dist/console-redirection.min.js",
      format: "umd",
      name: "Console Redirection",
      indent: false,
    },
    plugins: [
      nodeResolve({
        extensions,
      }),
      typescript({ tsconfigOverride: noDeclarationFiles }),
      babel({
        extensions,
        exclude: "node_modules/**",
        skipPreflightCheck: true,
        babelHelpers: "bundled",
      }),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },
];

export default config;
