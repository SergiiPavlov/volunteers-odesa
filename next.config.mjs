import createNextIntlPlugin from 'next-intl/plugin';

// IMPORTANT: Pass the path to your i18n config file (CommonJS-compatible)
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {protocol: 'https', hostname: 'picsum.photos'},
      {protocol: 'https', hostname: 'images.unsplash.com'}
    ]
  },
  experimental: {typedRoutes: true}
};

export default withNextIntl(nextConfig);
