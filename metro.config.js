// Learn more: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Some dependencies (e.g. zustand) ship an ESM build that uses
// `import.meta.env`, which breaks the web bundle since it's served as a classic
// script. Disabling package-exports resolution makes Metro fall back to the
// CommonJS builds, which don't use `import.meta`.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
