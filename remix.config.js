/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.test.{ts,tsx}"],
  serverModuleFormat: "cjs",
  browserNodeBuiltinsPolyfill: { modules: { path: true , buffer: true,  crypto: true,  os: true  , util: true, fs: true },  }
};
