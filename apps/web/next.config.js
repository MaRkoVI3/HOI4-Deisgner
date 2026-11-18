/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@generalstaff/ui-components', '@generalstaff/shared-types', '@generalstaff/calculation-engine'],
  experimental: {
    optimizePackageImports: ['@generalstaff/ui-components', 'lucide-react'],
  },
};

module.exports = nextConfig;