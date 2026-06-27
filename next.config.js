/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["bcryptjs"],
  experimental: {
    useLightningcss: false,
  },
};

module.exports = nextConfig;
