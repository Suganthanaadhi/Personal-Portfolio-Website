/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use an alternate distDir to avoid Windows locks on .next/trace
  distDir: '.next-dev',
  // Turn off React Strict Mode in dev to avoid double-invoked effects while iterating
  reactStrictMode: false,
  output: 'export',
  basePath: '/Personal-Portfolio-Website',
  images: { unoptimized: true },
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  async redirects() {
    return [
      {
        source: '/favicon.ico',
        destination: '/favicon.svg',
        permanent: false,
      },
    ]
  },
  // rewrites removed: now /me.jpg will serve the real file from public/
}

module.exports = nextConfig