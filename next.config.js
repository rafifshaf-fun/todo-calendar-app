/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["bcryptjs", "pg"],
  experimental: {
    useLightningcss: false,
  },
};

module.exports = nextConfig;
