/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // For Vercel deployment
  output: 'standalone',
}

module.exports = nextConfig
