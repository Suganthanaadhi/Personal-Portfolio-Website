/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turn off React Strict Mode in dev to avoid double-invoked effects while iterating
  reactStrictMode: false,
  output: 'export',
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
  // rewrites removed: now /me.jpg will serve the real file from public/
}

module.exports = nextConfig