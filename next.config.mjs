/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Genera la carpeta /out
  basePath: '/mycollection',
  images: {
    unoptimized: true, // Crucial para que funcionen las carátulas offline
  },
};

export default nextConfig;