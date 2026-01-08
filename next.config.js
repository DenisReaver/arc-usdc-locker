const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  webpack: (config) => {
    config.resolve.alias['@react-native-async-storage/async-storage'] = require.resolve('./src/shim-async-storage.js');
    return config;
  },
};

module.exports = nextConfig;