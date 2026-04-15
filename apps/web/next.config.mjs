/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@derma/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
