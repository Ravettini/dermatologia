/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@derma/shared"],
  poweredByHeader: false,
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
