module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // react-native-reanimated (pulled in by @react-navigation/bottom-tabs)
    // needs this to compile its "worklets" — without it, the app can crash
    // at runtime on-device with something like "Reanimated failed to create
    // a worklet". Must stay last in the plugins list.
    plugins: ['react-native-worklets/plugin'],
  };
};
