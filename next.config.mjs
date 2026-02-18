/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['openweathermap.org', 'lh3.googleusercontent.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
