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
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://api.huggingface.co https://huggingface.co;",
          },
        ],
      },
    ]
  },
  // rewrites removed: now /me.jpg will serve the real file from public/
}

module.exports = nextConfig