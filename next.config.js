/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Note: headers() doesn't work with static export on GitHub Pages
  // CSP is set via meta tag in layout.tsx instead
  // rewrites removed: now /me.jpg will serve the real file from public/
}

module.exports = nextConfig