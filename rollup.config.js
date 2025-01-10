import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import replace from "@rollup/plugin-replace";

const packageJson = require("./package.json");

export default [
  {
    input: "src/core/index.ts",
    output: [
      {
        file: packageJson.exports["."].require,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.exports["."].import,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      terser(),
    ],
  },
  {
    input: "src/core/index.ts",
    output: [{ 
      file: "dist/types/types.d.ts",
      format: "es",
      sourcemap: true,
    }],
    plugins: [dts.default()],
  },
  {
    input: "src/core/index.ts", // Entry point of your library
    output: [
      {
        file: "dist/PinsAndCurvesServer/PinsAndCurvesServer.umd.js", // The bundled file
        format: "umd", // Universal Module Definition (UMD)
        name: "PinsAndCurvesServer", // Name of the global variable in the browser
      },
    ],
    plugins: [resolve(), commonjs(), 
      replace({
        "process.env.NODE_ENV": JSON.stringify("production"), // Replace with "production" or "development"
        preventAssignment: true, // Required to suppress warnings
      }),
      typescript({ tsconfig: "./tsconfig.json" }),
      terser()],
  },

  // DEFAULT EXTENSION BUNDLE
  {
    input: "src/defaultExtensions/index.ts",
    output: [
      {
        file: packageJson.exports["./defaultExtensionBundle"].require,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.exports["./defaultExtensionBundle"].import,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      terser(),
    ],
  },
];