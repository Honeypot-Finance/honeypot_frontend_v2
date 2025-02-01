/** @type {import('next').NextConfig} */
import path from "path";
const isDev = process.env.NODE_ENV === "development";
const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "styled-components": path.resolve(
        "node_modules/styled-components/dist/styled-components.esm.js"
      ), // alias for styled-components ESM build
    };
    return config;
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
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        port: "",
        hostname: "vphdxociarqnaxj6.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        port: "",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "http",
        port: "3000",
        hostname: "localhost",
      },
      {
        protocol: "http",
        port: "5000",
        hostname: "localhost",
      },
      {
        protocol: "https",
        port: "",
        hostname: "honeypotfinance.xyz",
      },
      {
        protocol: "https",
        port: "",
        hostname: "*.honeypotfinance.xyz",
      },
      {
        protocol: "https",
        port: "",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        port: "",
        hostname: "cdn.alphakek.ai",
      },
    ],
    domains: ["cdn.alphakek.ai"],
  },

  transpilePackages: [
    "@usecapsule/rainbowkit-wallet",
    "@usecapsule/rainbowkit",
    "@usecapsule/core-components",
    "@usecapsule/react-components",
    "@usecapsule/react-sdk",
    "@usecapsule/core-sdk",
    "@usecapsule/web-sdk",
    "@usecapsule/wagmi-v2-integration",
    "@usecapsule/viem-v2-integration",
    "@usecapsule/react-common",
    "styled-components",
  ],
};

export default nextConfig;
