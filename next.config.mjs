/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      // {
      //   source: '/',
      //   destination: '/swap',
      //   permanent: false,
      // },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        port: "",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        port: "",
        hostname: "vphdxociarqnaxj6.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
