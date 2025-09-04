// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Common hostnames used by the CMSs you’ll test
      { protocol: "https", hostname: "**.ctfassets.net" },   // Contentful
      { protocol: "https", hostname: "images.ctfassets.net" },
      { protocol: "https", hostname: "**.storyblok.com" },   // Storyblok
      { protocol: "https", hostname: "cdn.builder.io" },     // Builder.io
      { protocol: "https", hostname: "**.sanity.io" },       // Sanity
      { protocol: "https", hostname: "images.prismic.io" },  // Prismic
      { protocol: "https", hostname: "**" }                  // fallback for POC
    ],
  },
};

export default nextConfig;
