/** @type {import('next').NextConfig} */

const nextConfig = {
  // output: 'export',
  sassOptions: {
    implementation: 'sass-embedded',
  },
  // basePath: '/out', // для GitHub Pages
  // assetPrefix: '/out', // для GitHub Pages
};

export default nextConfig;
