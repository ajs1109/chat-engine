/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" }
    ]
  },
  // Prevent stale "Failed to find Server Action" errors after redeployments.
  // Without this, proxies/CDNs cache the HTML with old build IDs and the browser
  // calls Server Action hashes that no longer exist on the server.
  async headers() {
    return [
      {
        // Apply no-cache to all navigable pages; static assets under /_next/static
        // are content-hashed so they are safe to cache forever (handled by Next.js).
        source: "/((?!_next/static|_next/image|favicon\\.ico).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
