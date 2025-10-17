/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable image optimization for simplicity
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

