/** @type {import('next').NextConfig} */

const nextConfig = {
  // output: 'export',
  sassOptions: {
    implementation: 'sass-embedded',
  },
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: '/wp-content/uploads/:path*',
        destination: 'https://api.beastfpv.ru/wp-content/uploads/:path*',
      },
    ];
  },
  // basePath: '/out', // для GitHub Pages
  // assetPrefix: '/out', // для GitHub Pages
};

export default nextConfig;
